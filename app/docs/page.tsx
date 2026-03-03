"use client";

import { motion } from "framer-motion";
import { Link2, Layers, Brain, Cpu, Globe, Rocket, Terminal, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  const sections = [
    {
      id: "architecture",
      icon: <Layers className="w-8 h-8 text-primary" />,
      title: "1️⃣ Portable Architecture",
      description: "Can parts of your system be swapped without breaking everything? Yes. Second Brain thrives on separation of concerns.",
      content: (
        <div className="space-y-4 text-zinc-600 mt-4 leading-relaxed">
          <p>Our infrastructure is designed as completely decoupled layers to foster rapid iterations and platform-agnostic flexibility.</p>
          <ul className="grid gap-3 mt-4">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> <strong>Frontend Layer:</strong> Next.js & React components delivering robust, static generation.</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> <strong>API Layer:</strong> Serverless Edge functions managing RESTful routes seamlessly.</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> <strong>Service Layer:</strong> Core AI logic interacting loosely with external LLMs and vector embedding streams.</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> <strong>Database Layer:</strong> Handled securely via Supabase (Postgres).</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> <strong>Vector Search:</strong> Powering semantic knowledge retrieval natively through pgvector.</li>
          </ul>
          <p className="mt-4 p-4 rounded-xl bg-primary/5 text-sm font-medium border border-primary/10">
            <strong>The Portability Promise:</strong> Because we employ modular service handlers, if OpenRouter experiences downtime, we can swap sequentially to direct OpenAI or Anthropic calls with zero UI rewrites. If Supabase alters its pricing, the platform seamlessly migrates to raw Postgres containers. Nothing is tightly coupled.
          </p>
        </div>
      ),
    },
    {
      id: "ux-principles",
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: "2️⃣ Principles-Based UX",
      description: "Our design language isn't just 'clean.' It's deliberately architected to minimize friction.",
      content: (
        <div className="space-y-6 text-zinc-600 mt-4">
          <div className="space-y-1 bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
            <h4 className="font-bold text-zinc-900 flex items-center gap-2"><SparkleIcon /> Intelligence over clutter</h4>
            <p className="text-sm leading-relaxed">The interface prioritizes contextual knowledge surface areas rather than flooding the user with raw data dumps, focusing heavily on what naturally matters to the specific viewport.</p>
          </div>
          <div className="space-y-1 bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
            <h4 className="font-bold text-zinc-900 flex items-center gap-2"><SparkleIcon /> Calm cognitive environment</h4>
            <p className="text-sm leading-relaxed">Soft aesthetics using glassmorphism, dynamic fluid lighting, and abundant whitespace to drastically reduce structural fatigue when managing significant knowledge graphs.</p>
          </div>
          <div className="space-y-1 bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
            <h4 className="font-bold text-zinc-900 flex items-center gap-2"><SparkleIcon /> Progressive disclosure</h4>
            <p className="text-sm leading-relaxed">Complex functionalities (like relational graph visualizations and vector AI search parameters) sit gracefully out of view until directly summoned by the user's intent.</p>
          </div>
          <div className="space-y-1 bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
            <h4 className="font-bold text-zinc-900 flex items-center gap-2"><SparkleIcon /> Emotional personalization</h4>
            <p className="text-sm leading-relaxed">Micro-interactions and subtle physics-based springs reward exploration and create a lasting connection to the tool.</p>
          </div>
        </div>
      ),
    },
    {
      id: "agent-thinking",
      icon: <Cpu className="w-8 h-8 text-emerald-500" />,
      title: "3️⃣ Agent Thinking",
      description: "Understanding AI as an active system that continuously self-improves, rather than a passive text generator.",
      content: (
        <div className="space-y-4 text-zinc-600 mt-4 leading-relaxed">
          <p>Second Brain isn't an isolated vault; it operates active automation loops to optimize your graph over time without human intervention.</p>
          <ul className="grid gap-3 mt-4 mb-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">1</div>
              <div><strong>Auto-Tagging Pipeline:</strong> When a generic note is instantiated without predefined topics, our parsing engine intercepts the payload server-side, forcing an automated LLM extraction mapping out hyper-relevant classification tags before database commit.</div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">2</div>
              <div><strong>Graph Relationships:</strong> Nodes proactively discover and connect to historical items traversing these generated taxonomy links to assemble intelligent network visualizations passively.</div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">3</div>
              <div><strong>Relevancy Feedback (Planned):</strong> Tracking internal vector search trajectories to heavily weight continuously accessed chunks, triggering passive background re-embedding pipelines to optimize our indexing structure accuracy constantly.</div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "infrastructure",
      icon: <Globe className="w-8 h-8 text-indigo-500" />,
      title: "4️⃣ Infrastructure Mindset",
      description: "Developing robust data pipelines capable of exposing system intelligence far beyond a standard Graphical User Interface.",
      content: (
        <div className="space-y-4 text-zinc-600 mt-4 leading-relaxed">
          <p>This ecosystem fundamentally embraces <strong className="text-indigo-600">Platform Thinking</strong>. A knowledge system is only as potent as its ability to bridge insights toward other external mechanisms.</p>
          
          <div className="bg-zinc-900 text-zinc-300 p-6 rounded-2xl relative overflow-hidden my-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-4">
              <Terminal className="w-5 h-5 text-zinc-500" />
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">Global Public Read Endpoint</span>
            </div>
            <code className="block font-mono text-sm text-green-400 mb-2">
              GET /api/public/brain/query
            </code>
            <p className="text-xs text-zinc-500 font-mono mb-4">
              ?q=explain+neural+networks&userId=uuid
            </p>
            <div className="bg-black/40 p-4 rounded-xl font-mono text-xs border border-white/5 space-y-2">
              <div className="text-zinc-500">// Bypasses standard RLS explicitly surfacing RAG data globally.</div>
              <div className="text-white">{"{"}</div>
              <div className="text-blue-300 ml-4">"answer": <span className="text-orange-300">"Neural networks are..."</span>,</div>
              <div className="text-blue-300 ml-4">"sources": <span className="text-zinc-500">[...]</span></div>
              <div className="text-white">{"}"}</div>
            </div>
          </div>
          
          <p>
            By exposing global headless APIs using privileged Administrative Role Keys, we enable mobile applications, terminal workflows, and third-party SaaS integrations to openly hook into the knowledge graph directly, answering complex LLM questions autonomously.
          </p>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 pb-32">
      {/* Decorative Hero Background */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden border-b border-zinc-200/50 bg-white">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <Badge variant="outline" className="mb-6 rounded-full px-4 py-1.5 bg-zinc-50 border-zinc-200">
            <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
            System Documentation
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-zinc-900 mb-6 leading-tight">
            Engineering the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              Second Brain
            </span>
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            An extensive breakdown of our decoupled architecture, progressive UX principles, closed-loop agent thinking, and headless API exposure.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="#architecture">
              <Button className="rounded-full px-8 bg-zinc-900 hover:bg-black text-white shadow-xl transition-all hover:-translate-y-0.5">
                Explore The Specs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-20 space-y-24">
        {sections.map((section, index) => (
          <motion.section 
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="scroll-mt-32"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="md:w-1/3 shrink-0">
                <div className="w-16 h-16 bg-white border border-zinc-100 shadow-sm rounded-2xl flex items-center justify-center mb-6">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-3 leading-tight tracking-tight">
                  {section.title}
                </h2>
                <p className="text-sm font-medium text-zinc-500 leading-relaxed border-l-2 border-zinc-200 pl-4">
                  {section.description}
                </p>
              </div>
              
              <div className="md:w-2/3 bg-white/50 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                {section.content}
              </div>
            </div>
          </motion.section>
        ))}
      </div>
    </main>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M7.5 4.27 9 12l7.73 1.5-7.73 1.5L7.5 22.73 6 15 1.27 13.5 6 12Z" />
      <path d="m22 2-1.5 3-3 1.5 3 1.5 1.5 3 1.5-3 3-1.5-3-1.5Z" />
    </svg>
  );
}
