import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ADMIN_EMAIL } from "@/config/site";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener BEFORE getSession to avoid race
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const signInWithGoogle = async () => {
    return lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/timetable`,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user, loading, isAdmin, signInWithGoogle, signOut };
}
