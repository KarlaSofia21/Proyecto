// app/api/pin/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcryptjs';

// POST - Configurar o actualizar PIN
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

    // Verificar que el usuario existe
    const checkUser = await pool.query(
      'SELECT id FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (checkUser.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Hashear PIN (usando bcrypt con salt rounds)
    const hashedPin = await bcrypt.hash(pin, 10);

    // Actualizar o insertar PIN
    // Usamos INSERT ... ON CONFLICT para manejar tanto inserción como actualización
    // Si la columna pin no existe, se puede usar UPDATE simple
    await pool.query(
      'UPDATE usuarios SET pin = $1 WHERE correo = $2',
      [hashedPin, correo]
    );

    return NextResponse.json({
      success: true,
      message: 'PIN configurado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al configurar PIN:', error);
    
    // Si el error es porque la columna pin no existe, sugerir migración
    if (error.message?.includes('column') && error.message?.includes('pin')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error: La columna PIN no existe en la base de datos. Se requiere una migración.' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error del servidor al configurar PIN' },
      { status: 500 }
    );
  }
}

// GET - Verificar si el usuario tiene PIN configurado (opcional, útil para el frontend)
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

    const result = await pool.query(
      'SELECT pin FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const hasPin = !!result.rows[0].pin;

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

