// app/api/pin-login/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcryptjs';

const MAX_INTENTOS = 3;
const TIEMPO_BLOQUEO_MINUTOS = 15; // Tiempo de bloqueo en minutos

export async function POST(request: Request) {
  try {
    const { correo, pin } = await request.json();

    if (!correo || !pin) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const usuario = result.rows[0];

    // Verificar si tiene PIN configurado
    if (!usuario.pin || usuario.pin === '') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No tienes un PIN configurado. Por favor configura uno primero.' 
        },
        { status: 400 }
      );
    }

    // Verificar si la cuenta está bloqueada
    if (usuario.cuenta_bloqueada && usuario.fecha_bloqueo) {
      const fechaBloqueo = new Date(usuario.fecha_bloqueo);
      const ahora = new Date();
      const minutosTranscurridos = (ahora.getTime() - fechaBloqueo.getTime()) / (1000 * 60);

      // Si han pasado más de 15 minutos, desbloquear la cuenta
      if (minutosTranscurridos >= TIEMPO_BLOQUEO_MINUTOS) {
        await pool.query(
          'UPDATE usuarios SET cuenta_bloqueada = FALSE, intentos_fallidos = 0, fecha_bloqueo = NULL WHERE id = $1',
          [usuario.id]
        );
      } else {
        const minutosRestantes = Math.ceil(TIEMPO_BLOQUEO_MINUTOS - minutosTranscurridos);
        return NextResponse.json(
          { 
            success: false, 
            message: `Cuenta bloqueada. Intenta nuevamente en ${minutosRestantes} minuto(s).` 
          },
          { status: 423 } // 423 Locked
        );
      }
    }

    // Comparar PIN hasheado
    const pinValido = await bcrypt.compare(pin, usuario.pin);

    if (pinValido) {
      // Login exitoso: resetear intentos fallidos
      await pool.query(
        'UPDATE usuarios SET intentos_fallidos = 0, cuenta_bloqueada = FALSE, fecha_bloqueo = NULL WHERE id = $1',
        [usuario.id]
      );

      return NextResponse.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        usuario: {
          id: usuario.id,
          correo: usuario.correo,
          fecha_registro: usuario.fecha_registro,
        },
      });
    } else {
      // PIN incorrecto: incrementar intentos fallidos
      const nuevosIntentos = (usuario.intentos_fallidos || 0) + 1;
      let cuentaBloqueada = false;
      let fechaBloqueo = null;

      // Si alcanzó el máximo de intentos, bloquear la cuenta
      if (nuevosIntentos >= MAX_INTENTOS) {
        cuentaBloqueada = true;
        fechaBloqueo = new Date();
      }

      await pool.query(
        'UPDATE usuarios SET intentos_fallidos = $1, cuenta_bloqueada = $2, fecha_bloqueo = $3 WHERE id = $4',
        [nuevosIntentos, cuentaBloqueada, fechaBloqueo, usuario.id]
      );

      if (cuentaBloqueada) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Has excedido el número máximo de intentos. Tu cuenta ha sido bloqueada por ${TIEMPO_BLOQUEO_MINUTOS} minutos.` 
          },
          { status: 423 } // 423 Locked
        );
      }

      const intentosRestantes = MAX_INTENTOS - nuevosIntentos;
      return NextResponse.json(
        { 
          success: false, 
          message: `PIN incorrecto. Te quedan ${intentosRestantes} intento(s).` 
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error en pin-login:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

