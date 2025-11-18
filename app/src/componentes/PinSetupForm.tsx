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
    <div className="mt-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-rose-700 mb-4 text-center">
        Configurar PIN
      </h2>
      
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-700 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full p-3 rounded-full border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-700 bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Configurando..." : "Configurar PIN"}
        </button>

        {mensaje && (
          <p
            className={`text-center font-medium ${
              mensaje.startsWith("✓")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}

