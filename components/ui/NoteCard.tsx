import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface Note {
  id: string
  title: string
  content: string
  type: string
  created_at: string
}

export default function NoteCard({ note }: { note: Note }) {
  return (
    <Link href={`/dashboard/${note.id}`}>
      <div className="group rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
        
        {/* Title */}
        <h3 className="text-lg font-semibold tracking-tight">
          {note.title}
        </h3>

        {/* Content Preview */}
        <p className="mt-2 text-sm text-zinc-600 line-clamp-3">
          {note.content}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="secondary" className="capitalize">
            {note.type}
          </Badge>

          <span className="text-xs text-zinc-400">
            {new Date(note.created_at).toLocaleDateString()}
          </span>
        </div>

      </div>
    </Link>
  )
}