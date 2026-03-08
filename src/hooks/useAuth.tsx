import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'manager' | 'collaborator' | 'sponsor';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: { full_name: string; avatar_url: string | null; organization_id: string | null } | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, fullName: string, inviteToken?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isAdminOrManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    profile: null,
    loading: true,
  });

  const fetchRoleAndProfile = useCallback(async (userId: string) => {
    const [{ data: roleData }, { data: profileData }] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
      supabase.from('profiles').select('full_name, avatar_url, organization_id').eq('id', userId).maybeSingle(),
    ]);
    setState(prev => ({
      ...prev,
      role: (roleData?.role as AppRole) ?? null,
      profile: profileData ?? null,
      loading: false,
    }));
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, user: session?.user ?? null, session }));
      if (session?.user) {
        setTimeout(() => fetchRoleAndProfile(session.user.id), 0);
      } else {
        setState(prev => ({ ...prev, role: null, profile: null, loading: false }));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, user: session?.user ?? null, session }));
      if (session?.user) {
        fetchRoleAndProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRoleAndProfile]);

  const signUp = async (email: string, password: string, fullName: string, inviteToken?: string) => {
    const metadata: Record<string, string> = { full_name: fullName };
    if (inviteToken) metadata.invite_token = inviteToken;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: AppRole) => state.role === role;
  const isAdminOrManager = state.role === 'admin' || state.role === 'manager';

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, hasRole, isAdminOrManager }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
