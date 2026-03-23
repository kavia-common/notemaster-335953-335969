"use client";

import * as React from "react";
import { Note } from "@/lib/api/types";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

export interface NoteCardProps {
  note: Note;
  view: "grid" | "list";
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function NoteCard({ note, view, onEdit, onDelete }: NoteCardProps) {
  return (
    <article
      className={
        "rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow " +
        (view === "list" ? "p-4" : "p-5")
      }
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{note.title}</h3>
          <p className="mt-1 text-xs text-slate-500">Updated {formatDate(note.updatedAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onEdit(note)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note)}
            className="text-red-600 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      </header>

      <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-slate-700">{note.content}</p>

      {note.tags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {note.tags.map((t) => (
            <Chip key={t.id} title={t.name}>
              {t.name}
            </Chip>
          ))}
        </div>
      ) : (
        <div className="mt-4 text-xs text-slate-400">No tags</div>
      )}
    </article>
  );
}
