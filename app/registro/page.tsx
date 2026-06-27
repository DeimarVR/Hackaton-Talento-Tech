'use client';

// ============================================================
// /registro — Página de registro de nueva cuenta
// ============================================================

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/useAuth';
import RegistroForm from '../ui/auth/RegistroForm';

export default function RegistroPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, loading, error } = useAuth();

  const handleRegistro = async (nombre: string, email: string, password: string, role: string) => {
    const ok = await signUpWithEmail(email, password, nombre, role);
    if (ok) router.push('/onboarding');
  };

  const handleGoogle = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Panel izquierdo — Branding ──────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #041C4A 0%, #0A2E73 60%, #1E40AF 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2563EB, #1E40AF)' }}>
              D
            </div>
            <div>
              <span className="text-white text-lg font-black tracking-tight">Datacheck</span>
              <span className="text-[#60A5FA] text-lg font-black tracking-tight"> AI</span>
            </div>
          </div>
          <p className="mt-2 text-[#93C5FD] text-xs font-mono tracking-widest uppercase">
            Cumplimiento Ley 1581 de 2012
          </p>
        </div>

        {/* Pasos del proceso */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-black text-white">
            Empieza en<br />
            <span className="text-[#60A5FA]">3 simples pasos</span>
          </h2>
          <div className="space-y-5">
            {[
              { num: '01', title: 'Crea tu cuenta',    desc: 'Registro gratuito, sin tarjeta de crédito' },
              { num: '02', title: 'Registra tu empresa', desc: 'Nombre, NIT, sector y tamaño' },
              { num: '03', title: 'Inicia el diagnóstico', desc: 'Obtén tu score de cumplimiento al instante' },
            ].map(({ num, title, desc }, i) => (
              <div key={i} className="flex gap-4 animate-fade-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}>
                <span className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5">
                  {num}
                </span>
                <div>
                  <p className="text-white font-bold text-sm">{title}</p>
                  <p className="text-[#93C5FD] text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
            <span className="text-[#34D399] text-sm">🔒</span>
            <span className="text-white/80 text-xs font-mono">Plataforma segura · Datos cifrados</span>
          </div>
        </div>
      </div>

      {/* ── Panel derecho — Formulario ───────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 bg-[#F8FAFC] overflow-y-auto">
        {/* Logo mobile */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black shadow-lg"
            style={{ background: 'linear-gradient(135deg, #041C4A, #0A2E73)' }}>
            D
          </div>
          <div>
            <span className="text-[#0F172A] text-base font-black">Datacheck</span>
            <span className="text-[#2563EB] text-base font-black"> AI</span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto animate-fade-slide-up">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[#0F172A]">Crea tu cuenta gratis</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Comienza tu diagnóstico de cumplimiento de la Ley 1581
            </p>
          </div>

          <RegistroForm
            onSubmit={handleRegistro}
            onGoogle={handleGoogle}
            loading={loading}
            error={error}
          />

          <p className="mt-6 text-center text-sm text-[#64748B]">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-[#2563EB] font-semibold hover:text-[#1D4ED8] transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
