// app/registro/page.tsx
import RegistroForm from '../src/componentes/RegistroForm';

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-pink-300 px-4">
      <RegistroForm />
    </div>
  );
}