"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, PenLine, LayoutDashboard, User, LogIn, ArrowRight } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0" 
        onClick={() => setOpen(false)} 
      />
      <Command 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200"
        label="Command Menu"
      >
        <div className="flex items-center border-b border-zinc-100 px-4">
          <Search className="w-5 h-5 text-zinc-400 mr-2 shrink-0" />
          <Command.Input 
            autoFocus
            placeholder="Search your brain or jump to..." 
            className="w-full h-14 bg-transparent outline-none border-none text-zinc-900 placeholder:text-zinc-400 font-medium" 
          />
        </div>
        
        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="p-8 text-center text-sm text-zinc-500">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="px-2 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/dashboard"))}
              className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer hover:bg-zinc-100 aria-selected:bg-zinc-100 text-sm font-medium text-zinc-900 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              Dashboard
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/new"))}
              className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer hover:bg-zinc-100 aria-selected:bg-zinc-100 text-sm font-medium text-zinc-900 transition-colors"
            >
              <PenLine className="w-4 h-4 text-blue-500" />
              New Note
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/profile"))}
              className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer hover:bg-zinc-100 aria-selected:bg-zinc-100 text-sm font-medium text-zinc-900 transition-colors"
            >
              <User className="w-4 h-4 text-emerald-500" />
              Profile
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Account" className="px-2 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/login"))}
              className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer hover:bg-zinc-100 aria-selected:bg-zinc-100 text-sm font-medium text-zinc-900 transition-colors"
            >
              <LogIn className="w-4 h-4 text-zinc-400" />
              Log In
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/signup"))}
              className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer hover:bg-zinc-100 aria-selected:bg-zinc-100 text-sm font-medium text-zinc-900 transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-zinc-400" />
              Sign Up
            </Command.Item>
          </Command.Group>
        </Command.List>
        <div className="bg-zinc-50 p-4 border-t border-zinc-100 text-xs text-zinc-400 flex justify-between">
          <span>Use <b>↑</b> and <b>↓</b> to navigate</span>
          <span>Press <b>esc</b> to close</span>
        </div>
      </Command>
    </div>
  );
}
