"use client";

import * as React from "react";
import { createNotesApi } from "@/lib/api/client";
import { Note, NoteCreateInput, NoteListQuery, NoteUpdateInput, Tag } from "@/lib/api/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteEditorModal } from "@/components/notes/NoteEditorModal";
import { TagManagerModal } from "@/components/tags/TagManagerModal";

type ViewMode = "grid" | "list";

const api = createNotesApi();

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export default function Home() {
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [view, setView] = React.useState<ViewMode>("grid");
  const [q, setQ] = React.useState("");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);

  const [tagManagerOpen, setTagManagerOpen] = React.useState(false);

  const debouncedQ = useDebouncedValue(q, 250);

  const query: NoteListQuery = React.useMemo(
    () => ({
      q: debouncedQ.trim() ? debouncedQ.trim() : undefined,
      tag: activeTag ?? undefined,
      sort: "updated_desc",
    }),
    [debouncedQ, activeTag],
  );

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      const [notesRes, tagsRes] = await Promise.all([api.listNotes(query), api.listTags()]);
      setNotes(notesRes);
      setTags(tagsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.q, query.tag, query.sort]);

  async function onCreate(input: NoteCreateInput) {
    await api.createNote(input);
    await refreshAll();
  }

  async function onUpdate(noteId: string, input: NoteUpdateInput) {
    await api.updateNote(noteId, input);
    await refreshAll();
  }

  async function onDelete(note: Note) {
    const ok = window.confirm(`Delete "${note.title}"? This cannot be undone.`);
    if (!ok) return;
    await api.deleteNote(note.id);
    await refreshAll();
  }

  async function onCreateTag(name: string) {
    await api.createTag(name);
    await refreshAll();
  }

  async function onDeleteTag(tagId: string) {
    const tag = tags.find((t) => t.id === tagId);
    const ok = window.confirm(`Delete tag "${tag?.name ?? ""}"? It will be removed from notes.`);
    if (!ok) return;
    await api.deleteTag(tagId);
    // if user deleted the active tag, clear filter
    if (tag && activeTag?.toLowerCase() === tag.name.toLowerCase()) {
      setActiveTag(null);
    }
    await refreshAll();
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-slate-900">NoteMaster</h1>
            <p className="mt-0.5 text-sm text-slate-600">Lightweight notes with tags.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setTagManagerOpen(true)}>
              Tags
            </Button>
            <Button
              onClick={() => {
                setEditingNote(null);
                setEditorOpen(true);
              }}
            >
              New note
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Controls */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <Input
                label="Search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, content, or tags…"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={view === "grid" ? "primary" : "secondary"}
                onClick={() => setView("grid")}
              >
                Grid
              </Button>
              <Button
                variant={view === "list" ? "primary" : "secondary"}
                onClick={() => setView("list")}
              >
                List
              </Button>
            </div>
          </div>

          {/* Tag filter row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Filter:</span>
            <Chip selected={activeTag === null} onClick={() => setActiveTag(null)}>
              All
            </Chip>
            {tags.map((t) => (
              <Chip
                key={t.id}
                selected={activeTag?.toLowerCase() === t.name.toLowerCase()}
                onClick={() =>
                  setActiveTag((cur) =>
                    cur?.toLowerCase() === t.name.toLowerCase() ? null : t.name,
                  )
                }
              >
                {t.name}
              </Chip>
            ))}
          </div>

          {/* Env helper */}
          <div className="mt-3 text-xs text-slate-500">
            Backend base URL:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">
              {process.env.NEXT_PUBLIC_NOTES_API_BASE_URL ?? "(not set; using local fallback)"}
            </code>
          </div>
        </section>

        {/* Content */}
        <section className="mt-6">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : notes.length ? (
            <div
              className={
                view === "grid"
                  ? "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "mt-6 flex flex-col gap-3"
              }
            >
              {notes.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  view={view}
                  onEdit={(note) => {
                    setEditingNote(note);
                    setEditorOpen(true);
                  }}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">No notes yet</h2>
              <p className="mt-2 text-sm text-slate-600">
                Create your first note, then use tags to keep things organized.
              </p>
              <div className="mt-5 flex items-center justify-center gap-2">
                <Button
                  onClick={() => {
                    setEditingNote(null);
                    setEditorOpen(true);
                  }}
                >
                  New note
                </Button>
                <Button variant="secondary" onClick={() => setTagManagerOpen(true)}>
                  Manage tags
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>

      <NoteEditorModal
        open={editorOpen}
        note={editingNote}
        allTags={tags}
        onClose={() => setEditorOpen(false)}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />

      <TagManagerModal
        open={tagManagerOpen}
        tags={tags}
        onClose={() => setTagManagerOpen(false)}
        onCreateTag={onCreateTag}
        onDeleteTag={onDeleteTag}
      />
    </div>
  );
}
