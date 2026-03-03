"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BrainCircuit, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Hide on auth pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <BrainCircuit className="w-6 h-6 text-primary" />
          </div>
          <Link href="/" className="font-bold text-xl tracking-tight text-zinc-900 pr-2">
            Second Brain
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Docs
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-zinc-700 hover:text-primary transition-colors">
              Workspace
            </Link>
          </div>

          {session ? (
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 rounded-full hover:bg-white/50">
                  <UserIcon className="w-4 h-4" />
                  Profile
                </Button>
              </Link>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm" 
                className="gap-2 rounded-full bg-white/50 border-white/40 shadow-sm hover:shadow hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 pl-4 border-l border-zinc-200">
              <Link href="/login" className="text-sm font-medium text-zinc-700 hover:text-primary transition-colors">
                Log in
              </Link>
              <Link href="/signup">
                <Button className="rounded-full px-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
