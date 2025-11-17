// app/pin-reset/page.tsx
'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PinReset() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaPassword: password }),
      });
      const data = await res.json();
      setMensaje(data.message);
      if (data.success) {
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch {
      setMensaje('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="text-center p-8 text-red-600">Enlace inválido</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 p-4">
      <h2 className="text-3xl font-bold text-rose-600 mb-8">Nueva contraseña</h2>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={4}
          disabled={loading}
          className="w-full p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white/50 backdrop-blur-sm shadow-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </form>

      {mensaje && (
        <p className={`mt-6 text-center text-sm font-medium ${mensaje.includes('éxito') ? 'text-green-600' : 'text-red-600'}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
}