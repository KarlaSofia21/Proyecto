// app/api/enlace-temporal/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendMagicLink } from '@/app/lib/email'; // ← Este ahora es Nodemailer

export async function POST(request: Request) {
  try {
    const { correo } = await request.json();

    if (!correo) {
      return NextResponse.json({ success: false, message: 'Correo requerido' }, { status: 400 });
    }

    const result = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
    }

    const usuario_id = result.rows[0].id;
    const token = uuidv4();
    const expiracion = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      `INSERT INTO enlaces_temporales (usuario_id, token, expiracion, usado)
       VALUES ($1, $2, $3, FALSE)`,
      [usuario_id, token, expiracion]
    );

    const enlace = `${process.env.NEXT_PUBLIC_URL}/login/login-temporal/verify?token=${token}`;

    // Envía con Nodemailer
    await sendMagicLink(correo, enlace);

    return NextResponse.json({ success: true, message: 'Enlace enviado a tu correo' });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error al enviar el correo: ' + error.message },
      { status: 500 }
    );
  }
}