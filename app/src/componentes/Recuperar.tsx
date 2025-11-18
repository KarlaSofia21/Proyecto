// app/recuperar/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    try {
      const res = await fetch('/api/solicitar-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();
      setMensaje(data.message || 'Revisa tu correo');
    } catch {
      setMensaje('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 p-4">
      <h2 className="text-3xl font-bold text-rose-600 mb-8">Recuperar contraseña</h2>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <input
          type="email"
          placeholder="Tu correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          disabled={loading}
          className="w-full p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white/50 backdrop-blur-sm shadow-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>

      {mensaje && (
        <p className="mt-6 text-center text-sm font-medium text-green-600">
          {mensaje}
        </p>
      )}

      <a href="/login" className="mt-6 text-rose-600 hover:underline text-sm">
        ← Volver al login
      </a>
    </div>
  );
}