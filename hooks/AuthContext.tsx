'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setRender: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  render: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [render, setRender] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const storedUser = localStorage.getItem('currentUser');

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const metadata = user?.user_metadata;
      console.log('user', metadata);

      if (storedUser && !session) {
        await supabase.auth.signOut();
        localStorage.removeItem('currentUser');
      }

      if (session) {
        setUser(session.user);
        localStorage.setItem('currentUser', JSON.stringify(session.user));
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      console.log(session, _);
      if (session) {
        setUser(session.user);
        localStorage.setItem('currentUser', JSON.stringify(session.user));
        setRender(false);
      } else {
        setUser(null);
        // localStorage.removeItem('currentUser');
        setRender(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, render]);

  return (
    <AuthContext.Provider
      value={{ user, render, setRender, loading, setLoading, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
