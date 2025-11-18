// app/api/solicitar-reset/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { encrypt } from '@/app/lib/encryption';
import { sendResetLink } from '@/app/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { correo } = await request.json();

    if (!correo || !correo.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Correo inválido' },
        { status: 400 }
      );
    }

    const userResult = await pool.query(
      'SELECT id FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: true, message: 'Si el correo existe, se envió un enlace.' }
      );
    }

    const usuario = userResult.rows[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const token = encrypt(rawToken);
    const expiracion = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `INSERT INTO enlaces_temporales 
       (usuario_id, token, expiracion, usado, tipo) 
       VALUES ($1, $2, $3, FALSE, 'reset')`,
      [usuario.id, token, expiracion]
    );

    const enlace = `${process.env.NEXT_PUBLIC_URL}/pin-reset?token=${encodeURIComponent(token)}`;
    await sendResetLink(correo, enlace);

    return NextResponse.json({
      success: true,
      message: 'Si el correo existe, se envió un enlace de recuperación.',
    });
  } catch (error: any) {
    console.error('Error en solicitar reset:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}