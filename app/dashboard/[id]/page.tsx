"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Calendar, Layout, Link as LinkIcon, FileText, Image as ImageIcon } from "lucide-react";

interface NoteDetail {
  id: string;
  title: string;
  content: string;
  tags: string[];
  type: string;
  created_at: string;
}

export default function DetailedView() {
  const { id } = useParams();
  const router = useRouter();
  const [note, setNote] = useState<NoteDetail | null>(null);
  const [links, setLinks] = useState<{ id: string; url: string }[]>([]);
  const [attachments, setAttachments] = useState<{ id: string; file_url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch note
        const { data: noteData, error: noteError } = await supabase
          .from("knowledge_items")
          .select("*")
          .eq("id", id)
          .single();

        if (noteError) throw noteError;
        setNote(noteData);

        // Fetch links
        const { data: linkData } = await supabase
          .from("knowledge_links")
          .select("*")
          .eq("knowledge_item_id", id);
        if (linkData) setLinks(linkData);

        // Fetch attachments
        const { data: attachData } = await supabase
          .from("knowledge_attachments")
          .select("*")
          .eq("knowledge_item_id", id);
        if (attachData) setAttachments(attachData);

      } catch (err) {
        console.error("Failed to load details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 gap-4">
        <h2 className="text-xl font-medium text-zinc-500">Note not found</h2>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-zinc-50 pt-28 pb-20 px-6">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Top Navbar Context */}
        <div className="flex justify-between items-center bg-white/40 backdrop-blur-xl border border-white/40 p-4 rounded-2xl shadow-sm">
          <Button variant="ghost" className="gap-2 rounded-xl text-zinc-600 hover:text-zinc-900" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="capitalize bg-white shadow-sm px-3 py-1 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5" />
              {note.type || 'note'}
            </Badge>
            <span className="text-sm font-medium text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(note.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Content Container */}
        <Card className="rounded-3xl border border-white/60 bg-white/60 backdrop-blur-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 px-10 py-12 border-b border-white/50">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 mb-6 leading-tight">
              {note.title}
            </h1>
            <div className="flex gap-2 flex-wrap">
              {note.tags?.map(tag => (
                <Badge key={tag} className="bg-zinc-800 text-white border-zinc-700 px-3 py-1.5 text-sm font-medium rounded-lg">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <CardContent className="p-10 space-y-12">
            <div className="prose prose-zinc max-w-none">
              {note.content.split("\n").map((paragraph, i) => (
                <p key={i} className="text-lg text-zinc-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {(links.length > 0 || attachments.length > 0) && (
              <div className="pt-8 border-t border-zinc-200/50 grid md:grid-cols-2 gap-8">
                {links.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-zinc-900 flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-blue-500" /> References
                    </h3>
                    <ul className="space-y-2">
                      {links.map(l => (
                        <li key={l.id}>
                          <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block truncate p-3 bg-white/50 rounded-xl border border-zinc-100 shadow-sm transition-all hover:shadow-md">
                            {l.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-zinc-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-500" /> Files
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {attachments.map(a => {
                        const isImage = a.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                        return (
                          <a 
                            key={a.id} 
                            href={a.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-white/50 border border-zinc-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex items-center gap-3 overflow-hidden"
                          >
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 shrink-0 flex items-center justify-center">
                              {isImage ? <ImageIcon className="w-5 h-5 text-zinc-400" /> : <FileText className="w-5 h-5 text-zinc-400" />}
                            </div>
                            <span className="text-xs font-medium text-zinc-700 truncate block w-full text-left">
                              {a.file_url.split('/').pop()}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}