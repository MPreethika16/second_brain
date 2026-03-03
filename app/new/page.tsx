"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { X, UploadCloud, Loader2, CheckCircle2, Image as ImageIcon, FileText, Sparkles, BrainCircuit } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  url?: string;
  status: 'uploading' | 'done' | 'error';
}

export default function NewNotePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("note");
  
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  const [linkInput, setLinkInput] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Generate logic
  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) throw new Error("Failed to generate content");
      const { content: generatedContent } = await res.json();
      setContent(prev => prev ? `${prev}\n\n${generatedContent}` : generatedContent);
      if (!title) setTitle(aiPrompt); // Auto-fill title if empty
      setAiPrompt("");
    } catch (error) {
      console.error("Generate error", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Tags logic
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Links logic
  const addLink = () => {
    if (linkInput.trim()) {
      setLinks([...links, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const removeLink = (link: string) => {
    setLinks(links.filter((l) => l !== link));
  };

  // Upload Logic
  const handleFileChange = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles);
    
    // Add to state immediately with 'uploading' status
    const newUploads: UploadedFile[] = newFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      progress: 0,
      status: 'uploading'
    }));
    
    setUploads(prev => [...prev, ...newUploads]);

    // Process uploads
    for (const uploadItem of newUploads) {
      await processUpload(uploadItem);
    }
  };

  const processUpload = async (uploadItem: UploadedFile) => {
    const file = uploadItem.file;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      setUploads(prev => prev.map(u => {
        if (u.id === uploadItem.id && u.progress < 90) {
          return { ...u, progress: u.progress + 15 };
        }
        return u;
      }));
    }, 200);

    const { error } = await supabase.storage
      .from("attachments")
      .upload(filePath, file);

    clearInterval(progressInterval);

    if (error) {
      console.error("Error uploading file:", error);
      setUploads(prev => prev.map(u => u.id === uploadItem.id ? { ...u, status: 'error', progress: 0 } : u));
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("attachments")
      .getPublicUrl(filePath);

    setUploads(prev => prev.map(u => 
      u.id === uploadItem.id ? { ...u, status: 'done', progress: 100, url: publicUrl } : u
    ));
  };

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  // Final Save Logic
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const note = {
        title,
        content,
        type,
        tags,
        links,
        fileUrls: uploads.filter(u => u.status === 'done').map(u => u.url),
      };

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });

      if (!res.ok) throw new Error("Failed to save note");
      router.push("/dashboard");
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 py-16 px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header & Progress Indicator */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Document Knowledge
          </h1>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-zinc-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Form Container */}
        <Card className="p-8 rounded-3xl shadow-xl border-white/50 bg-white/70 backdrop-blur-xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">The Core Idea</h2>
                  <p className="text-sm text-zinc-500">What are you capturing today?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-sm font-medium text-zinc-700">Title</label>
                    <Input
                      placeholder="Enter a descriptive title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 text-lg rounded-xl border-zinc-200 focus-visible:ring-primary/20 transition-all bg-white/50"
                    />
                  </div>
                  <div className="space-y-4 md:col-span-1">
                    <label className="text-sm font-medium text-zinc-700">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full h-12 text-zinc-700 font-medium rounded-xl bg-white/50 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none px-4"
                    >
                      <option value="note">📝 Note</option>
                      <option value="link">🔗 Link</option>
                      <option value="insight">💡 Insight</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-700">Content</label>
                  </div>

                  {/* AI Generate Section */}
                  <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-4 rounded-2xl border border-primary/20 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-white p-2 rounded-xl shadow-sm text-primary shrink-0">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium text-zinc-800">Research with AI & Auto-fill</p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="What do you want to learn about?"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleGenerate();
                              }
                            }}
                            className="bg-white/80 transition-all border-white/40 focus-visible:ring-primary/30"
                            disabled={isGenerating}
                          />
                          <Button 
                            onClick={handleGenerate} 
                            disabled={isGenerating || !aiPrompt.trim()}
                            className="shrink-0 bg-primary hover:bg-primary/90 shadow-md transition-all rounded-xl"
                          >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Textarea
                    placeholder="Write your structured knowledge here. Markdown works too..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] resize-none rounded-xl border-zinc-200 focus-visible:ring-primary/20 transition-all text-base bg-white/50"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-zinc-700">Tags</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      className="rounded-xl bg-white/50"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <AnimatePresence>
                      {tags.map((tag) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition">
                            {tag}
                            <X size={14} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => removeTag(tag)} />
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => setStep(2)} 
                    disabled={!title || !content}
                    className="rounded-xl px-8 py-6 text-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    Next Step
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Context & Attachments</h2>
                  <p className="text-sm text-zinc-500">Provide supporting files or URLs.</p>
                </div>

                {/* Attachments Upload Zone */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-zinc-700">Attachments</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 hover:border-primary/50 bg-white/50 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-white/80 group"
                  >
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="text-primary" size={24} />
                    </div>
                    <p className="font-medium text-zinc-700 mb-1">Click to upload files</p>
                    <p className="text-sm text-zinc-500">Images, PDFs, documents up to 50MB</p>
                  </div>

                  <input
                    type="file"
                    hidden
                    ref={fileRef}
                    multiple
                    onChange={(e) => handleFileChange(e.target.files)}
                  />

                  {/* Uploads List with Progress */}
                  <div className="space-y-3 mt-4">
                    <AnimatePresence>
                      {uploads.map((u) => {
                        const isImage = u.file.type.startsWith("image/");
                        return (
                          <motion.div
                            key={u.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border border-zinc-100 rounded-xl p-3 flex items-center gap-4 shadow-sm"
                          >
                            <div className="w-12 h-12 rounded-lg bg-zinc-50 border flex items-center justify-center shrink-0 overflow-hidden relative">
                              {isImage ? (
                                u.url ? <img src={u.url} alt="preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-zinc-400" size={20} />
                              ) : (
                                <FileText className="text-zinc-400" size={20} />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1.5">
                                <p className="text-sm font-medium text-zinc-700 truncate pr-4">{u.file.name}</p>
                                <button onClick={() => removeUpload(u.id)} className="text-zinc-400 hover:text-red-500 transition">
                                  <X size={16} />
                                </button>
                              </div>
                              
                              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div 
                                  className={`h-full ${u.status === 'error' ? 'bg-red-500' : 'bg-primary'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${u.progress}%` }}
                                  transition={{ duration: 0.2 }}
                                />
                              </div>
                            </div>
                            
                            <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                              {u.status === 'uploading' && <Loader2 className="animate-spin text-zinc-400" size={18} />}
                              {u.status === 'done' && <CheckCircle2 className="text-emerald-500" size={20} />}
                              {u.status === 'error' && <X className="text-red-500" size={20} />}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                {/* URLs */}
                <div className="space-y-4 pt-4">
                  <label className="text-sm font-medium text-zinc-700">Reference Links</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://... and press Enter"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => {
                         if (e.key === "Enter") {
                           e.preventDefault();
                           addLink();
                         }
                      }}
                      className="rounded-xl bg-white/50"
                    />
                  </div>
                  <ul className="space-y-2 mt-3">
                    <AnimatePresence>
                      {links.map((link) => (
                        <motion.li
                          key={link}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex justify-between items-center bg-white border border-zinc-100 rounded-lg px-4 py-3 shadow-sm"
                        >
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                            {link}
                          </a>
                          <button onClick={() => removeLink(link)} className="text-zinc-400 hover:text-red-500 transition ml-4">
                            <X size={16} />
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl px-6">Back</Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    className="rounded-xl px-8 py-6 text-sm hover:scale-105 active:scale-95 transition-all bg-zinc-900"
                    disabled={uploads.some(u => u.status === 'uploading')}
                  >
                    Review Details
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Ready to Save</h2>
                  <p className="text-zinc-500 max-w-sm mx-auto">
                    Your knowledge is structured, tagged, and files are uploaded. Ready to commit to the second brain?
                  </p>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-medium text-zinc-500">Title</div>
                    <div className="col-span-2 font-semibold text-zinc-900">{title}</div>
                    
                    <div className="font-medium text-zinc-500">Tags</div>
                    <div className="col-span-2 flex gap-2 flex-wrap">
                      {tags.length > 0 ? tags.map(t => <Badge key={t} variant="outline" className="text-xs bg-white">{t}</Badge>) : 'None'}
                    </div>

                    <div className="font-medium text-zinc-500">Attachments</div>
                    <div className="col-span-2 font-medium text-zinc-900">{uploads.length} files</div>

                    <div className="font-medium text-zinc-500">Links</div>
                    <div className="col-span-2 font-medium text-zinc-900">{links.length} URLs</div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="rounded-xl px-6" disabled={isSaving}>Back</Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="rounded-xl px-10 py-6 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    {isSaving ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finalizing...</>
                    ) : (
                      "Commit Knowledge"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </main>
  );
}
