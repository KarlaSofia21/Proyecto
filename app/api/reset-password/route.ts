// app/api/reset-password/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { decrypt } from '@/app/lib/encryption';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, nuevaPassword } = await request.json();

    if (!token || !nuevaPassword || nuevaPassword.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Datos inválidos' },
        { status: 400 }
      );
    }

    let decryptedToken: string;
    try {
      decryptedToken = decrypt(token);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT et.*, u.id as usuario_id 
       FROM enlaces_temporales et
       JOIN usuarios u ON et.usuario_id = u.id
       WHERE et.token = $1
         AND et.usado = FALSE
         AND et.expiracion > NOW() AT TIME ZONE 'UTC'
         AND et.tipo = 'reset'`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Enlace inválido o expirado' },
        { status: 400 }
      );
    }

    const enlace = result.rows[0];
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    await pool.query(
      'UPDATE usuarios SET password = $1 WHERE id = $2',
      [hashedPassword, enlace.usuario_id]
    );

    await pool.query('UPDATE enlaces_temporales SET usado = TRUE WHERE id = $1', [enlace.id]);

    return NextResponse.json({
      success: true,
      message: '¡Contraseña actualizada! Puedes iniciar sesión.',
    });
  } catch (error: any) {
    console.error('Error en reset-password:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}