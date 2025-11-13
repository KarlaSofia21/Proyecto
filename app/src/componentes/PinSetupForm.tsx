"use client";
import { useState } from "react";

interface PinSetupFormProps {
  correo: string;
  onPinConfigured?: () => void;
}

export default function PinSetupForm({ correo, onPinConfigured }: PinSetupFormProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    // Validar que el PIN tenga entre 4 y 6 dígitos numéricos
    if (!/^\d{4,6}$/.test(pin)) {
      setMensaje("El PIN debe tener entre 4 y 6 dígitos numéricos");
      return;
    }

    if (pin !== confirmPin) {
      setMensaje("Los PINs no coinciden");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, pin }),
      });

      const data = await res.json();
      
      if (data.success) {
        setMensaje("✓ PIN configurado exitosamente");
        setPin("");
        setConfirmPin("");
        if (onPinConfigured) {
          onPinConfigured();
        }
      } else {
        setMensaje(data.message || "Error al configurar el PIN");
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4"
      >
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            PIN (4-6 dígitos)
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

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Confirmar PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Confirma tu PIN"
            value={confirmPin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setConfirmPin(value);
            }}
            required
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? "Configurando..." : "Configurar PIN"}
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

