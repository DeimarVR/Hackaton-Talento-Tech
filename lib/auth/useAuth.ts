'use client';

// ============================================================
// Datacheck AI — Hook: useAuth
// Maneja autenticación via Supabase (email + OAuth Google)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      });
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setAuthState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  // ----------------------------------------------------------
  // Sign In con Email + Contraseña
  // ----------------------------------------------------------
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error: error.message }));
      return false;
    }
    return true;
  }, []);

  // ----------------------------------------------------------
  // Sign Up con Email + Contraseña
  // ----------------------------------------------------------
  const signUpWithEmail = useCallback(async (email: string, password: string, nombre?: string, role: string = 'admin') => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nombre, role } },
    });
    if (error) {
      setAuthState((prev) => ({ ...prev, loading: false, error: error.message }));
      return false;
    }
    setAuthState((prev) => ({ ...prev, loading: false }));
    return true;
  }, []);

  // ----------------------------------------------------------
  // OAuth Google
  // ----------------------------------------------------------
  const signInWithGoogle = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, error: null }));
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setAuthState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  // ----------------------------------------------------------
  // Sign Out
  // ----------------------------------------------------------
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthState({ user: null, session: null, loading: false, error: null });
  }, []);

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
}
