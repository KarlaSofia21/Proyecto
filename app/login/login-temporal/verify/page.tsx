// app/login/login-temporal/verify/page.tsx  <--- ¡ARCHIVO ORIGINAL MODIFICADO!

import { Suspense } from 'react';
import VerifyComponent from './VerifyComponent'; // <-- Importa tu nuevo componente

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      <Suspense fallback={<p className="text-lg">Cargando...</p>}>
        <VerifyComponent />
      </Suspense>
    </div>
  );
}