// app/page.tsx

import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige al usuario a la página de login
  redirect('/login');
}