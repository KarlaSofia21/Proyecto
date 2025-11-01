// app/login/login-temporal/page.tsx
'use client';

import { useState } from 'react';

export default function LoginTemporalPage() {
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/enlace-temporal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('¡Enlace enviado! Revisa tu correo: ' + correo);
      } else {
        setMessage(data.message || 'Error al enviar el enlace');
      }
    } catch (err) {
      setMessage('Error de conexión. Revisa tu internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-rose-600 mb-6">
          Enlace Temporal
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-400"
              placeholder="tu@uthh.edu.mx"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 rounded-full transition-transform transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        {message && (
          <p className={`mt-5 text-center font-medium ${message.includes('enviado') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-rose-600 text-sm font-semibold hover:underline"
          >
            ← Volver al login
          </a>
        </div>
      </div>
    </div>
  );
}