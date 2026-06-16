import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';
import { useAdminAvatars, useDeleteAvatar, useUploadAvatar } from '@/hooks/useAdmin';
import { Plus, Trash } from '@phosphor-icons/react';
import { useRef, useState } from 'react';

export function AdminAvatars() {
  const { data: avatars, isLoading, error } = useAdminAvatars();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const [confirmName, setConfirmName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <div className="p-8 text-text-muted">Chargement…</div>;
  if (error) return <div className="p-8 text-danger">Une erreur est survenue.</div>;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Le fichier doit être une image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("L'image ne doit pas dépasser 2 Mo.");
      return;
    }

    uploadAvatar.mutate(file, {
      onError: (err) =>
        setUploadError(err instanceof Error ? err.message : "Erreur lors de l'upload."),
      onSettled: () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 font-bold text-text-primary">Avatars</h1>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadAvatar.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-5 py-3 text-body-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Plus size={16} />
            {uploadAvatar.isPending ? 'Upload…' : 'Ajouter un avatar'}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="mb-4 rounded-card bg-danger/10 px-4 py-3 text-body-sm text-danger">
          {uploadError}
        </div>
      )}

      <div className="grid grid-cols-6 gap-4">
        {avatars?.map((avatar) => (
          <div key={avatar.name} className="group relative">
            <img
              src={avatar.url}
              alt={avatar.name}
              className="aspect-square w-full rounded-full object-cover bg-background"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '';
              }}
            />
            <button
              type="button"
              onClick={() => setConfirmName(avatar.name)}
              className="absolute right-0 top-0 flex size-7 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-danger text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
              title="Supprimer"
            >
              <Trash size={12} />
            </button>
            <p className="mt-1 truncate text-center text-[11px] text-text-muted">{avatar.name}</p>
          </div>
        ))}
        {avatars?.length === 0 && (
          <p className="col-span-6 py-8 text-center text-text-muted">
            Aucun avatar dans le bucket.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmName}
        title="Supprimer cet avatar ?"
        description="Les profils qui utilisent cet avatar verront une image cassée tant qu'ils n'en choisissent pas un autre."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => {
          if (confirmName) {
            deleteAvatar.mutate(confirmName, { onSettled: () => setConfirmName(null) });
          }
        }}
        onCancel={() => setConfirmName(null)}
      />
    </div>
  );
}
