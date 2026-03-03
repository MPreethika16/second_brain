"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Sparkles, Zap, Shield, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-50 overflow-hidden text-zinc-900 relative">
      {/* Decorative Blob Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />



      {/* HERO SECTION */}
      <section className="relative pt-24 pb-24 px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/40 backdrop-blur-md shadow-sm mb-8">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">Your new intelligent workspace</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-6">
            Think clearly. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              Create freely.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl leading-relaxed mb-10 font-medium">
            Capture your ideas, connect your knowledge, and synthesize brilliance with a beautifully designed, AI-powered system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full px-8 h-14 text-base font-semibold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                Start Building <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* HERO MOCKUP */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-24 max-w-5xl mx-auto relative group"
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-blue-500/30 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-1000 -z-10" />
          <div className="rounded-3xl overflow-hidden border border-white/50 bg-white/40 backdrop-blur-2xl shadow-2xl p-2 relative">
            <div className="rounded-2xl overflow-hidden bg-zinc-100/50 border border-white/60 relative aspect-[16/10]">
              <Image 
                src="https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=2070" 
                alt="Dashboard Preview" 
                fill 
                className="object-cover opacity-90 scale-105"
                priority
              />
              {/* Glass overlay on mockup for effect */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-900/40 to-transparent pointer-events-none mix-blend-overlay" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURE SECTION */}
      <section className="py-32 relative z-10 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              A workspace that <span className="text-primary">adapts</span> to your thoughts.
            </h2>
            <p className="text-xl text-zinc-600 leading-relaxed">
              Drop files, paste links, or write markdown. Our generative engine auto-tags, connects the dots, and empowers your knowledge base with contextual understanding.
            </p>

            <ul className="space-y-6 pt-4">
              {[
                { icon: Zap, title: "Lightning Fast Capture", desc: "Drag, drop, and let the system handle categorization." },
                { icon: BrainCircuit, title: "Semantic Retrieval", desc: "Ask questions naturally, get answers based on your notes." },
                { icon: Shield, title: "Private by Design", desc: "Backed by Supabase RLS and end-to-end access control." }
              ].map((feat, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <div className="bg-white border border-zinc-100 shadow-sm p-3 rounded-xl shrink-0 mt-1 text-primary">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-zinc-900">{feat.title}</h3>
                    <p className="text-zinc-500 mt-1">{feat.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Abstract UI representation */}
            <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-primary/10 to-blue-500/10 border border-white/60 backdrop-blur-3xl shadow-2xl p-8 overflow-hidden">
               <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/40 blur-3xl rounded-full" />
               <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/20 blur-3xl rounded-full" />
               
               <div className="relative z-10 h-full flex flex-col gap-4">
                 {[1, 2, 3].map((i) => (
                   <motion.div 
                     key={i}
                     whileHover={{ x: 10, scale: 1.02 }}
                     className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm flex items-center gap-4 cursor-default"
                   >
                     <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                       <span className="font-bold text-zinc-400">0{i}</span>
                     </div>
                     <div className="space-y-2 flex-1">
                       <div className="h-4 bg-zinc-200/50 rounded w-2/3" />
                       <div className="h-3 bg-zinc-200/50 rounded w-1/2" />
                     </div>
                   </motion.div>
                 ))}
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200/50 bg-white/30 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-zinc-400" />
            <span className="font-bold text-lg text-zinc-400">Second Brain</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Second Brain. Built with Next.js, Framer Motion, and Agentic Engineering.
          </p>
        </div>
      </footer>
    </main>
  );
}