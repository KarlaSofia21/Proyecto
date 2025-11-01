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
        router.push("/dashboard");
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300">
        <h2 className="text-4xl font-bold text-rose-600 mb-6 drop-shadow-md">
          Configurar PIN
        </h2>
        <p className="text-rose-700 mb-6 text-center max-w-md">
          Para usar el inicio de sesión con PIN, primero necesitas configurarlo.
        </p>
        
        <div className="w-full max-w-md">
          <div className="mb-4">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                verificarPinExistente(e.target.value);
              }}
              required
              className="w-full p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white/50 backdrop-blur-sm shadow-sm"
            />
          </div>
          
          <PinSetupForm 
            correo={correo} 
            onPinConfigured={handlePinConfigurado}
          />
        </div>

        <div className="mt-6 text-sm text-gray-700">
          <a
            href="/login"
            className="text-rose-600 font-semibold hover:underline"
          >
            Iniciar sesión con contraseña
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300">
      <h2 className="text-4xl font-bold text-rose-600 mb-10 drop-shadow-md">
        Iniciar sesión con PIN
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-5 w-full max-w-sm text-center"
      >
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => {
            setCorreo(e.target.value);
            verificarPinExistente(e.target.value);
          }}
          required
          className="p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white/50 backdrop-blur-sm shadow-sm"
        />

        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="PIN"
          value={pin}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setPin(value);
          }}
          required
          className="p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-pink-500 text-gray-700 bg-white/50 backdrop-blur-sm shadow-sm"
        />

        <button
          type="submit"
          disabled={loading || verificandoPin}
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Iniciando sesión..." : "Ingresar con PIN"}
        </button>
      </form>

      {mensaje && (
        <p className={`mt-5 text-center font-medium ${
          mensaje.includes("exitoso") || mensaje.includes("configurado") 
            ? "text-green-600" 
            : "text-rose-700"
        }`}>
          {mensaje}
        </p>
      )}

      <div className="mt-8 text-sm text-gray-700">
        <a
          href="/login"
          className="text-rose-600 font-semibold hover:underline"
        >
          Iniciar sesión con contraseña
        </a>
      </div>
    </div>
  );
}

