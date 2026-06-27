'use client';

// ============================================================
// /dashboard — Panel principal con historial de diagnósticos
// ============================================================

import Link from 'next/link';
import { useEmpresa } from '../../../lib/empresa/useEmpresa';
import { useAuth } from '../../../lib/auth/useAuth';
import MetricCard from '../../ui/shared/MetricCard';
import type { NivelRiesgo } from '../../../lib/diagnostico/types';

const NIVEL_LABEL: Record<string, string> = {
  conforme:   'Conforme',
  en_proceso: 'En Proceso',
  critico:    'Crítico',
};

const NIVEL_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  conforme:   { bg: '#DCFCE7', color: '#16A34A', border: '#BBF7D0' },
  en_proceso: { bg: '#FEF3C7', color: '#F59E0B', border: '#FDE68A' },
  critico:    { bg: '#FEE2E2', color: '#EF4444', border: '#FECACA' },
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function DashboardPage() {
  const { empresa, historial } = useEmpresa();
  const { user } = useAuth();
  
  const userRole = user?.user_metadata?.role ?? 'admin';

  const ultimoDiagnostico = historial[0] ?? null;
  const totalDiagnosticos = historial.length;
  const brechasCriticas   = historial.filter((d) => d.nivelRiesgo === 'critico').length;
  const promedioScore     = historial.length > 0
    ? Math.round(historial.reduce((a, d) => a + d.scoreTotal, 0) / historial.length)
    : null;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* ── Banner de Auditoría ── */}
      {userRole === 'auditor' && (
        <div className="animate-scale-in flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-sm text-[#D97706] font-semibold shadow-sm">
          <span className="flex items-center gap-2">
            <span className="text-base">🔍</span>
            <span><strong>Modo Auditoría (Solo Lectura):</strong> Tienes permisos de visualización de reportes y diagnóstico. La creación y edición de datos está bloqueada.</span>
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-slide-up">
        <div>
          <p className="text-xs text-[#64748B] font-mono uppercase tracking-widest mb-1">
            Panel de Control
          </p>
          <h1 className="text-2xl font-black text-[#0F172A]">
            {empresa ? `Bienvenido, ${empresa.nombre}` : 'Dashboard'}
          </h1>
          {empresa && (
            <p className="text-sm text-[#64748B] mt-0.5">
              NIT {empresa.nit} · {empresa.sector} · {empresa.tamano} empleados
            </p>
          )}
        </div>
        {userRole === 'auditor' ? (
          <button
            disabled
            title="Acceso de Solo Lectura (Auditor)"
            className="bg-[#E2E8F0] border border-[#CBD5E1] text-[#94A3B8] inline-flex items-center gap-2 px-5 py-3 text-sm rounded-xl cursor-not-allowed font-semibold shadow-sm"
          >
            <span className="text-base">🔒</span>
            Nuevo Diagnóstico (Auditor)
          </button>
        ) : (
          <Link
            id="btn-nuevo-diagnostico"
            href="/diagnostico"
            className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm no-underline animate-hover"
          >
            <span className="text-base">📋</span>
            Nuevo Diagnóstico
          </Link>
        )}
      </div>

      {/* ── Métricas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        <MetricCard
          titulo="Último Score"
          valor={ultimoDiagnostico ? `${ultimoDiagnostico.scoreTotal}%` : '—'}
          subtitulo={ultimoDiagnostico ? `Evaluación del ${formatFecha(ultimoDiagnostico.fecha)}` : 'Sin diagnósticos aún'}
          icono="📊"
          nivelRiesgo={ultimoDiagnostico?.nivelRiesgo as NivelRiesgo | undefined}
        />
        <MetricCard
          titulo="Score Promedio"
          valor={promedioScore !== null ? `${promedioScore}%` : '—'}
          subtitulo="Sobre todos los diagnósticos"
          icono="📈"
        />
        <MetricCard
          titulo="Diagnósticos"
          valor={totalDiagnosticos}
          subtitulo="Evaluaciones realizadas"
          icono="🗂️"
        />
        <MetricCard
          titulo="Estados Críticos"
          valor={brechasCriticas}
          subtitulo="Evaluaciones con riesgo alto"
          icono="🚨"
          variante={brechasCriticas > 0 ? 'critico' : 'conforme'}
        />
      </div>

      {/* ── Sin historial ── */}
      {historial.length === 0 && (
        <div className="animate-fade-slide-up">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-2">
              Aún no tienes diagnósticos
            </h2>
            <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6">
              Realiza tu primer autodiagnóstico de cumplimiento de la Ley 1581 de 2012.
              El proceso toma menos de 10 minutos.
            </p>
            {userRole === 'auditor' ? (
              <button
                disabled
                className="bg-[#E2E8F0] border border-[#CBD5E1] text-[#94A3B8] inline-flex items-center gap-2 px-6 py-3 text-sm rounded-xl cursor-not-allowed font-semibold shadow-sm"
              >
                🔒 Acceso de Solo Lectura (Auditor)
              </button>
            ) : (
              <Link
                href="/diagnostico"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm no-underline"
              >
                🚀 Iniciar primer diagnóstico
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Historial ── */}
      {historial.length > 0 && (
        <div className="animate-fade-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Historial de Diagnósticos
            </h2>
            <span className="text-xs text-[#64748B]">{historial.length} evaluaciones</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            {/* Cabecera tabla */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              <span>Fecha</span>
              <span className="text-center w-20">Score</span>
              <span className="text-center w-28">Estado</span>
              <span className="text-center w-20">Brechas</span>
            </div>

            {/* Filas */}
            {historial.map((diag, i) => {
              const style = NIVEL_STYLE[diag.nivelRiesgo] ?? NIVEL_STYLE.critico;
              const brechas = diag.recomendaciones.filter((r) =>
                !r.startsWith('✅')
              ).length;

              return (
                <div
                  key={diag.id}
                  className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 items-center text-sm transition-colors hover:bg-[#F8FAFC] ${
                    i < historial.length - 1 ? 'border-b border-[#E2E8F0]' : ''
                  }`}
                >
                  {/* Fecha */}
                  <div>
                    <p className="font-semibold text-[#0F172A]">{formatFecha(diag.fecha)}</p>
                    <p className="text-xs text-[#64748B] font-mono mt-0.5">{diag.id}</p>
                  </div>

                  {/* Score */}
                  <div className="text-center w-20">
                    <span
                      className="text-lg font-black"
                      style={{ color: style.color }}
                    >
                      {diag.scoreTotal}%
                    </span>
                  </div>

                  {/* Badge estado */}
                  <div className="w-28 flex justify-center">
                    <span
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                    >
                      {NIVEL_LABEL[diag.nivelRiesgo]}
                    </span>
                  </div>

                  {/* Brechas */}
                  <div className="w-20 text-center">
                    <span
                      className="text-sm font-bold"
                      style={{ color: brechas > 0 ? '#EF4444' : '#16A34A' }}
                    >
                      {brechas > 0 ? `${brechas} brecha${brechas !== 1 ? 's' : ''}` : '✓ Ninguna'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Marco legal ── */}
      <div className="animate-fade-slide-up">
        <div
          className="rounded-2xl p-5 border border-white/10 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #041C4A 0%, #0A2E73 100%)' }}
        >
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-mono text-white/50 uppercase tracking-widest mb-1">Marco Normativo</p>
              <h3 className="text-base font-black text-white">Ley 1581 de 2012 — Protección de Datos Personales</h3>
              <p className="text-xs text-white/60 mt-1">
                Regulada por la Superintendencia de Industria y Comercio (SIC). El incumplimiento puede acarrear multas de hasta 2.000 SMMLV.
              </p>
            </div>
            <a
              href="https://www.sic.gov.co/proteccion-de-datos-personales"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 px-4 py-2 rounded-lg bg-white/15 border border-white/20 text-white text-xs font-semibold hover:bg-white/25 transition-all"
            >
              Ver en SIC ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
