'use client';

// ============================================================
// Sidebar — Navegación lateral azul marino
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEmpresa } from '../../../lib/empresa/useEmpresa';
import { useAuth } from '../../../lib/auth/useAuth';

const NAV_ITEMS = [
  { href: '/dashboard',             icon: '🏠', label: 'Dashboard' },
  { href: '/diagnostico',           icon: '📋', label: 'Nuevo Diagnóstico' },
  { href: '/onboarding',            icon: '🏢', label: 'Mi Empresa' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { empresa, empresas, activeNit, seleccionarEmpresa } = useEmpresa();
  const { user, signOut } = useAuth();

  const userName = user?.user_metadata?.full_name ?? 'Usuario Demo';
  const userRole = user?.user_metadata?.role ?? 'admin';

  return (
    <aside
      className="w-64 min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #041C4A 0%, #0A2E73 100%)',
      }}
    >
      {/* ── Logo ── */}
      <div className="px-6 pt-7 pb-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1E40AF)' }}
          >
            D
          </div>
          <div>
            <span className="text-white text-sm font-black tracking-tight">Datacheck</span>
            <span className="text-[#60A5FA] text-sm font-black tracking-tight"> AI</span>
            <p className="text-[9px] text-white/40 font-mono tracking-widest uppercase leading-none mt-0.5">
              Ley 1581 / 2012
            </p>
          </div>
        </Link>
      </div>

      {/* ── Selector de Empresas ── */}
      <div className="mx-4 mt-4 space-y-2">
        <div className="px-3 py-2.5 rounded-xl bg-white/8 border border-white/10">
          <label htmlFor="sidebar-empresa-select" className="block text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1">
            Organización Activa
          </label>
          {empresas.length > 0 ? (
            <select
              id="sidebar-empresa-select"
              value={activeNit ?? ''}
              onChange={(e) => seleccionarEmpresa(e.target.value)}
              className="w-full bg-[#0A2E73] text-white text-xs font-bold py-1 px-1.5 rounded border border-white/20 focus:outline-none focus:border-[#60A5FA] cursor-pointer"
            >
              {empresas.map((emp) => (
                <option key={emp.nit} value={emp.nit} className="bg-[#041C4A] text-white text-xs font-semibold">
                  {emp.nombre}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-white/60 font-semibold italic">Ninguna registrada</p>
          )}
          {empresa && (
            <p className="text-[10px] text-[#93C5FD] mt-1.5 font-mono truncate">
              NIT: {empresa.nit}
            </p>
          )}
        </div>
        
        {/* Botón registrar nueva empresa */}
        <Link
          href="/onboarding"
          className="flex items-center justify-center gap-1.5 mx-0.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-dashed border-white/20"
        >
          <span>➕</span>
          <span>Registrar Empresa</span>
        </Link>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Menú principal
        </p>
        {NAV_ITEMS.map(({ href, icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              <span>{label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              )}
            </Link>
          );
        })}

        <div className="pt-4 border-t border-white/10 mt-4 space-y-1">
          <p className="px-3 mb-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
            Recursos legales
          </p>
          <Link
            href="https://www.sic.gov.co/proteccion-de-datos-personales"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <span>⚖️</span>
            <span>SIC Colombia</span>
            <span className="ml-auto text-white/20 text-[10px]">↗</span>
          </Link>
          <Link
            href="https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=49981"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <span>📜</span>
            <span>Ley 1581 / 2012</span>
            <span className="ml-auto text-white/20 text-[10px]">↗</span>
          </Link>
        </div>
      </nav>

      {/* ── Footer del sidebar ── */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-all group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {userName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                userRole === 'admin' 
                  ? 'bg-blue-600/35 text-[#60A5FA]' 
                  : userRole === 'evaluador' 
                    ? 'bg-amber-600/35 text-[#F59E0B]' 
                    : 'bg-emerald-600/35 text-[#34D399]'
              }`}>
                {userRole === 'admin' ? '🛡️ Admin' : userRole === 'evaluador' ? '📊 Eval' : '🔍 Audit'}
              </span>
            </div>
          </div>
        </div>

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <span>🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
