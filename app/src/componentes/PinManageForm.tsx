"use client";
import { useState, useEffect } from "react";

interface PinManageFormProps {
  correo: string;
  onPinConfigurado?: () => void;
  onClose?: () => void;
}

export default function PinManageForm({ correo, onPinConfigurado, onClose }: PinManageFormProps) {
  const [tienePin, setTienePin] = useState<boolean | null>(null);
  const [cargando, setCargando] = useState(false);
  const [pinActual, setPinActual] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modo, setModo] = useState<"verificar" | "configurar">("verificar");

  // Verificar si el usuario tiene PIN configurado
  useEffect(() => {
    const verificarPin = async () => {
      try {
        const res = await fetch(`/api/pin?correo=${encodeURIComponent(correo)}`);
        const data = await res.json();
        
        if (data.success) {
          setTienePin(data.hasPin);
          setModo(data.hasPin ? "verificar" : "configurar");
        }
      } catch (error) {
        console.error("Error al verificar PIN:", error);
        setMensaje("Error al verificar PIN");
      }
    };

    verificarPin();
  }, [correo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    // Si tiene PIN y está en modo verificar, validar PIN actual
    if (modo === "verificar" && tienePin) {
      if (!/^\d{4,6}$/.test(pinActual)) {
        setMensaje("El PIN actual debe tener entre 4 y 6 dígitos");
        return;
      }

      // Verificar PIN actual con la API
      try {
        const res = await fetch("/api/pin-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, pin: pinActual }),
        });

        const data = await res.json();

        if (data.success) {
          // PIN actual correcto, pasar a modo configurar
          // NO limpiar pinActual aquí, lo necesitamos para enviarlo al servidor
          setModo("configurar");
          setMensaje("PIN actual verificado. Ahora ingresa tu nuevo PIN.");
        } else {
          setMensaje(data.message || "PIN actual incorrecto");
        }
      } catch (error) {
        setMensaje("Error al verificar PIN actual");
      }
      return;
    }

    // Validar nuevo PIN
    if (!/^\d{4,6}$/.test(pin)) {
      setMensaje("El PIN debe tener entre 4 y 6 dígitos numéricos");
      return;
    }

    if (pin !== confirmPin) {
      setMensaje("Los PINs no coinciden");
      return;
    }

    setCargando(true);

    try {
      const res = await fetch("/api/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo,
          pin,
          pinActual: tienePin ? pinActual : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMensaje(`✓ ${data.message || 'PIN actualizado exitosamente'}`);
        setPin("");
        setConfirmPin("");
        setPinActual("");
        // Limpiar el mensaje después de mostrar el éxito
        if (onPinConfigurado) {
          setTimeout(() => {
            onPinConfigurado();
            setModo("verificar"); // Resetear al modo inicial
          }, 2000);
        }
      } else {
        setMensaje(data.message || "Error al configurar el PIN");
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  if (tienePin === null) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">
          {tienePin && modo === "verificar" 
            ? "Cambiar PIN" 
            : tienePin && modo === "configurar"
            ? "Nuevo PIN"
            : "Configurar PIN"}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {tienePin && modo === "verificar" && (
        <p className="text-sm text-gray-400 mb-4">
          Para cambiar tu PIN, primero ingresa tu PIN actual:
        </p>
      )}

      {tienePin && modo === "configurar" && (
        <p className="text-sm text-gray-400 mb-4">
          PIN actual verificado. Ingresa tu nuevo PIN:
        </p>
      )}

      {!tienePin && (
        <p className="text-sm text-gray-400 mb-4">
          Configura un PIN de 4 a 6 dígitos para poder iniciar sesión con él:
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {tienePin && modo === "verificar" && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              PIN Actual
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Ingresa tu PIN actual"
              value={pinActual}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPinActual(value);
              }}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {modo === "configurar" && (
          <>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {tienePin ? "Nuevo PIN (4-6 dígitos)" : "PIN (4-6 dígitos)"}
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder={tienePin ? "Nuevo PIN" : "Ingresa tu PIN"}
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setPin(value);
                }}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirmar {tienePin ? "Nuevo " : ""}PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder={tienePin ? "Confirma tu nuevo PIN" : "Confirma tu PIN"}
                value={confirmPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setConfirmPin(value);
                }}
                required
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {cargando
            ? "Procesando..."
            : modo === "verificar"
            ? "Verificar PIN"
            : tienePin
            ? "Actualizar PIN"
            : "Configurar PIN"}
        </button>

        {mensaje && (
          <p
            className={`text-center text-sm font-medium ${
              mensaje.startsWith("✓")
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}

