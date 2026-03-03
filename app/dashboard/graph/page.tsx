"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ReactFlow, Background, Controls, Edge, Node, addEdge, useNodesState, useEdgesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function GraphView() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      const { data } = await supabase.from("knowledge_items").select("*");
      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const radius = Math.max(300, data.length * 40);
      const angleStep = (2 * Math.PI) / Math.max(1, data.length);

      data.forEach((note, i) => {
        // Place nodes in a circle
        const x = cx + Math.cos(angleStep * i) * radius;
        const y = cy + Math.sin(angleStep * i) * radius;

        newNodes.push({
          id: note.id,
          position: { x, y },
          data: { label: note.title },
          style: {
            background: "rgba(255, 255, 255, 0.8)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            padding: "10px 15px",
            fontSize: "14px",
            fontWeight: 600,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            width: 150,
          },
        });

        // Find connections based on shared tags
        data.forEach((other) => {
          if (note.id !== other.id) {
            const sharedTags = note.tags?.filter((t: string) => other.tags?.includes(t)) || [];
            if (sharedTags.length > 0) {
              const edgeId = `e-${note.id}-${other.id}`;
              const reverseEdgeId = `e-${other.id}-${note.id}`;
              
              if (!newEdges.find(e => e.id === edgeId || e.id === reverseEdgeId)) {
                newEdges.push({
                  id: edgeId,
                  source: note.id,
                  target: other.id,
                  animated: true,
                  style: { stroke: "#3b82f6", strokeWidth: 1.5, opacity: 0.5 },
                });
              }
            }
          }
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
      setLoading(false);
    };

    fetchGraph();
  }, [setNodes, setEdges]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="h-screen w-full relative bg-zinc-50 overflow-hidden pt-20 flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="p-6 flex justify-between items-center z-10 bg-white/40 backdrop-blur-md border-b border-white/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Knowledge Graph</h1>
          <p className="text-sm text-zinc-500 font-medium">Relationships via shared tags.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-full shadow-sm gap-2 bg-white/60">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="flex-1 w-full relative z-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          className="bg-transparent"
        >
          <Background color="#ccc" gap={20} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </main>
  );
}
