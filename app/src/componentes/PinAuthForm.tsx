"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PinSetupForm from "./PinSetupForm";

export default function PinAuthForm() {
  const [correo, setCorreo] = useState("");
  const [pin, setPin] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
  const [verificandoPin, setVerificandoPin] = useState(false);
  const router = useRouter();

  // Verificar si el usuario tiene PIN cuando ingresa el correo
  const verificarPinExistente = async (email: string) => {
    if (!email || !email.includes("@")) return;
    
    setVerificandoPin(true);
    try {
      const res = await fetch(`/api/pin?correo=${encodeURIComponent(email)}`);
      const data = await res.json();
      
      if (data.success && !data.hasPin) {
        // No tiene PIN configurado, mostrar formulario de configuración
        setMostrarConfiguracion(true);
      }
    } catch (error) {
      console.error("Error al verificar PIN:", error);
    } finally {
      setVerificandoPin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    if (!correo || !pin) {
      setMensaje("Por favor completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, pin }),
      });

      const data = await res.json();
      
      if (data.success) {
        // Guardar información del usuario en localStorage
        localStorage.setItem("correoUsuario", data.usuario.correo);
        localStorage.setItem("usuarioCorreo", data.usuario.correo);
        localStorage.setItem("userId", data.usuario.id.toString());
        router.push("/bienvenida");
      } else {
        // Si el error es que no tiene PIN, mostrar formulario de configuración
        if (data.message?.includes("No tienes un PIN configurado")) {
          setMostrarConfiguracion(true);
        } else {
          setMensaje(data.message || "Error al iniciar sesión");
        }
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handlePinConfigurado = () => {
    // Después de configurar el PIN, volver al formulario de login
    // para que el usuario ingrese el PIN que acaba de configurar
    setMostrarConfiguracion(false);
    setPin(""); // Limpiar el campo PIN para que el usuario lo ingrese
    setMensaje("✓ PIN configurado exitosamente. Por favor ingresa tu PIN para iniciar sesión.");
  };

  // Si no tiene PIN configurado, mostrar formulario de configuración
  if (mostrarConfiguracion) {
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

          {/* Área de contenido */}
          <div className="flex-1 bg-gray-800 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Configurar PIN
              </h1>
              <p className="text-gray-400 text-sm mb-8">
                Para usar el inicio de sesión con PIN, primero necesitas configurarlo.
              </p>
              
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Usuario
                </label>
                <input
                  type="email"
                  placeholder="Ingresa tu usuario"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    verificarPinExistente(e.target.value);
                  }}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <PinSetupForm 
                correo={correo} 
                onPinConfigured={handlePinConfigurado}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="text-center">
                <a
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Iniciar sesión con contraseña
                </a>
              </div>
              <div className="text-center text-xs text-gray-500 space-y-1 mt-4">
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
              Iniciar sesión con PIN
            </h1>
            <p className="text-gray-400 text-sm mb-8">
              Acceso exclusivo para empleados autorizados
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
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    verificarPinExistente(e.target.value);
                  }}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Ingresa tu PIN"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setPin(value);
                  }}
                  required
                  className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading || verificandoPin}
                className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>

            {mensaje && (
              <p className={`mt-4 text-center text-sm font-medium ${
                mensaje.includes("exitoso") || mensaje.includes("configurado") 
                  ? "text-green-400" 
                  : "text-red-400"
              }`}>
                {mensaje}
              </p>
            )}

            <div className="mt-6 space-y-3">
              <div className="text-center">
                <a
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Iniciar sesión con contraseña
                </a>
              </div>
              <div className="text-center">
                <a
                  href="/registro"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  ¿No tienes cuenta? Regístrate aquí
                </a>
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

