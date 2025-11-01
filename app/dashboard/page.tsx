// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [correoUsuario, setCorreoUsuario] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  // Estados para el formulario de tarjeta
  const [titular, setTitular] = useState("");
  const [numero, setNumero] = useState("");
  const [expiracion, setExpiracion] = useState("");
  const [cvv, setCvv] = useState("");

  // Solo un useEffect para comprobar la sesión
  useEffect(() => {
    const correo = localStorage.getItem("usuarioCorreo");
    const id = localStorage.getItem("usuarioId");

    if (!correo || !id) {
      router.push("/login/login-temporal"); // o "/login" si quieres el form
    } else {
      setCorreoUsuario(correo);
      setUsuarioId(Number(id));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("usuarioCorreo");
    localStorage.removeItem("usuarioId");
    // Solo una redirección al salir
    router.push("/login/login-temporal"); 
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return { cleaned, formatted };
  };

  const guardarTarjeta = async () => {
    if (!titular || !numero || !expiracion || !cvv || !usuarioId) {
      setMensaje({ text: "Completa todos los campos", type: "error" });
      return;
    }

    const datosTarjeta = JSON.stringify({ titular, numero, expiracion, cvv });

    const res = await fetch("/api/guardar-datos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: usuarioId,
        tipo_dato: "tarjeta",
        valor: datosTarjeta,
      }),
    });

    const data = await res.json();
    setMensaje({
      text: data.success ? "Tarjeta guardada" : data.message || "Error",
      type: data.success ? "success" : "error",
    });

    if (data.success) {
      setTitular("");
      setNumero("");
      setExpiracion("");
      setCvv("");
    }
  };

  const verTarjeta = async () => {
    if (!usuarioId) return;

    const res = await fetch("/api/obtener-datos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: usuarioId,
        tipo_dato: "tarjeta",
      }),
    });

    const data = await res.json();
    if (data.success && data.dato) {
      const tarjeta = JSON.parse(data.dato);
      alert(
        `Titular: ${tarjeta.titular}\n` +
        `Número: **** **** **** ${tarjeta.numero.slice(-4)}\n` +
        `Expira: ${tarjeta.expiracion}\n` +
        `CVV: ${tarjeta.cvv}`
      );
    } else {
      setMensaje({ text: "No hay tarjeta guardada", type: "error" });
    }
  };

  // Muestra 'null' (nada) mientras comprueba la sesión y redirige
  if (!correoUsuario || !usuarioId) {
    return null; 
  }

  // Solo hay UN return principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-rose-800">Bienvenida,</h1>
          <p className="text-2xl font-medium text-rose-700 mt-1">{correoUsuario}</p>
          <p className="text-sm text-rose-600 mt-2">
            Requerimos tus datos de tarjeta para futuras compras
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-rose-100">
          <h2 className="text-2xl font-bold text-rose-800 mb-6 text-center">
            Ingresa los datos de tu tarjeta
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Titular de la tarjeta"
              value={titular}
              onChange={(e) => setTitular(e.target.value)}
              className="w-full p-4 text-lg text-gray-900 border border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-300 focus:border-rose-400 focus:outline-none transition-all"
            />

            <input
              type="text"
              placeholder="Número de tarjeta"
              value={formatCardNumber(numero).formatted}
              onChange={(e) => setNumero(formatCardNumber(e.target.value).cleaned)}
              className="w-full p-4 text-lg text-gray-900 border border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-300 focus:border-rose-400 focus:outline-none transition-all"
            />

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="MM/AA"
                value={expiracion}
                onChange={(e) => setExpiracion(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                className="w-full p-4 text-lg text-gray-900 border border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-300 focus:border-rose-400 focus:outline-none transition-all"
              />
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                maxLength={3}
                className="w-full p-4 text-lg text-gray-900 border border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-300 focus:border-rose-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={guardarTarjeta}
              className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold py-3 rounded-xl hover:from-rose-500 hover:to-pink-500 transition-all duration-200"
            >
              Guardar
            </button>
            <button
              onClick={verTarjeta}
              className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold py-3 rounded-xl hover:from-rose-500 hover:to-pink-500 transition-all duration-200"
            >
              Ver
            </button>
          </div>

          {mensaje && (
            <p
              className={`mt-4 text-center font-semibold text-lg ${
                mensaje.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {mensaje.text}
            </p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-8 bg-rose-700 hover:bg-rose-800 text-white font-bold py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}