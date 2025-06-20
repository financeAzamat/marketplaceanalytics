
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// Mock user for demo purposes with valid UUID
const mockUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
  email: 'demo@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    full_name: 'Demo User'
  },
  identities: [],
  factors: []
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: mockUser,
    loading: false,
  });

  useEffect(() => {
    // Set mock user immediately
    setState({
      user: mockUser,
      loading: false,
    });
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Mock signup - always succeed
    return { data: { user: mockUser, session: null }, error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Mock signin - always succeed
    return { data: { user: mockUser, session: null }, error: null };
  };

  const signOut = async () => {
    // Mock signout - always succeed
    return { error: null };
  };

  return {
    ...state,
    signUp,
    signIn,
    signOut,
  };
};
