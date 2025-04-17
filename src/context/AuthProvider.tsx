import { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";

const AuthContext = createContext<Session | null | undefined>(undefined); // <-- undefined means "still loading"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
};

export const useSession = () => useContext(AuthContext);