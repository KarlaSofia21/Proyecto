// app/api/obtener-datos/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { decrypt } from '@/app/lib/encryption';

export async function POST(request: Request) {
  try {
    const { usuario_id, tipo_dato } = await request.json();

    const result = await pool.query(
      `SELECT valor_cifrado FROM datos_sensibles 
       WHERE usuario_id = $1 AND tipo_dato = $2 
       ORDER BY fecha_creacion DESC LIMIT 1`,
      [usuario_id, tipo_dato]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No encontrado' }
      );
    }

    const valorDescifrado = decrypt(result.rows[0].valor_cifrado);

    return NextResponse.json({ success: true, dato: valorDescifrado });
  } catch (error) {
    console.error('Error al descifrar:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno' },
      { status: 500 }
    );
  }
}