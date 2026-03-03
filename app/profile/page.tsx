"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User as UserIcon, Mail, Shield, Save } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setName(user?.user_metadata?.full_name || "");
      setLoading(false);
    });
  }, []);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: name }
    });

    setSaving(false);
    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: "Profile updated successfully.", type: 'success' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-zinc-50 flex items-center justify-center p-6">
      {/* Decorative Blob Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-8 text-center border-b border-zinc-200 pb-4">
          Your Profile
        </h1>
        
        <Card className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-b border-white/50 p-6 flex flex-row items-center gap-4">
            <div className="w-16 h-16 bg-white border border-white shadow-sm rounded-full flex items-center justify-center shrink-0">
              <UserIcon className="w-8 h-8 text-zinc-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-zinc-900">
                {name || "Explorer"}
              </CardTitle>
              <p className="text-sm text-zinc-500 font-medium">Manage your personal settings</p>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="space-y-4 shadow-sm bg-white/50 border border-zinc-100 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 mb-4 border-b pb-2">
                <Shield className="w-4 h-4 text-primary" />
                Account Details
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-zinc-100/50 rounded-xl text-zinc-600 font-medium cursor-not-allowed">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  {user?.email}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-zinc-500 ml-1 uppercase tracking-wider">Display Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white backdrop-blur-sm border border-zinc-200 rounded-xl px-4 py-5 focus-visible:ring-primary/20 transition-all font-medium text-zinc-900 h-12"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl border font-medium text-sm flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
              }`}>
                {message.text}
              </div>
            )}

            <Button
              onClick={handleUpdateProfile}
              disabled={saving}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl px-4 py-6 shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
