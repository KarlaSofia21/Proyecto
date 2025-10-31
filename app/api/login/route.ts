// app/api/login/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    // Extraer los datos del cuerpo de la petición
    const { correo, password } = await request.json();

    // Buscar el usuario por correo
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    // Por ahora comparamos texto plano (luego lo haremos con bcrypt)
    if (usuario.password === password) {
      return NextResponse.json({ success: true, message: 'Inicio de sesión exitoso' });
    } else {
      return NextResponse.json({ success: false, message: 'Contraseña incorrecta' });
    }
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ success: false, message: 'Error en el servidor' });
  }
}
