// app/api/guardar-datos/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { encrypt } from '@/app/lib/encryption';

export async function POST(request: Request) {
  try {
    const { usuario_id, tipo_dato, valor } = await request.json();

    if (!usuario_id || !tipo_dato || !valor) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos' },
        { status: 400 }
      );
    }

    const valorCifrado = encrypt(valor);

    await pool.query(
      `INSERT INTO datos_sensibles (usuario_id, tipo_dato, valor_cifrado)
       VALUES ($1, $2, $3)`,
      [usuario_id, tipo_dato, valorCifrado]
    );

    return NextResponse.json({ success: true, message: 'Dato guardado cifrado' });
  } catch (error) {
    console.error('Error al cifrar:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno' },
      { status: 500 }
    );
  }
}