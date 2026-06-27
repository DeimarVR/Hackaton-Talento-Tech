import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Check if credentials are valid and not placeholder
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('tu_url') &&
  !supabaseAnonKey.includes('tu_clave');

// Mock Supabase client matching auth signature
class MockAuth {
  private listeners: Array<(event: string, session: any) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'datacheck_mock_session') {
          const session = this.getLocalStorageSession();
          this.trigger('SIGNED_IN', session);
        }
      });
    }
  }

  private getLocalStorageSession() {
    if (typeof window === 'undefined') return null;
    const sessionStr = localStorage.getItem('datacheck_mock_session');
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }

  private setLocalStorageSession(session: any) {
    if (typeof window === 'undefined') return;
    if (session) {
      localStorage.setItem('datacheck_mock_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('datacheck_mock_session');
    }
  }

  private getLocalStorageUsers() {
    if (typeof window === 'undefined') return [];
    const usersStr = localStorage.getItem('datacheck_mock_users');
    if (!usersStr) return [];
    try {
      return JSON.parse(usersStr);
    } catch {
      return [];
    }
  }

  private saveLocalStorageUser(user: any) {
    if (typeof window === 'undefined') return;
    const users = this.getLocalStorageUsers();
    users.push(user);
    localStorage.setItem('datacheck_mock_users', JSON.stringify(users));
  }

  private trigger(event: string, session: any) {
    this.listeners.forEach((listener) => listener(event, session));
  }

  async getSession() {
    const session = this.getLocalStorageSession();
    return { data: { session }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    const session = this.getLocalStorageSession();
    // Simulate async callback trigger
    setTimeout(() => {
      callback('INITIAL_SESSION', session);
    }, 0);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((l) => l !== callback);
          },
        },
      },
    };
  }

  async signInWithPassword({ email, password }: any) {
    // Artificial slight delay for realism
    await new Promise((r) => setTimeout(r, 600));

    const users = this.getLocalStorageUsers();
    const user = users.find((u: any) => u.email === email);
    if (!user || user.password !== password) {
      return {
        data: { session: null, user: null },
        error: { message: 'Credenciales inválidas (Modo Simulación: crea una cuenta en Registro)' },
      };
    }

    const session = {
      access_token: 'mock-token-' + Math.random(),
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { 
          full_name: user.nombre,
          role: user.role ?? 'admin'
        },
      },
    };

    this.setLocalStorageSession(session);
    this.trigger('SIGNED_IN', session);

    return { data: { session, user: session.user }, error: null };
  }

  async signUp({ email, password, options }: any) {
    await new Promise((r) => setTimeout(r, 800));

    const users = this.getLocalStorageUsers();
    if (users.some((u: any) => u.email === email)) {
      return {
        data: { session: null, user: null },
        error: { message: 'El correo ya se encuentra registrado (Modo Simulación)' },
      };
    }

    const newUser = {
      id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
      email,
      password,
      nombre: options?.data?.full_name ?? 'Usuario Demo',
      role: options?.data?.role ?? 'admin',
    };

    this.saveLocalStorageUser(newUser);

    const session = {
      access_token: 'mock-token-' + Math.random(),
      user: {
        id: newUser.id,
        email: newUser.email,
        user_metadata: { 
          full_name: newUser.nombre,
          role: newUser.role
        },
      },
    };

    this.setLocalStorageSession(session);
    this.trigger('SIGNED_IN', session);

    return { data: { session, user: session.user }, error: null };
  }

  async signInWithOAuth({ provider, options }: any) {
    await new Promise((r) => setTimeout(r, 400));
    
    if (provider === 'google') {
      const session = {
        access_token: 'mock-google-token-' + Math.random(),
        user: {
          id: 'mock-google-user',
          email: 'demo.cavaltec@gmail.com',
          user_metadata: { 
            full_name: 'Cavaltec Google Demo',
            role: 'admin'
          },
        },
      };
      this.setLocalStorageSession(session);
      this.trigger('SIGNED_IN', session);

      if (typeof window !== 'undefined') {
        window.location.href = options?.redirectTo ?? '/dashboard';
      }
    }
    return { data: {}, error: null };
  }

  async signOut() {
    this.setLocalStorageSession(null);
    this.trigger('SIGNED_OUT', null);
    return { error: null };
  }
}

// Instantiate either real or mock Supabase
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new Proxy({
      auth: new MockAuth(),
    }, {
      get: (target: any, prop: string) => {
        if (prop === 'auth') return target.auth;
        // Expose a dummy function for anything else
        return () => {
          console.warn(`[Supabase Mock] Prop '${prop}' accessed but not fully implemented.`);
          return Promise.resolve({ data: null, error: null });
        };
      }
    }) as any);

if (!isConfigured && typeof window !== 'undefined') {
  console.log('🔌 Datacheck AI: Ejecutando en Modo Simulación Local (LocalStorage). Ingresa credenciales de prueba o regístrate normalmente.');
}
