"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Note, NoteCreateInput, NoteUpdateInput, Tag } from "@/lib/api/types";
import { Chip } from "@/components/ui/Chip";

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function uniqueCaseInsensitive(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of names) {
    const k = n.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(n);
  }
  return out;
}

export interface NoteEditorModalProps {
  open: boolean;
  note?: Note | null;
  allTags: Tag[];
  onClose: () => void;
  onCreate: (input: NoteCreateInput) => Promise<void>;
  onUpdate: (noteId: string, input: NoteUpdateInput) => Promise<void>;
}

export function NoteEditorModal({
  open,
  note,
  allTags,
  onClose,
  onCreate,
  onUpdate,
}: NoteEditorModalProps) {
  const isEdit = Boolean(note);

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [tagText, setTagText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    setBusy(false);

    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTagText(note.tags.map((t) => t.name).join(", "));
    } else {
      setTitle("");
      setContent("");
      setTagText("");
    }
  }, [open, note]);

  const selectedTags = React.useMemo(() => uniqueCaseInsensitive(parseTags(tagText)), [tagText]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (isEdit && note) {
        await onUpdate(note.id, { title, content, tagNames: selectedTags });
      } else {
        await onCreate({ title, content, tagNames: selectedTags });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit note" : "New note"}
      description="Write your note and optionally attach tags."
      onClose={() => (busy ? null : onClose())}
      footer={
        <div className="flex items-center justify-between gap-3">
          {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" form="note-editor-form" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      }
    >
      <form id="note-editor-form" className="space-y-4" onSubmit={onSubmit}>
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Content</span>
          <textarea
            className="min-h-40 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something…"
          />
        </label>

        <Input
          label="Tags"
          hint="Comma-separated (e.g. work, personal, idea)"
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
          placeholder="work, personal"
        />

        {allTags.length ? (
          <div>
            <div className="text-xs font-medium text-slate-600">Quick add</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {allTags.map((t) => {
                const isSelected = selectedTags.some((n) => n.toLowerCase() === t.name.toLowerCase());
                return (
                  <Chip
                    key={t.id}
                    selected={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        const next = selectedTags.filter(
                          (n) => n.toLowerCase() !== t.name.toLowerCase(),
                        );
                        setTagText(next.join(", "));
                      } else {
                        setTagText(uniqueCaseInsensitive([...selectedTags, t.name]).join(", "));
                      }
                    }}
                  >
                    {t.name}
                  </Chip>
                );
              })}
            </div>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
