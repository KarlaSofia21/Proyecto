// app/api/login/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { correo, password } = await request.json();

    if (!correo || !password) {
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

    // Comparar contraseña hasheada
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (passwordValida) {
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
      return NextResponse.json(
        { success: false, message: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}