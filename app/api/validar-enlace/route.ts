// app/api/validar-enlace/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token requerido' }, { status: 400 });
    }

    // app/api/validar-enlace/route.ts
const result = await pool.query(
  `SELECT et.*, u.correo 
   FROM enlaces_temporales et
   JOIN usuarios u ON et.usuario_id = u.id
   WHERE et.token = $1
     AND et.usado = FALSE
     AND et.expiracion > NOW() AT TIME ZONE 'UTC'`,
  [token]
);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Enlace inválido o expirado' }, { status: 400 });
    }

    const enlace = result.rows[0];

    // Marcar como usado
    await pool.query('UPDATE enlaces_temporales SET usado = TRUE WHERE id = $1', [enlace.id]);

    // Devolver datos esenciales
    return NextResponse.json({
      success: true,
      correo: enlace.correo,
      usuario_id: enlace.usuario_id,
    });
  } catch (error) {
    console.error('Error validando enlace:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}