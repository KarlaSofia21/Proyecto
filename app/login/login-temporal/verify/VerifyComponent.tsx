// app/login/login-temporal/verify/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyMagicLink() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Enlace inválido');
      setLoading(false);
      return;
    }

    const validarToken = async () => {
      try {
        const res = await fetch('/api/validar-enlace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (data.success) {
          localStorage.setItem('usuarioCorreo', data.correo);
          localStorage.setItem('usuarioId', data.usuario_id.toString());
          router.push('/dashboard');
        } else {
          setError(data.message || 'Enlace inválido o expirado');
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    validarToken();
  }, [token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-600 font-medium">Validando tu enlace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
        {error ? (
          <>
            <p className="text-red-600 font-bold text-xl mb-4">{error}</p>
            <a href="/login/login-temporal" className="text-rose-600 hover:underline">
              ← Solicitar nuevo enlace
            </a>
          </>
        ) : (
          <p className="text-green-600 font-bold text-xl">¡Acceso concedido!</p>
        )}
      </div>
    </div>
  );
}