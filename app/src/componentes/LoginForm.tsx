// src/componentes/LoginForm.tsx
"use client";

import { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (data.success) {
        // --- CORRECCIÓN LÓGICA ---
        // 1. GUARDAR EN LOCALSTORAGE (UNA SOLA VEZ)
        localStorage.setItem("usuarioCorreo", data.usuario.correo);
        localStorage.setItem("usuarioId", data.usuario.id.toString());

        // 2. REDIRIGIR AL DESTINO FINAL (SOLO UNA VEZ)
        router.push("/dashboard");
        // Se eliminó la redirección duplicada a "/bienvenida"
        // y el guardado duplicado en localStorage.
        // --- FIN DE CORRECCIÓN LÓGICA ---

      } else {
        setMensaje(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setMensaje("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 p-4">
      <h2 className="text-4xl font-bold text-rose-600 mb-10 drop-shadow-md">
        Bienvenida
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-5 w-full max-w-sm text-center"
      >
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          disabled={loading}
          className="p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white/50 backdrop-blur-sm shadow-sm disabled:opacity-50"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className="p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white/50 backdrop-blur-sm shadow-sm disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"     >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      {mensaje && (
        <p className={`mt-5 text-center font-medium ${mensaje.includes("éxito") || mensaje.includes("Bienvenid") ? "text-green-600" : "text-red-600"}`}>
          {mensaje}
        </p>
      )}


   
      <div className="mt-8 text-sm text-gray-700 space-y-4 text-center">
        <div>
          
          <Link href="/registro" className="text-rose-600 font-semibold hover:underline">
            Crear cuenta
          </Link>
          {" · "}
          <Link href="/recuperar" className="text-rose-600 font-semibold hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="border-t border-rose-200 pt-4">
          <div className="flex justify-center gap-4">
            <Link
              href="/login/login-temporal"
              className="text-rose-600 font-semibold hover:underline text-sm"
            >
              Ingresar con enlace temporal
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/login/pin"
              className="text-rose-600 font-semibold hover:underline text-sm"
            >
              Iniciar sesión con PIN
            </Link>
          </div>
        </div>
      </div>
      

=======
     
      <div className="mt-8 text-sm text-gray-700 space-y-4 text-center">
        <div>

          <Link href="/registro" className="text-rose-600 font-semibold hover:underline">
            Crear cuenta
          </Link>
          {" · "}
          <Link href="/recuperar" className="text-rose-600 font-semibold hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="border-t border-rose-200 pt-4">
          <div className="flex justify-center gap-4">
            <Link
              href="/login/login-temporal"
              className="text-rose-600 font-semibold hover:underline text-sm"
            >
              Ingresar con enlace temporal
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/login/pin"
              className="text-rose-600 font-semibold hover:underline text-sm"
            >
              Iniciar sesión con PIN
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}