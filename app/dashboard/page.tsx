"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PinSetupForm from "../src/componentes/PinSetupForm";

export default function DashboardPage() {
  const [correoUsuario, setCorreoUsuario] = useState<string | null>(null);
  const [tienePin, setTienePin] = useState<boolean | null>(null);
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
  const [verificandoPinActual, setVerificandoPinActual] = useState(false);
  const [pinActual, setPinActual] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  useEffect(() => {
    const correoGuardado = localStorage.getItem("usuarioCorreo") || 
                           localStorage.getItem("correoUsuario");
    
    if (correoGuardado) {
      setCorreoUsuario(correoGuardado);
      verificarPin(correoGuardado);
    } else {
      // Si no hay correo (no inició sesión), redirigir al login
      router.push("/");
    }
  }, [router]);

  const verificarPin = async (correo: string) => {
    try {
      const res = await fetch(`/api/pin?correo=${encodeURIComponent(correo)}`);
      const data = await res.json();
      
      if (data.success) {
        setTienePin(data.hasPin);
        // Si no tiene PIN, mostrar automáticamente el formulario
        if (!data.hasPin) {
          setMostrarConfiguracion(true);
          setMensaje("Para mayor seguridad, te recomendamos configurar un PIN.");
        }
      }
    } catch (error) {
      console.error("Error al verificar PIN:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuarioCorreo");
    localStorage.removeItem("correoUsuario");
    localStorage.removeItem("userId");
    router.push("/");
  };

  const handlePinConfigurado = () => {
    setTienePin(true);
    setMostrarConfiguracion(false);
    setVerificandoPinActual(false);
    setPinActual("");
    setMensaje("✓ PIN configurado exitosamente");
    // Actualizar el estado después de un momento
    if (correoUsuario) {
      verificarPin(correoUsuario);
    }
  };

  const verificarPinActual = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    if (!pinActual) {
      setMensaje("Por favor ingresa tu PIN actual");
      return;
    }

    try {
      const res = await fetch("/api/pin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoUsuario, pin: pinActual }),
      });

      const data = await res.json();

      if (data.success) {
        // PIN actual correcto, mostrar formulario para nuevo PIN
        setVerificandoPinActual(false);
        setMostrarConfiguracion(true);
        setPinActual("");
      } else {
        setMensaje(data.message || "PIN actual incorrecto");
        setPinActual("");
      }
    } catch (error) {
      setMensaje("Error al verificar el PIN");
    }
  };

  const handleCambiarPin = () => {
    if (tienePin) {
      // Si tiene PIN, primero verificar el actual
      setVerificandoPinActual(true);
      setMostrarConfiguracion(false);
      setMensaje("");
    } else {
      // Si no tiene PIN, mostrar directamente el formulario de configuración
      setMostrarConfiguracion(true);
    }
  };

  // Si está verificando el PIN actual (para cambiar PIN)
  if (verificandoPinActual && correoUsuario) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 py-12">
        <div className="w-full max-w-md px-4">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-rose-700 text-center mb-6">
              Verificar PIN Actual
            </h2>
            <p className="text-rose-600 text-center mb-6">
              Por favor ingresa tu PIN actual para continuar
            </p>
            
            <form onSubmit={verificarPinActual} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="PIN actual"
                value={pinActual}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setPinActual(value);
                }}
                required
                className="w-full p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white"
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105"
              >
                Verificar
              </button>
            </form>

            {mensaje && (
              <p className={`mt-4 text-center font-medium ${
                mensaje.includes("incorrecto") ? "text-red-600" : "text-rose-700"
              }`}>
                {mensaje}
              </p>
            )}

            <button
              onClick={() => {
                setVerificandoPinActual(false);
                setPinActual("");
                setMensaje("");
              }}
              className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si está mostrando la configuración de PIN (nuevo PIN)
  if (mostrarConfiguracion && correoUsuario) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 py-12">
        <div className="w-full max-w-md px-4">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-rose-700 text-center mb-6">
              {tienePin ? "Nuevo PIN" : "Configurar PIN"}
            </h2>
            <PinSetupForm 
              correo={correoUsuario} 
              onPinConfigured={handlePinConfigurado}
            />
            <button
              onClick={() => {
                setMostrarConfiguracion(false);
                setVerificandoPinActual(false);
              }}
              className="mt-6 w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300">
      <h1 className="text-4xl font-bold text-rose-700 mb-4">
        Bienvenida, {correoUsuario || "Usuario"} 
      </h1>
      <p className="text-lg text-rose-600 mb-12">
        Has iniciado sesión correctamente.
      </p>

      <div className="flex flex-col space-y-4 w-full max-w-sm">
        <button
          onClick={handleCambiarPin}
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          {tienePin ? "Cambiar PIN" : "Configurar PIN"}
        </button>

        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Cerrar sesión
        </button>
      </div>

      {mensaje && (
        <p className={`mt-6 text-center font-medium ${
          mensaje.startsWith("✓") ? "text-green-600" : "text-rose-700"
        }`}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
