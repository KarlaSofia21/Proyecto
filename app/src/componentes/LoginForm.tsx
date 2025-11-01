"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });

    const data = await res.json();
    setMensaje(data.message);

     if (data.success) {
       localStorage.setItem("usuarioCorreo", correo);
      setTimeout(() => {
        router.push("/dashboard"); 
      }, 1000); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300">
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
          className="p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white/50 backdrop-blur-sm shadow-sm"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white/50 backdrop-blur-sm shadow-sm"
        />

        <button
          type="submit"
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Ingresar
        </button>
      </form>

      {mensaje && (
        <p className="mt-5 text-center text-rose-700 font-medium">{mensaje}</p>
      )}

      <div className="mt-8 text-sm text-gray-700">
        <a
          href="/registro"
          className="text-rose-600 font-semibold hover:underline"
        >
          Crear cuenta
        </a>{" "}
        ·{" "}
        <a
          href="/recuperar"
          className="text-rose-600 font-semibold hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <a
          href="/pin-login"
          className="text-rose-600 font-semibold hover:underline"
        >
          Iniciar sesión con PIN
        </a>
      </div>
    </div>
  );
}
