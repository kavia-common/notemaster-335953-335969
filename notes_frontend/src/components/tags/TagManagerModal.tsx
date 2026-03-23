"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tag } from "@/lib/api/types";
import { Chip } from "@/components/ui/Chip";

export interface TagManagerModalProps {
  open: boolean;
  tags: Tag[];
  onClose: () => void;
  onCreateTag: (name: string) => Promise<void>;
  onDeleteTag: (tagId: string) => Promise<void>;
}

export function TagManagerModal({
  open,
  tags,
  onClose,
  onCreateTag,
  onDeleteTag,
}: TagManagerModalProps) {
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setError(null);
    setBusy(false);
  }, [open]);

  async function create() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Tag name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onCreateTag(trimmed);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tag");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Manage tags"
      description="Create and delete tags used for filtering and organizing notes."
      onClose={() => (busy ? null : onClose())}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="New tag"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. work"
            />
          </div>
          <Button onClick={create} disabled={busy}>
            Create
          </Button>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div>
          <div className="text-xs font-medium text-slate-600">Existing tags</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.length ? (
              tags.map((t) => (
                <Chip key={t.id} onClick={() => null} onRemove={() => onDeleteTag(t.id)}>
                  {t.name}
                </Chip>
              ))
            ) : (
              <p className="text-sm text-slate-500">No tags yet.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
