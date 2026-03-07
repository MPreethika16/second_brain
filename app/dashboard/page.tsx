"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Sparkles, Save, Wand2, Search, Mic, Square } from "lucide-react";

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

  // Quick Capture State
  const [captureTitle, setCaptureTitle] = useState("");
  const [captureContent, setCaptureContent] = useState("");
  const [captureTags, setCaptureTags] = useState<string[]>([]);
  const [useAi, setUseAi] = useState(false);
  const [generatingNote, setGeneratingNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // Voice State
  const [activeRecording, setActiveRecording] = useState<"capture" | "chat" | null>(null);
  const recordingTargetRef = useRef<"capture" | "chat" | null>(null);
  const [isVoiceNote, setIsVoiceNote] = useState(false);
  const [isCommandDetected, setIsCommandDetected] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionFn = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionFn) {
        const rec = new SpeechRecognitionFn();
        rec.continuous = true;
        rec.interimResults = true;
        
        rec.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript;
            }
          }
          if (currentTranscript) {
            if (recordingTargetRef.current === "capture") {
              setCaptureContent((prev) => prev + (prev ? " " : "") + currentTranscript.trim());
            } else if (recordingTargetRef.current === "chat") {
              setQuestion((prev) => prev + (prev ? " " : "") + currentTranscript.trim());
            }
          }
        };

        rec.onerror = (e: any) => {
          console.error("Speech recognition error:", e.error);
          setActiveRecording(null);
          recordingTargetRef.current = null;
        };

        rec.onend = () => {
          setActiveRecording(null);
          recordingTargetRef.current = null;
        };

        setRecognition(rec);
      }
    }
  }, []);

  const toggleRecording = (target: "capture" | "chat") => {
        if (!recognition) {
           alert("Speech recognition is not supported in this browser.");
           return;
        }
        if (activeRecording === target) {
          recognition.stop();
          setActiveRecording(null);
          recordingTargetRef.current = null;
        } else {
          if (activeRecording) {
            recognition.stop();
          }
          recordingTargetRef.current = target;
          setActiveRecording(target);
          recognition.start();
          
          if (target === "capture") {
            setIsVoiceNote(true);
            setUseAi(true);
          }
        }
      };

  const [tagFilter, setTagFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const fetchNotes = useCallback(async (searchQuery: string = "") => {
    setFetchingNotes(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         setNotes([]);
         return;
      }

      let fetchedNotes: Note[] = [];

      if (searchQuery.trim() !== "") {
        // Use RPC search as requested
        const { data, error } = await supabase.rpc("search_notes", {
          search_query: searchQuery,
          user_id: user.id
        });
        
        if (error) {
          console.error("RPC search error:", error);
          // Fallback if the RPC signature is different
          const { data: fbData, error: fbError } = await supabase
            .from("knowledge_items")
            .select("*")
            .eq("user_id", user.id)
            .ilike("content", `%${searchQuery}%`);
          if (!fbError) fetchedNotes = fbData || [];
        } else {
          fetchedNotes = data || [];
        }
      } else {
        const { data, error } = await supabase
          .from("knowledge_items")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        fetchedNotes = data || [];
      }

      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setFetchingNotes(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotes(search);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, fetchNotes]);

  // AI Generation
  const handleAiGenerate = async () => {
    if (!captureContent.trim()) return;
    setGeneratingNote(true);
    try {
      if (isVoiceNote) {
        setVoiceTranscript(captureContent);
      }
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: isVoiceNote ? "process_voice_input" : "generate_note", 
          payload: { prompt: captureContent } 
        }),
      });
      if (!res.ok) throw new Error("Failed to generate note");
      const data = await res.json();

      if (data.intent === "command") {
        setIsCommandDetected(true);
      } else {
        setIsCommandDetected(false);
      }

      setCaptureContent(data.content || "");
      if (data.title) setCaptureTitle(data.title);
      if (data.tags) setCaptureTags(data.tags);
      setUseAi(false);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingNote(false);
    }
  };

  const handleSaveCapture = async () => {
    if (!captureContent.trim()) return;

    setSavingNote(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      let titleToSave = captureTitle.trim();
      let generatedTags: string[] = [...captureTags];

      try {
        if (!titleToSave || generatedTags.length === 0) {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "generate_metadata", payload: { content: captureContent } }),
          });
          
          if (res.ok) {
            const meta = await res.json();
            if (!titleToSave && meta.title) {
              titleToSave = meta.title;
            }
            if (generatedTags.length === 0 && meta.tags && Array.isArray(meta.tags)) {
              generatedTags = meta.tags;
            }
          }
        }
      } catch (e) {
        console.error("Failed to generate metadata:", e);
      }

      if (!titleToSave) {
        titleToSave = "Untitled Note";
      }

      const { data: insertedData, error: insertError } = await supabase
        .from("knowledge_items")
        .insert({
          title: titleToSave,
          content: captureContent,
          user_id: user.id,
          type: "note",
          tags: generatedTags,
          ...(isVoiceNote ? { voice_transcript: voiceTranscript || captureContent, is_voice_note: true } : {})
        })
        .select()
        .single();
      
      if (insertError) throw insertError;

      const newNote = insertedData as Note;
      // Add immediately to UI
      setNotes((prev) => [newNote, ...prev]);

      // Clear Form
      setCaptureTitle("");
      setCaptureContent("");
      setCaptureTags([]);
      setUseAi(false);
      setIsVoiceNote(false);
      setIsCommandDetected(false);
      setVoiceTranscript("");

    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setSavingNote(false);
    }
  };

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

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || []))).sort();

  const filtered = notes
    .filter((note) => {
      const matchesTag = tagFilter === "All" || (note.tags && note.tags.includes(tagFilter));
      const matchesType = typeFilter === "All" || (note.type && note.type.toLowerCase() === typeFilter.toLowerCase());
      return matchesTag && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <main className="min-h-screen relative overflow-hidden bg-zinc-50">
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
          </div>
        </div>

        {/* Quick Capture Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 relative overflow-hidden rounded-3xl border border-white/40 bg-white/40 backdrop-blur-2xl p-8 shadow-xl"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Quick Capture
              </h2>
              <Button
                variant={activeRecording === "capture" ? "destructive" : "outline"}
                onClick={() => toggleRecording("capture")}
                className="rounded-full gap-2 px-6 shadow-sm transition"
              >
                {activeRecording === "capture" ? <Square className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                {activeRecording === "capture" ? "Stop Recording" : "Voice Capture"}
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Title (Optional)"
                value={captureTitle}
                onChange={(e) => setCaptureTitle(e.target.value)}
                className="rounded-xl border-white/40 bg-white/50 shadow-sm"
              />
              
              <Textarea
                placeholder={useAi ? "Enter a topic to generate a note about..." : "What's on your mind? Or paste a link, idea, snippet..."}
                value={captureContent}
                onChange={(e) => setCaptureContent(e.target.value)}
                className="min-h-[120px] rounded-xl border-white/40 bg-white/50 resize-none shadow-sm"
              />

              {captureTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {captureTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-2.5 py-1 text-xs bg-white/60 shadow-sm border-white/60 text-zinc-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {isCommandDetected && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex w-max items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold shadow-sm"
                >
                  <Wand2 className="h-3 w-3" /> Voice Command Executed
                </motion.div>
              )}

              <div className="flex justify-between items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-zinc-700 hover:text-primary transition-colors">
                  <input 
                    type="checkbox" 
                    checked={useAi} 
                    onChange={(e) => setUseAi(e.target.checked)} 
                    className="rounded border-zinc-300 w-4 h-4 text-primary focus:ring-primary/20 accent-primary"
                  />
                  <Wand2 className="h-4 w-4 text-primary" />
                  Generate with AI
                </label>

                {useAi ? (
                  <Button
                    onClick={handleAiGenerate}
                    disabled={generatingNote || !captureContent.trim()}
                    className="rounded-xl gap-2 px-8 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Wand2 className="h-4 w-4" />
                    {generatingNote ? "Generating..." : "Generate"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSaveCapture}
                    disabled={savingNote || !captureContent.trim()}
                    className="rounded-xl gap-2 px-8 shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    {savingNote ? "Saving..." : "Save Note"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Query Section (Existing) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-xl"
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-zinc-900" />
              Ask Your Brain
            </h2>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="What did I write about AI research?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className={`w-full rounded-xl bg-white border-zinc-200 text-zinc-900 shadow-sm pr-12 transition ${activeRecording === "chat" ? "ring-2 ring-primary/50" : ""}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAsk();
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-zinc-100 transition-colors ${activeRecording === "chat" ? "text-red-500 animate-pulse" : "text-zinc-400 hover:text-primary"}`}
                  onClick={() => toggleRecording("chat")}
                  title={activeRecording === "chat" ? "Stop Listening" : "Start Voice Input"}
                >
                  {activeRecording === "chat" ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>

              <Button
                className="rounded-xl px-6 shadow-sm"
                disabled={loading}
                onClick={handleAsk}
              >
                {loading ? "Thinking..." : "Ask"}
              </Button>
            </div>

            {answer && (
              <div className="mt-8 rounded-2xl border border-zinc-100 bg-zinc-50 p-6 shadow-sm animate-fade-in">
                <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
                  {answer}
                </p>
                <div className="mt-4 text-xs text-zinc-400">
                  Sources: AI Thoughts
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Search, Filter, Sort Toolbar */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 relative">
          <div className="w-full md:max-w-md relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search your notes natively..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 rounded-2xl h-12 bg-white/50 backdrop-blur-xl border-white/40 shadow-sm focus-visible:ring-primary/20"
            />
          </div>
          
          <div className="flex w-full md:w-auto gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-12 px-4 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[120px] cursor-pointer hover:bg-white/60 transition"
            >
              <option value="All">All Types</option>
              <option value="note">Note</option>
              <option value="link">Link</option>
              <option value="insight">Insight</option>
            </select>

            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="h-12 px-4 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px] cursor-pointer hover:bg-white/60 transition"
            >
              <option value="All">All Tags</option>
              {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="h-12 px-4 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px] cursor-pointer hover:bg-white/60 transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {!fetchingNotes && filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground flex flex-col items-center gap-4">
            <Sparkles className="h-12 w-12 text-zinc-300" />
            <p>No notes found. Create one above to get started!</p>
          </div>
        )}

        {/* Notes Feed - Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fetchingNotes ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="group h-[250px] rounded-3xl border border-white/30 bg-white/30 backdrop-blur-xl p-6 shadow-sm animate-pulse flex flex-col justify-between"
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
                  <Card className="group h-full flex flex-col justify-between rounded-3xl border border-white/40 bg-white/40 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:bg-white/60 cursor-pointer overflow-hidden relative min-h-[250px]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/0 group-hover:from-white/20 transition-all pointer-events-none" />
                    
                    <div>
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 leading-tight line-clamp-2">
                          {note.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-0">
                        <p className="text-sm text-zinc-600/90 mb-6 line-clamp-4 leading-relaxed whitespace-pre-wrap">
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
                            className="rounded-full bg-black/5 text-zinc-700 hover:bg-black/10 border-transparent text-xs font-medium px-2.5 shadow-sm"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {note.tags && note.tags.length > 3 && (
                          <Badge variant="secondary" className="rounded-full bg-black/5 text-zinc-700 text-xs font-medium px-2 shadow-sm">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <span className="text-xs font-medium text-zinc-400 shrink-0 ml-4">
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
