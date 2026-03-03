"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface Note {
  id: string;
  title: string;
  preview?: string;
  content: string;
  tags: string[];
  type: string;
  created_at: string;
}

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [fetchingNotes, setFetchingNotes] = useState(true);

  const [tagFilter, setTagFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "relevance">("newest");

  useEffect(() => {
    const fetchNotes = async () => {
      setFetchingNotes(true);
      try {
        const { data, error } = await supabase
          .from("knowledge_items")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setFetchingNotes(false);
      }
    };
    fetchNotes();
  }, []);

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || []))).sort();

  const filtered = notes
    .filter((note) => {
      const query = search.toLowerCase();
      const matchesSearch =
        note.title.toLowerCase().includes(query) ||
        (note.preview || note.content).toLowerCase().includes(query) ||
        (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(query)));
      
      const matchesTag = tagFilter === "All" || (note.tags && note.tags.includes(tagFilter));
      const matchesType = typeFilter === "All" || (note.type && note.type.toLowerCase() === typeFilter.toLowerCase());

      return matchesSearch && matchesTag && matchesType;
    })
    .sort((a, b) => {
      if (sortOrder === "relevance" && search.trim() !== "") {
        const query = search.toLowerCase();
        const getScore = (n: Note) => {
          let score = 0;
          if (n.title.toLowerCase().includes(query)) score += 10;
          if (n.tags && n.tags.some(t => t.toLowerCase().includes(query))) score += 5;
          if ((n.preview || n.content).toLowerCase().includes(query)) score += 2;
          return score;
        };
        return getScore(b) - getScore(a);
      }
      
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer(null);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("Failed to fetch query");
      const data = await res.json();
      setAnswer(data.answer || "No response generated.");
    } catch (error) {
      console.error(error);
      setAnswer("Sorry, I couldn't process your question at the moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-zinc-50">
      {/* Decorative blurry ORBs for glassmorphism backing */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 py-14 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-14">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Brain Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Your knowledge, organized and evolving.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/graph">
              <Button variant="outline" className="rounded-full px-6 py-2 shadow-sm hover:shadow-md transition bg-white/50 border-white/40">
                Graph View
              </Button>
            </Link>
            <Link href="/new">
              <Button className="rounded-full px-6 py-2 shadow-sm hover:shadow-md transition">
                Add Note
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Query Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 relative overflow-hidden rounded-3xl border border-white/40 bg-white/40 backdrop-blur-2xl p-10 shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl font-semibold mb-6">Ask Your Brain</h2>

            <div className="flex gap-4">
              <Input
                placeholder="What did I write about AI research?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 rounded-xl"
              />

              <Button
                className="rounded-xl px-6"
                disabled={loading}
                onClick={handleAsk}
              >
                {loading ? "Thinking..." : "Ask"}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Semantic search across your notes with context-aware answers.
            </p>

            {/* AI Response */}
            {answer && (
              <div className="mt-8 rounded-2xl border bg-zinc-50 p-6 shadow-sm animate-fade-in">
                <p className="text-sm text-zinc-700 leading-relaxed">
                  {answer}
                </p>

                <div className="mt-4 text-xs text-muted-foreground">
                  Sources: AI Thoughts
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Search, Filter, Sort Toolbar */}
        <div className="mb-14 flex flex-col md:flex-row items-center justify-between gap-4 relative">
          <Input
            placeholder="Search your brain natively..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:max-w-md rounded-2xl h-12 bg-white/50 backdrop-blur-xl border-white/40 shadow-sm focus-visible:ring-primary/20"
          />
          
          <div className="flex w-full md:w-auto gap-4 overflow-x-auto pb-2 md:pb-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-12 px-4 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[120px]"
            >
              <option value="All">All Types</option>
              <option value="note">Note</option>
              <option value="link">Link</option>
              <option value="insight">Insight</option>
            </select>

            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="h-12 px-4 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px]"
            >
              <option value="All">All Tags</option>
              {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="h-12 px-4 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="relevance">Relevance</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {!fetchingNotes && filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            No knowledge found.
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {fetchingNotes ? (
            // Skeleton Loaders
            Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="group h-full rounded-2xl border border-white/30 bg-white/30 backdrop-blur-xl p-5 shadow-sm animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-6 w-2/3 rounded-lg bg-white/60" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded-md bg-white/50" />
                    <div className="h-4 w-5/6 rounded-md bg-white/50" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-8">
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-white/60" />
                    <div className="h-6 w-12 rounded-full bg-white/60" />
                  </div>
                  <div className="h-4 w-16 rounded-md bg-white/50" />
                </div>
              </div>
            ))
          ) : (
            filtered.map((note) => (
              <Link key={note.id} href={`/dashboard/${note.id}`} className="block h-full">
                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }} 
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-full"
                >
                  <Card className="group h-full flex flex-col justify-between rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl p-5 shadow-lg transition-all duration-300 hover:shadow-2xl hover:bg-white/60 cursor-pointer overflow-hidden relative">
                    {/* Subtle inner gradient shift on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/0 group-hover:from-white/20 transition-all pointer-events-none" />
                    
                    <div>
                      <CardHeader className="p-0 mb-3">
                        <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 leading-tight">
                          {note.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-0">
                        <p className="text-sm text-zinc-600/90 mb-6 line-clamp-3 leading-relaxed">
                          {note.preview || note.content}
                        </p>
                      </CardContent>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-200/50 mt-auto">
                      <div className="flex gap-1.5 flex-wrap">
                        {note.tags && note.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="rounded-full bg-black/5 text-zinc-700 hover:bg-black/10 border-transparent text-xs font-medium px-2.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {note.tags && note.tags.length > 3 && (
                          <Badge variant="secondary" className="rounded-full bg-black/5 text-zinc-700 text-xs font-medium px-2">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <span className="text-xs font-medium text-zinc-400">
                        {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
