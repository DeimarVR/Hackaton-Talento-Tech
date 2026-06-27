'use client';

// ============================================================
// Datacheck AI — Hook: useEmpresa
// Gestiona múltiples empresas + historial de diagnósticos por NIT
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import type { DatosEmpresa } from './types';
import type { ResultadoDiagnostico } from '../diagnostico/types';

const KEY_EMPRESAS   = 'datacheck_empresas';
const KEY_ACTIVE_NIT = 'datacheck_active_nit';

export interface DiagnosticoGuardado {
  id: string;
  fecha: string;          // ISO string
  scoreTotal: number;
  nivelRiesgo: string;
  recomendaciones: string[];
  resultadosPorBloque: Array<{
    bloqueId: string;
    bloqueTitulo: string;
    scoreObtenido: number;
    scoreMaximo: number;
    porcentaje: number;
  }>;
}

function parseSafe<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function useEmpresa() {
  const [empresas, setEmpresas] = useState<DatosEmpresa[]>([]);
  const [activeNit, setActiveNit] = useState<string | null>(null);
  const [historial, setHistorialState] = useState<DiagnosticoGuardado[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadedEmpresas = parseSafe<DatosEmpresa[]>(KEY_EMPRESAS) ?? [];
    const loadedActiveNit = localStorage.getItem(KEY_ACTIVE_NIT);
    
    setEmpresas(loadedEmpresas);
    
    let nit = loadedActiveNit;
    if (!nit && loadedEmpresas.length > 0) {
      nit = loadedEmpresas[0].nit;
    }
    setActiveNit(nit);
  }, []);

  // Cargar historial de la empresa activa
  useEffect(() => {
    if (activeNit) {
      const h = parseSafe<DiagnosticoGuardado[]>(`datacheck_historial_${activeNit}`) ?? [];
      setHistorialState(h);
    } else {
      setHistorialState([]);
    }
  }, [activeNit]);

  // Obtener los datos de la empresa activa
  const empresa = empresas.find(e => e.nit === activeNit) ?? null;

  // Guardar/Actualizar una empresa
  const guardarEmpresa = useCallback((datos: DatosEmpresa) => {
    setEmpresas((prev) => {
      const idx = prev.findIndex((e) => e.nit === datos.nit);
      let nuevas: DatosEmpresa[];
      if (idx >= 0) {
        // Actualizar existente
        nuevas = [...prev];
        nuevas[idx] = datos;
      } else {
        // Agregar nueva
        nuevas = [...prev, datos];
      }
      localStorage.setItem(KEY_EMPRESAS, JSON.stringify(nuevas));
      return nuevas;
    });

    localStorage.setItem(KEY_ACTIVE_NIT, datos.nit);
    setActiveNit(datos.nit);
  }, []);

  // Seleccionar empresa activa
  const seleccionarEmpresa = useCallback((nit: string) => {
    localStorage.setItem(KEY_ACTIVE_NIT, nit);
    setActiveNit(nit);
  }, []);

  // Limpiar empresa activa de la lista
  const limpiarEmpresa = useCallback(() => {
    if (!activeNit) return;
    setEmpresas((prev) => {
      const nuevas = prev.filter(e => e.nit !== activeNit);
      localStorage.setItem(KEY_EMPRESAS, JSON.stringify(nuevas));
      
      const siguienteNit = nuevas.length > 0 ? nuevas[0].nit : null;
      if (siguienteNit) {
        localStorage.setItem(KEY_ACTIVE_NIT, siguienteNit);
      } else {
        localStorage.removeItem(KEY_ACTIVE_NIT);
      }
      setActiveNit(siguienteNit);
      return nuevas;
    });
  }, [activeNit]);

  // Guardar diagnóstico para la empresa activa
  const guardarDiagnostico = useCallback((resultado: ResultadoDiagnostico) => {
    if (!activeNit) return;

    // Convertir de Date si es necesario
    const fechaStr = resultado.fechaCompletado instanceof Date 
      ? resultado.fechaCompletado.toISOString() 
      : new Date(resultado.fechaCompletado).toISOString();

    const nuevo: DiagnosticoGuardado = {
      id: `diag_${Date.now()}`,
      fecha: fechaStr,
      scoreTotal: resultado.scoreTotal,
      nivelRiesgo: resultado.nivelRiesgo,
      recomendaciones: resultado.recomendaciones,
      resultadosPorBloque: resultado.resultadosPorBloque.map((rb) => ({
        bloqueId: rb.bloque.id,
        bloqueTitulo: rb.bloque.titulo,
        scoreObtenido: rb.scoreObtenido,
        scoreMaximo: rb.scoreMaximo,
        porcentaje: rb.porcentaje,
      })),
    };

    setHistorialState((prev) => {
      const nuevo_historial = [nuevo, ...prev];
      localStorage.setItem(`datacheck_historial_${activeNit}`, JSON.stringify(nuevo_historial));
      return nuevo_historial;
    });
  }, [activeNit]);

  // Limpiar historial de la empresa activa
  const limpiarHistorial = useCallback(() => {
    if (!activeNit) return;
    localStorage.removeItem(`datacheck_historial_${activeNit}`);
    setHistorialState([]);
  }, [activeNit]);

  return {
    empresa,
    empresas,
    activeNit,
    historial,
    guardarEmpresa,
    seleccionarEmpresa,
    limpiarEmpresa,
    guardarDiagnostico,
    limpiarHistorial,
  };
}
