'use client';

// ============================================================
// ResultadoPanel — Modo Claro (paleta CAVALTEC)
// ============================================================

import type { ResultadoDiagnostico, NivelRiesgo } from '../../../lib/diagnostico/types';
import GaugeChart from './GaugeChart';

interface ResultadoPanelProps {
  resultado: ResultadoDiagnostico;
  onReiniciar: () => void;
  onVerDashboard?: () => void;
}

const NIVEL_CONFIG: Record<NivelRiesgo, { label: string; description: string; color: string; bg: string; border: string; icon: string }> = {
  critico: {
    label: 'Incumplimiento Crítico',
    description: 'Su organización enfrenta riesgos legales significativos. Se requieren acciones inmediatas.',
    color: '#EF4444',
    bg: '#FEE2E2',
    border: '#FECACA',
    icon: '🚨',
  },
  en_proceso: {
    label: 'En Proceso de Cumplimiento',
    description: 'Su organización ha iniciado el camino. Existen brechas importantes que cerrar.',
    color: '#F59E0B',
    bg: '#FEF3C7',
    border: '#FDE68A',
    icon: '⚠️',
  },
  conforme: {
    label: 'Conforme con la Ley 1581',
    description: '¡Felicitaciones! Su organización demuestra un alto nivel de cumplimiento.',
    color: '#16A34A',
    bg: '#DCFCE7',
    border: '#BBF7D0',
    icon: '✅',
  },
};

const BLOQUE_ACCENT: Record<string, string> = {
  politica:          '#16A34A',
  privacidad_disenio: '#2563EB',
  gobernanza:        '#F59E0B',
};

export default function ResultadoPanel({ resultado, onReiniciar, onVerDashboard }: ResultadoPanelProps) {
  const config = NIVEL_CONFIG[resultado.nivelRiesgo];
  const fecha  = resultado.fechaCompletado.toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="animate-fade-slide-up w-full max-w-4xl mx-auto space-y-6 pb-12">

      {/* ── Hero ── */}
      <div
        className="rounded-2xl p-6 sm:p-8 border"
        style={{ background: config.bg, borderColor: config.border }}
      >
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <GaugeChart score={resultado.scoreTotal} nivelRiesgo={resultado.nivelRiesgo} />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
              <span className="text-2xl">{config.icon}</span>
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: config.color }}>
                Resultado Final
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: config.color }}>
              {config.label}
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed mb-4">
              {config.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { val: `${resultado.scoreTotal}%`, label: 'Score Global', color: config.color },
                {
                  val: Object.values(resultado.respuestas).filter(r => r.valor === 'si' && !r.bloqueada).length,
                  label: 'Sí respondidas',
                  color: '#16A34A',
                },
                {
                  val: Object.values(resultado.respuestas).filter(r => r.valor === 'no' && !r.bloqueada).length,
                  label: 'Brechas',
                  color: '#EF4444',
                },
              ].map(({ val, label, color }) => (
                <div key={label} className="text-center px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
                  <p className="text-2xl font-black" style={{ color }}>{val}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#64748B] mt-4">Diagnóstico completado el {fecha}</p>
          </div>
        </div>
      </div>

      {/* ── Desglose por bloque ── */}
      <div>
        <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-widest mb-3 px-1">
          Desglose por Bloque
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {resultado.resultadosPorBloque.map(({ bloque, scoreObtenido, scoreMaximo, porcentaje, preguntasRespondidas, preguntasBloqueadas }) => {
            const accent = BLOQUE_ACCENT[bloque.id] ?? '#2563EB';
            return (
              <div
                key={bloque.id}
                className="rounded-xl bg-white border border-[#E2E8F0] p-5 hover:border-[#BFDBFE] hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{bloque.icono}</span>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A] leading-tight">{bloque.titulo}</p>
                    <p className="text-[10px] text-[#64748B]">Máx {bloque.pesoMaximo}% global</p>
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-black" style={{ color: accent }}>
                    {scoreObtenido}
                  </span>
                  <span className="text-[#64748B] text-sm mb-0.5">/ {scoreMaximo} pts</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#E2E8F0] mb-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${porcentaje}%`, backgroundColor: accent }}
                  />
                </div>
                <p className="text-xs text-[#64748B]">
                  {porcentaje}% del bloque ·{' '}
                  {preguntasRespondidas} pregunta{preguntasRespondidas !== 1 ? 's' : ''} activa{preguntasRespondidas !== 1 ? 's' : ''}
                  {preguntasBloqueadas > 0 && (
                    <span className="text-[#F59E0B]"> · {preguntasBloqueadas} bloqueada{preguntasBloqueadas !== 1 ? 's' : ''}</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Plan de Acción ── */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="text-base">📋</span>
          Plan de Acción Recomendado
        </h3>
        <ul className="space-y-3">
          {resultado.recomendaciones.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#0F172A] leading-relaxed">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[10px] text-[#2563EB] mt-0.5 font-mono font-bold">
                {i + 1}
              </span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Disclaimer ── */}
      <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 text-center">
        <p className="text-xs text-[#64748B] leading-relaxed">
          ⚠️ Este diagnóstico es una herramienta de autodiagnóstico con fines orientativos basada en la Ley 1581 de 2012.
          No constituye asesoría legal vinculante. Para situaciones específicas, consulte a un abogado especializado en
          protección de datos personales en Colombia.
        </p>
      </div>

      {/* ── Acciones ── */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          id="btn-reiniciar"
          onClick={onReiniciar}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-semibold text-sm transition-all duration-200 hover:scale-[1.02] shadow-sm"
        >
          🔄 Nuevo Diagnóstico
        </button>
        {onVerDashboard && (
          <button
            id="btn-ver-dashboard"
            onClick={onVerDashboard}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#2563EB] font-semibold text-sm transition-all duration-200 hover:scale-[1.02] shadow-sm"
          >
            🏠 Ver Dashboard
          </button>
        )}
        <button
          id="btn-descargar"
          onClick={() => window.print()}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-sm hover:scale-[1.02] transition-transform duration-150"
        >
          📄 Descargar Reporte PDF
        </button>
      </div>
    </div>
  );
}
