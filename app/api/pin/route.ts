// app/api/pin/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcryptjs';

// GET: Verificar si un usuario tiene PIN configurado
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const correo = searchParams.get('correo');

    if (!correo) {
      return NextResponse.json(
        { success: false, message: 'Correo es requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario y verificar si tiene PIN
    const result = await pool.query(
      'SELECT id, pin FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const usuario = result.rows[0];
    const hasPin = usuario.pin !== null && usuario.pin !== '';

    return NextResponse.json({
      success: true,
      hasPin,
    });
  } catch (error: any) {
    console.error('Error al verificar PIN:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

// POST: Crear o actualizar PIN
export async function POST(request: Request) {
  try {
    const { correo, pin, pinActual } = await request.json();

    if (!correo || !pin) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos' },
        { status: 400 }
      );
    }

    // Validar que el PIN tenga entre 4 y 6 dígitos numéricos
    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { success: false, message: 'El PIN debe tener entre 4 y 6 dígitos numéricos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe y obtener su PIN actual
    const checkUser = await pool.query(
      'SELECT id, pin FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (checkUser.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const usuario = checkUser.rows[0];
    const tienePin = usuario.pin !== null && usuario.pin !== '';

    // Si el usuario ya tiene PIN, debe proporcionar el PIN actual para cambiarlo
    if (tienePin) {
      if (!pinActual) {
        return NextResponse.json(
          { success: false, message: 'Debes ingresar tu PIN actual para cambiarlo' },
          { status: 400 }
        );
      }

      // Validar PIN actual
      if (!/^\d{4,6}$/.test(pinActual)) {
        return NextResponse.json(
          { success: false, message: 'El PIN actual debe tener entre 4 y 6 dígitos numéricos' },
          { status: 400 }
        );
      }

      // Verificar que el PIN actual sea correcto
      const pinActualValido = await bcrypt.compare(pinActual, usuario.pin);
      
      if (!pinActualValido) {
        return NextResponse.json(
          { success: false, message: 'PIN actual incorrecto' },
          { status: 401 }
        );
      }

      // Verificar que el nuevo PIN sea diferente
      const mismoPin = await bcrypt.compare(pin, usuario.pin);
      if (mismoPin) {
        return NextResponse.json(
          { success: false, message: 'El nuevo PIN debe ser diferente al actual' },
          { status: 400 }
        );
      }
    }

    // Hashear el nuevo PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Actualizar o insertar PIN
    await pool.query(
      'UPDATE usuarios SET pin = $1 WHERE correo = $2',
      [hashedPin, correo]
    );

    return NextResponse.json({
      success: true,
      message: tienePin ? 'PIN actualizado exitosamente' : 'PIN configurado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al configurar PIN:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

