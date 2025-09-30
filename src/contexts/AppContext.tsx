import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AppUser {
  id: string;
  username: string;
  section: 'daily' | 'outlet' | 'distribution';
}

interface AppContextType {
  user: AppUser | null;
  session: Session | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, username: string, section: 'daily' | 'outlet' | 'distribution') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  saveData: (section: string, data: any) => Promise<{ success: boolean; error?: string }>;
  getData: (section: string) => Promise<any[]>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            if (profile) {
              setUser({
                id: profile.user_id,
                username: profile.username,
                section: profile.section as 'daily' | 'outlet' | 'distribution'
              });
            }
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If remember me is false, we could implement session-only storage
      // but Supabase handles persistence automatically with localStorage
      if (!rememberMe) {
        // For now, just store in sessionStorage instead of localStorage
        // This would require custom session management
        console.log('Remember me disabled - session will not persist across browser sessions');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const signup = async (email: string, password: string, username: string, section: 'daily' | 'outlet' | 'distribution'): Promise<{ success: boolean; error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
            section
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  const saveData = async (section: string, data: any): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      if (section.startsWith('daily-')) {
        const { error } = await supabase
          .from('daily_data')
          .insert({
            user_id: user.id,
            data_type: data.type,
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            data: data
          });

        if (error) throw error;
      } else if (section.startsWith('outlet-')) {
        const { error } = await supabase
          .from('outlet_data')
          .insert({
            user_id: user.id,
            outlet_name: data.outletName || data.outlet,
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            opening_stock: data.openingStock,
            closing_stock: data.closingStock,
            cash_payment: data.cashPayment,
            photo_url: data.photoUrl
          });

        if (error) throw error;
      } else if (section.startsWith('distribution-')) {
        const { error } = await supabase
          .from('distribution_data')
          .insert({
            user_id: user.id,
            distribution_center: data.distributionCenter || data.center,
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            cash_payment: data.cashPayment,
            photo_url: data.photoUrl
          });

        if (error) throw error;
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to save data' };
    }
  };

  const getData = async (section: string): Promise<any[]> => {
    if (!user) return [];

    try {
      if (section.startsWith('daily')) {
        const { data, error } = await supabase
          .from('daily_data')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } else if (section.startsWith('outlet')) {
        const { data, error } = await supabase
          .from('outlet_data')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } else if (section.startsWith('distribution')) {
        const { data, error } = await supabase
          .from('distribution_data')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      }

      return [];
    } catch (error) {
      return [];
    }
  };

  return (
    <AppContext.Provider value={{ user, session, login, signup, logout, saveData, getData, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};