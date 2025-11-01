// app/api/pin-login/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { correo, pin } = await request.json();

    if (!correo || !pin) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos: correo y PIN son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de PIN (debe ser numérico y tener entre 4 y 6 dígitos)
    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { success: false, message: 'El PIN debe tener entre 4 y 6 dígitos numéricos' },
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

    // Verificar si el usuario tiene PIN configurado
    if (!usuario.pin) {
      return NextResponse.json(
        { success: false, message: 'No tienes un PIN configurado. Por favor configúralo primero.' },
        { status: 400 }
      );
    }

    // Comparar PIN hasheado
    const pinValido = await bcrypt.compare(pin, usuario.pin);

    if (pinValido) {
      return NextResponse.json({
        success: true,
        message: 'Inicio de sesión con PIN exitoso',
        usuario: {
          id: usuario.id,
          correo: usuario.correo,
          fecha_registro: usuario.fecha_registro,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'PIN incorrecto' },
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

