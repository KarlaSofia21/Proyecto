// app/lib/email.ts
import nodemailer from 'nodemailer';

// Crear transportador (solo una vez)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMagicLink(correo: string, enlace: string) {
  console.log('Intentando enviar email a:', correo);
  console.log('Enlace:', enlace);

  const mailOptions = {
    from: `"UTHH Acceso" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: 'Tu enlace de acceso - UTHH (Expira en 15 min)',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background: #fdf2f8; text-align: center;">
        <h2 style="color: #ec4899;">Acceso con un clic</h2>
        <p style="color: #555;">Hola! Este enlace <strong>expira en 15 minutos</strong>.</p>
        <div style="margin: 30px 0;">
          <a href="${enlace}" style="background: #ec4899; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">
            Iniciar sesión ahora
          </a>
        </div>
        <p style="color: #888; font-size: 12px;">
          Si no solicitaste esto, ignora este mensaje.<br>
          © UTHH - Sistema de Acceso
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado con Nodemailer! ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info)); // Solo en modo test
    return info;
  } catch (error: any) {
    console.error('Error al enviar con Nodemailer:', error.message);
    throw new Error(`Fallo al enviar email: ${error.message}`);
  }
}