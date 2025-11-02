// src/componentes/RegistroForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 className="text-3xl font-bold text-rose-600 mb-6 text-center">
        Crear Cuenta
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          disabled={loading}
          className="w-full p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white/50"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={4}
          disabled={loading}
          className="w-full p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white/50"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-full font-semibold text-white transition-all transform ${
            loading
              ? "bg-rose-400 cursor-not-allowed"
              : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg hover:scale-105"
          }`}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>

      {mensaje && (
        <p
          className={`mt-4 text-center font-medium ${
            mensaje.includes("exitoso") ? "text-green-600" : "text-red-600"
          }`}
        >
          {mensaje}
        </p>
      )}

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-rose-600 font-semibold hover:underline">
            Iniciar sesión
          </a>
        </p>
        <div className="flex justify-center space-x-3 text-xs">
          <a href="/login/login-temporal" className="text-rose-500 hover:underline">
            Con enlace temporal
          </a>
          <span className="text-gray-400">·</span>
          <a href="/login/pin" className="text-rose-500 hover:underline">
            Con PIN
          </a>
        </div>
      </div>
    </div>
  );
}