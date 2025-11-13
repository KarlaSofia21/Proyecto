// src/componentes/RegistroForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroForm() {
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
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (data.success) {
        setMensaje("¡Registro exitoso! Redirigiendo...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setMensaje(data.message || "Error al registrarse");
      }
    } catch (error) {
      setMensaje("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex">
        {/* Sidebar izquierdo */}
        <div className="w-1/3 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative hidden md:flex items-center justify-center p-8">
          <div className="relative">
            <div className="w-32 h-32 bg-blue-400 rounded-full shadow-2xl flex items-center justify-center relative">
              <div className="w-20 h-20 bg-blue-800 rounded-lg flex items-center justify-center relative">
                <span className="text-4xl font-bold text-blue-300">A</span>
                <svg 
                  className="w-8 h-8 text-blue-300 absolute -right-2 -top-2" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.3))' }}
                >
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Área de contenido - Formulario */}
        <div className="flex-1 bg-gray-800 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Registro
            </h1>
            <p className="text-gray-400 text-sm mb-8">
              Crea tu cuenta para acceder al sistema
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Usuario
                </label>
                <input
                  type="email"
                  placeholder="Ingresa tu usuario"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  disabled={loading}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </form>

            {mensaje && (
              <p className={`mt-4 text-center text-sm font-medium ${
                mensaje.includes("exitoso") ? "text-green-400" : "text-red-400"
              }`}>
                {mensaje}
              </p>
            )}

            <div className="mt-6 space-y-3">
              <div className="text-center">
                <Link 
                  href="/login" 
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  ¿Ya tienes cuenta? Inicia sesión aquí
                </Link>
              </div>
              <div className="text-center">
                <Link 
                  href="/login/pin" 
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Autenticarse por PIN
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="text-center text-xs text-gray-500 space-y-1">
              <div>
                <span>soporte@empresa.com</span>
                <span className="mx-2">·</span>
                <span>+52 77 11 89 12 65</span>
              </div>
              <div>
                © 2025 Empresa — Todos los derechos reservados
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}