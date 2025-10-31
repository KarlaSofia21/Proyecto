// app/api/registro/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { correo, password } = await request.json();

    // Validaiones

    if (!correo || !password) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos' },
        { status: 400 }
      );
    }

    if (!correo.includes('@') || !correo.includes('.')) {
      return NextResponse.json(
        { success: false, message: 'Correo inválido' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 4 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const check = await pool.query(
      'SELECT 1 FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (check.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Este correo ya está registrado' },
        { status: 409 }
      );
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    await pool.query(
      'INSERT INTO usuarios (correo, password, fecha_registro) VALUES ($1, $2, NOW())',
      [correo, hashedPassword]
    );

    return NextResponse.json({
      success: true,
      message: '¡Registro exitoso! Ahora puedes iniciar sesión.',
    });

  } catch (error: any) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}