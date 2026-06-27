'use client';

// ============================================================
// DiagnosticoWizard — Modo Claro (paleta CAVALTEC)
// ============================================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDiagnostico } from '../../../lib/diagnostico/useDiagnostico';
import { useEmpresa } from '../../../lib/empresa/useEmpresa';
import { useAuth } from '../../../lib/auth/useAuth';
import { BLOQUES } from '../../../lib/diagnostico/preguntas';
import ProgressBar from './ProgressBar';
import GaugeChart from './GaugeChart';
import PreguntaCard from './PreguntaCard';
import SkipNotice from './SkipNotice';
import ResultadoPanel from './ResultadoPanel';

export default function DiagnosticoWizard() {
  const router = useRouter();
  const { guardarDiagnostico, empresa } = useEmpresa();
  const { user } = useAuth();
  const {
    estado,
    preguntaActual,
    progresoPorcentaje,
    totalPreguntas,
    responder,
    cerrarSkipNotice,
    abrirCopilot,
    cerrarCopilot,
    reiniciar,
  } = useDiagnostico();

  useEffect(() => {
    if (user && user.user_metadata?.role === 'auditor') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const bloqueActual = preguntaActual
    ? BLOQUES.find((b) => b.id === preguntaActual.bloqueId)
    : null;

  // Guardar resultado en historial cuando se completa
  const handleResultadoGuardado = (callback: () => void) => {
    if (estado.resultado) {
      guardarDiagnostico(estado.resultado);
    }
    callback();
  };

  return (
    <>
      {/* ── SKIP NOTICE MODAL ─────────────────────────────────── */}
      {estado.mostrandoSkipNotice && (
        <SkipNotice onClose={cerrarSkipNotice} />
      )}



      {/* ── LAYOUT PRINCIPAL ──────────────────────────────────── */}
      <div className="min-h-full bg-[#F8FAFC] text-[#0F172A] font-sans">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Empresa + Breadcrumb */}
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-[#64748B] hover:text-[#0F172A] transition-colors text-sm"
                >
                  ←
                </button>
                <span className="text-[#E2E8F0]">|</span>
                <div className="min-w-0">
                  <p className="text-xs text-[#64748B] font-mono">Diagnóstico activo</p>
                  <p className="text-sm font-bold text-[#0F172A] truncate">
                    {empresa?.nombre ?? 'Mi Organización'}
                  </p>
                </div>
              </div>

              {/* Progress bar (centro) */}
              {!estado.completado && (
                <div className="flex-1 max-w-xs hidden md:block">
                  <ProgressBar
                    porcentaje={progresoPorcentaje}
                    preguntaActual={Object.keys(estado.respuestas).length}
                    totalPreguntas={totalPreguntas}
                  />
                </div>
              )}

              {/* Score mini */}
              <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-xs text-[#64748B]">Score:</span>
                <span
                  className="text-sm font-black"
                  style={{
                    color:
                      estado.nivelRiesgo === 'critico'
                        ? '#EF4444'
                        : estado.nivelRiesgo === 'en_proceso'
                        ? '#F59E0B'
                        : '#16A34A',
                  }}
                >
                  {estado.scoreActual}%
                </span>
              </div>
            </div>

            {/* Mobile progress */}
            {!estado.completado && (
              <div className="mt-2 md:hidden">
                <ProgressBar
                  porcentaje={progresoPorcentaje}
                  preguntaActual={Object.keys(estado.respuestas).length}
                  totalPreguntas={totalPreguntas}
                />
              </div>
            )}
          </div>
        </header>

        {/* ── MAIN ────────────────────────────────────────────── */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {estado.completado && estado.resultado ? (
            <ResultadoPanel
              resultado={estado.resultado}
              onReiniciar={() => handleResultadoGuardado(reiniciar)}
              onVerDashboard={() => {
                if (estado.resultado) guardarDiagnostico(estado.resultado);
                router.push('/dashboard');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

              {/* ── Columna izquierda ── */}
              <div className="space-y-5">

                {/* Bloque actual pill */}
                {bloqueActual && (
                  <div className="flex items-center gap-3 animate-fade-slide-up">
                    <span className="text-xl">{bloqueActual.icono}</span>
                    <div>
                      <p className="text-xs text-[#64748B] uppercase tracking-widest">Bloque actual</p>
                      <p className="text-sm font-bold text-[#0F172A]">{bloqueActual.titulo}</p>
                    </div>
                    <div className="ml-auto text-xs text-[#64748B] font-mono bg-[#F1F5F9] px-2 py-1 rounded-lg">
                      Máx {bloqueActual.pesoMaximo}%
                    </div>
                  </div>
                )}

                {/* Tarjeta pregunta */}
                {preguntaActual && bloqueActual ? (
                  <PreguntaCard
                    key={preguntaActual.id}
                    pregunta={preguntaActual}
                    bloque={bloqueActual}
                    numeroPregunta={estado.preguntaActualIndex + 1}
                    totalPreguntas={totalPreguntas}
                    esComplementaria={preguntaActual.esComplementaria}
                    onResponder={responder}
                    onConsultarCopilot={abrirCopilot}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 rounded-2xl bg-white border border-[#E2E8F0]">
                    <p className="text-[#64748B]">Cargando...</p>
                  </div>
                )}

                {/* Progreso por bloques */}
                <div className="grid grid-cols-3 gap-3">
                  {BLOQUES.map((bloque) => {
                    const ids = bloque.id === 'politica'
                      ? ['Q1','Q2','Q3','Q4','Q5']
                      : bloque.id === 'privacidad_disenio'
                      ? ['Q6','Q7','Q8']
                      : ['Q9','Q10','Q11'];
                    const respondidas = ids.filter((id) => estado.respuestas[id]).length;
                    const esActivo = bloqueActual?.id === bloque.id;

                    return (
                      <div
                        key={bloque.id}
                        className={`rounded-xl p-3 border transition-all duration-300 ${
                          esActivo
                            ? 'border-[#2563EB] bg-[#EFF6FF]'
                            : respondidas > 0
                            ? 'border-[#E2E8F0] bg-white'
                            : 'border-[#E2E8F0] bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm">{bloque.icono}</span>
                          <span className="text-[10px] font-mono text-[#64748B]">
                            {respondidas}/{ids.length}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-[#0F172A] leading-tight">
                          {bloque.titulo}
                        </p>
                        <div className="mt-2 h-1 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(respondidas / ids.length) * 100}%`,
                              background: esActivo
                                ? 'linear-gradient(90deg, #2563EB, #3B82F6)'
                                : '#16A34A',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Columna derecha ── */}
              <div className="space-y-4 lg:sticky lg:top-24">
                {/* Gauge Card */}
                <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest">
                      Score en Tiempo Real
                    </p>
                    <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  </div>
                  <div className="flex justify-center">
                    <GaugeChart score={estado.scoreActual} nivelRiesgo={estado.nivelRiesgo} />
                  </div>
                </div>

                {/* Info legal */}
                <div className="rounded-xl bg-white border border-[#E2E8F0] p-4">
                  <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span>⚖️</span> Marco Legal
                  </p>
                  <div className="space-y-2 text-[11px] text-[#64748B] leading-relaxed">
                    <p>
                      <span className="text-[#0F172A] font-semibold">Ley 1581 de 2012</span> — Estatuto de
                      Protección de Datos Personales en Colombia.
                    </p>
                    <p>
                      <span className="text-[#0F172A] font-semibold">Decreto 1074 de 2015</span> — Reglamentación
                      del tratamiento de datos.
                    </p>
                    <p>
                      <span className="text-[#0F172A] font-semibold">Autoridad:</span> Superintendencia de Industria
                      y Comercio (SIC).
                    </p>
                  </div>
                </div>

                {/* Tip Copilot */}
                <div className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-4">
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    💡 Use el botón{' '}
                    <span className="text-[#2563EB] font-semibold">Consultar Copilot IA</span> para
                    entender exactamente qué exige la ley para cada pregunta.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
