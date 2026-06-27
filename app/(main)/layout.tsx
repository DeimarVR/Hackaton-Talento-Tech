// ============================================================
// Layout autenticado — Sidebar + Área de contenido
// Aplica a: /dashboard y /dashboard/diagnostico
// ============================================================

import Sidebar from '../ui/shared/Sidebar';
import AuthGuard from '../ui/auth/AuthGuard';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        {/* ── Sidebar (fijo en desktop) ── */}
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar />
        </div>

        {/* ── Área de contenido ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header mobile con menú */}
          <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
                style={{ background: 'linear-gradient(135deg, #041C4A, #0A2E73)' }}
              >
                D
              </div>
              <span className="text-[#0F172A] text-sm font-black">Datacheck<span className="text-[#2563EB]"> AI</span></span>
            </div>
            {/* En mobile mostramos solo el contenido, sidebar se puede agregar con un drawer en el futuro */}
            <span className="text-xs text-[#64748B] font-mono bg-[#F1F5F9] px-2 py-1 rounded">
              Ley 1581
            </span>
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
