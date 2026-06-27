'use client';

// ============================================================
// RegistroForm — Formulario de registro de nuevo usuario
// ============================================================

import { useState } from 'react';

interface RegistroFormProps {
  onSubmit: (nombre: string, email: string, password: string, role: string) => Promise<void>;
  onGoogle: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

function evaluarFortaleza(p: string): { nivel: number; label: string; color: string } {
  if (p.length === 0)  return { nivel: 0, label: '',         color: '#E2E8F0' };
  if (p.length < 6)   return { nivel: 1, label: 'Débil',    color: '#EF4444' };
  if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
    return { nivel: 2, label: 'Regular', color: '#F59E0B' };
  return { nivel: 3, label: 'Fuerte',  color: '#16A34A' };
}

export default function RegistroForm({ onSubmit, onGoogle, loading, error }: RegistroFormProps) {
  const [nombre,    setNombre]    = useState('');
  const [email,     setEmail]     = useState('');
  const [role,      setRole]      = useState('admin');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [touched,   setTouched]   = useState({ nombre: false, email: false, password: false, confirm: false });

  const emailValido     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValida  = password.length >= 6;
  const confirmaIgual   = password === confirm && confirm.length > 0;
  const nombreValido    = nombre.trim().length >= 2;
  const fortaleza       = evaluarFortaleza(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nombre: true, email: true, password: true, confirm: true });
    if (!nombreValido || !emailValido || !passwordValida || !confirmaIgual) return;
    await onSubmit(nombre.trim(), email, password, role);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="animate-scale-in flex items-start gap-3 px-4 py-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA]">
          <span className="text-[#EF4444] text-lg leading-none mt-0.5">⚠</span>
          <p className="text-sm text-[#EF4444] font-medium leading-snug">{error}</p>
        </div>
      )}

      {/* Nombre */}
      <div className="space-y-1.5">
        <label htmlFor="reg-nombre" className="block text-sm font-semibold text-[#0F172A]">
          Nombre completo
        </label>
        <input
          id="reg-nombre"
          type="text"
          autoComplete="name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, nombre: true }))}
          placeholder="Juan Pérez"
          className={`input-base w-full px-4 py-3 text-sm ${
            touched.nombre && !nombreValido ? 'border-[#EF4444]' : ''
          }`}
        />
        {touched.nombre && !nombreValido && (
          <p className="text-xs text-[#EF4444]">Ingrese al menos 2 caracteres</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="reg-email" className="block text-sm font-semibold text-[#0F172A]">
          Correo electrónico
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder="tucorreo@empresa.com"
          className={`input-base w-full px-4 py-3 text-sm ${
            touched.email && !emailValido ? 'border-[#EF4444]' : ''
          }`}
        />
        {touched.email && !emailValido && (
          <p className="text-xs text-[#EF4444]">Ingrese un correo electrónico válido</p>
        )}
      </div>

      {/* Rol de usuario */}
      <div className="space-y-1.5">
        <label htmlFor="reg-role" className="block text-sm font-semibold text-[#0F172A]">
          Rol en la plataforma
        </label>
        <select
          id="reg-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input-base w-full px-4 py-3 text-sm bg-white text-[#0F172A]"
        >
          <option value="admin">🛡️ Administrador (Acceso total)</option>
          <option value="evaluador">📊 Evaluador (Crear y ver diagnósticos)</option>
          <option value="auditor">🔍 Auditor (Solo lectura y reportes)</option>
        </select>
      </div>

      {/* Contraseña */}
      <div className="space-y-1.5">
        <label htmlFor="reg-password" className="block text-sm font-semibold text-[#0F172A]">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            placeholder="Mínimo 6 caracteres"
            className={`input-base w-full px-4 py-3 pr-12 text-sm ${
              touched.password && !passwordValida ? 'border-[#EF4444]' : ''
            }`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors text-sm p-1"
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>
        {/* Indicador de fortaleza */}
        {password.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1 h-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex-1 rounded-full transition-all duration-300"
                  style={{ backgroundColor: fortaleza.nivel >= n ? fortaleza.color : '#E2E8F0' }}
                />
              ))}
            </div>
            <p className="text-xs" style={{ color: fortaleza.nivel > 0 ? fortaleza.color : '#64748B' }}>
              {fortaleza.label && `Contraseña ${fortaleza.label.toLowerCase()}`}
            </p>
          </div>
        )}
      </div>

      {/* Confirmar contraseña */}
      <div className="space-y-1.5">
        <label htmlFor="reg-confirm" className="block text-sm font-semibold text-[#0F172A]">
          Confirmar contraseña
        </label>
        <input
          id="reg-confirm"
          type={showPass ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          placeholder="Repite tu contraseña"
          className={`input-base w-full px-4 py-3 text-sm ${
            touched.confirm && !confirmaIgual ? 'border-[#EF4444]' : ''
          } ${touched.confirm && confirmaIgual ? 'border-[#16A34A]' : ''}`}
        />
        {touched.confirm && !confirmaIgual && (
          <p className="text-xs text-[#EF4444]">Las contraseñas no coinciden</p>
        )}
        {touched.confirm && confirmaIgual && (
          <p className="text-xs text-[#16A34A]">✓ Las contraseñas coinciden</p>
        )}
      </div>

      {/* Botón */}
      <button
        id="btn-registro-email"
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creando cuenta...
          </>
        ) : (
          'Crear cuenta gratuita'
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#E2E8F0]" />
        <span className="text-xs text-[#64748B] font-medium">o regístrate con</span>
        <div className="flex-1 h-px bg-[#E2E8F0]" />
      </div>

      {/* Google */}
      <button
        id="btn-registro-google"
        type="button"
        onClick={onGoogle}
        disabled={loading}
        className="w-full py-3 px-4 flex items-center justify-center gap-3 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-sm font-semibold text-[#0F172A] transition-all duration-200 hover:border-[#2563EB] hover:shadow-sm disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
        </svg>
        Continuar con Google
      </button>

      <p className="text-center text-xs text-[#64748B] leading-relaxed">
        Al registrarte, aceptas nuestros{' '}
        <span className="text-[#2563EB] cursor-pointer hover:underline">Términos de Uso</span>
        {' '}y nuestra{' '}
        <span className="text-[#2563EB] cursor-pointer hover:underline">Política de Privacidad</span>.
      </p>
    </form>
  );
}
