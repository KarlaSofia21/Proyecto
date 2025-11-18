// app/bienvenida/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PinManageForm from "../src/componentes/PinManageForm";

export default function BienvenidaPage() {
  const [correoUsuario, setCorreoUsuario] = useState<string | null>(null);
  const [mostrarPinModal, setMostrarPinModal] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const correo = localStorage.getItem("usuarioCorreo");
    
    if (!correo) {
      router.push("/login");
    } else {
      setCorreoUsuario(correo);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("usuarioCorreo");
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("correoUsuario");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  if (!correoUsuario) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 p-6">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-rose-800 mb-4 drop-shadow-md">
          Bienvenida, {correoUsuario}
        </h1>
        <p className="text-xl font-medium text-rose-700">
          Has iniciado sesión correctamente.
        </p>
        {mensajeExito && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {mensajeExito}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={() => setMostrarPinModal(true)}
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
        >
          Cambiar PIN
        </button>

        <button
          onClick={handleLogout}
          className="bg-rose-700 hover:bg-rose-800 text-white font-bold py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Modal para Cambiar PIN */}
      {mostrarPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <PinManageForm
              correo={correoUsuario}
              onPinConfigurado={() => {
                setMensajeExito("✓ PIN actualizado exitosamente en la base de datos");
                setMostrarPinModal(false);
                // Limpiar el mensaje después de 5 segundos
                setTimeout(() => {
                  setMensajeExito(null);
                }, 5000);
              }}
              onClose={() => {
                setMostrarPinModal(false);
                setMensajeExito(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

