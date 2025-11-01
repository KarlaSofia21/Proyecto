"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [correoUsuario, setCorreoUsuario] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const correoGuardado = localStorage.getItem("usuarioCorreo");
    if (correoGuardado) {
      setCorreoUsuario(correoGuardado);
    } else {
      // Si no hay correo (no inició sesión), redirigir al login
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("usuarioCorreo");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-rose-100">
      <h1 className="text-4xl font-bold text-rose-700">
         Bienvenida, {correoUsuario || "Usuario"} 
      </h1>
      <p className="mt-4 text-lg text-rose-600">
        Has iniciado sesión correctamente.
      </p>

      <button
        onClick={handleLogout}
        className="mt-8 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-transform transform hover:scale-105"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
