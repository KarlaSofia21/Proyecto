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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenida, {correoUsuario}
            </h1>
            <p className="text-gray-400 text-sm">
              Has iniciado sesión correctamente.
            </p>
            {mensajeExito && (
              <div className="mt-4 bg-green-900/50 border border-green-500 text-green-400 px-4 py-2 rounded-lg text-sm">
                {mensajeExito}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMostrarPinModal(true)}
              className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200"
            >
              Cambiar PIN
            </button>

            <button
              onClick={handleLogout}
              className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Modal para Cambiar PIN */}
      {mostrarPinModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
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

