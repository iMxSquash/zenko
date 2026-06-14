import { Button } from '@/components/ui/Button/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';
import { TextInput } from '@/components/ui/TextInput/TextInput';
import {
  useAdminDeleteUser,
  useAdminUpdateUser,
  useAdminUserDetail,
  useToggleAdmin,
} from '@/hooks/useAdmin';
import type { AdminUserUpdate } from '@/hooks/useAdmin';
import { useAuth } from '@/lib/supabase/use-auth';
import { cn } from '@/lib/utils';
import { ROLES } from '@/types';
import type { ForumUserRole } from '@/types';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  Instagram,
  Linkedin,
  ShieldCheck,
  ShieldOff,
  Stethoscope,
  Twitter,
} from 'lucide-react';
import { useState } from 'react';

interface AdminUserDetailProps {
  userId: string;
}

export function AdminUserDetail({ userId }: AdminUserDetailProps) {
  const { data: user, isLoading, error } = useAdminUserDetail(userId);
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();
  const toggleAdmin = useToggleAdmin();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [role, setRole] = useState<ForumUserRole | null | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (isLoading) return <div className="p-8 text-text-muted">Chargement…</div>;
  if (error || !user) return <div className="p-8 text-danger">Utilisateur introuvable.</div>;

  const currentFirstName = firstName ?? user.firstName ?? '';
  const currentLastName = lastName ?? user.lastName ?? '';
  const currentRole = role === undefined ? user.role : role;
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email.split('@')[0];
  const hasPendingChanges = firstName !== null || lastName !== null || role !== undefined;
  const isSelf = currentUser?.id === userId;

  function handleSave() {
    setSaveError(null);
    setSaved(false);
    const input: AdminUserUpdate = {};
    if (firstName !== null) input.firstName = firstName.trim();
    if (lastName !== null) input.lastName = lastName.trim();
    if (role !== undefined) input.role = currentRole;

    updateUser.mutate(
      { userId, input },
      {
        onSuccess: () => {
          setSaved(true);
          setFirstName(null);
          setLastName(null);
          setRole(undefined);
        },
        onError: (err) => setSaveError(err instanceof Error ? err.message : 'Erreur inconnue'),
      }
    );
  }

  function handleToggleAdmin() {
    toggleAdmin.mutate(
      { userId, makeAdmin: !user?.isAdmin },
      {
        onSettled: () => setConfirmToggle(false),
        onError: (err) => setSaveError(err instanceof Error ? err.message : 'Erreur inconnue'),
      }
    );
  }

  function handleDelete() {
    deleteUser.mutate(userId, {
      onSuccess: () => navigate({ to: '/admin/utilisateurs' }),
      onError: (err) =>
        setSaveError(err instanceof Error ? err.message : 'Erreur lors de la suppression'),
    });
  }

  const createdAt = new Date(user.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-8">
      <button
        type="button"
        onClick={() => navigate({ to: '/admin/utilisateurs' })}
        className="mb-6 flex items-center gap-2 text-body-sm font-medium text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={16} />
        Retour aux utilisateurs
      </button>

      <h1 className="mb-6 text-h2 font-bold text-text-primary">Fiche utilisateur</h1>

      {saveError && (
        <div className="mb-6 rounded-card bg-danger/10 px-4 py-3 text-body-sm text-danger">
          {saveError}
        </div>
      )}
      {saved && (
        <div className="mb-6 rounded-card bg-success/10 px-4 py-3 text-body-sm text-success">
          Modifications enregistrées.
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Header card */}
        <section className="flex flex-wrap items-center gap-5 rounded-card-lg border border-border bg-surface p-6 shadow-sm">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="size-20 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-pedopsy-bg">
              <span className="text-2xl font-bold text-pedopsy">
                {displayName[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-h3 font-bold text-text-primary">{displayName}</p>
              {user.isAdmin && (
                <span className="shrink-0 rounded-full bg-brand-100/10 px-3 py-1 text-[12px] font-semibold text-brand-100">
                  Admin
                </span>
              )}
            </div>
            <p className="text-body-sm text-text-secondary">{user.email}</p>
            <p className="text-[12px] text-text-muted">Inscrit le {createdAt}</p>
          </div>

          {/* Toggle admin button */}
          <button
            type="button"
            onClick={() => setConfirmToggle(true)}
            disabled={isSelf || toggleAdmin.isPending}
            title={isSelf ? 'Impossible de modifier ses propres droits' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-body-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40',
              user.isAdmin
                ? 'border-danger/40 text-danger hover:bg-danger/5'
                : 'border-brand/40 text-brand-100 hover:bg-brand/5'
            )}
          >
            {user.isAdmin ? (
              <>
                <ShieldOff size={15} />
                Retirer admin
              </>
            ) : (
              <>
                <ShieldCheck size={15} />
                Rendre admin
              </>
            )}
          </button>
        </section>

        {/* Identity form */}
        <section className="rounded-card-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-5 text-h3 font-bold text-text-primary">Identité</h2>
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Prénom"
              value={currentFirstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prénom"
            />
            <TextInput
              label="Nom"
              value={currentLastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nom de famille"
            />
          </div>
        </section>

        {/* Role form */}
        <section className="rounded-card-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-5 text-h3 font-bold text-text-primary">Rôle</h2>
          <div className="flex flex-wrap gap-3">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={cn(
                  'flex items-center gap-3 rounded-card border px-4 py-3 text-body-sm font-semibold transition-all',
                  currentRole === r.id
                    ? 'border-brand bg-surface shadow-[0px_4px_12px_0px_rgba(47,157,212,0.15)]'
                    : 'border-border bg-background hover:border-brand/40'
                )}
              >
                <span
                  className="flex size-8 items-center justify-center rounded-xl text-base"
                  style={{ background: r.iconBg, color: r.iconColor }}
                >
                  {r.icon}
                </span>
                {r.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setRole(null)}
              className={cn(
                'flex items-center gap-3 rounded-card border px-4 py-3 text-body-sm font-semibold transition-all',
                currentRole === null
                  ? 'border-brand bg-surface'
                  : 'border-border bg-background hover:border-brand/40'
              )}
            >
              <span className="flex size-8 items-center justify-center rounded-xl bg-background text-text-muted">
                —
              </span>
              Aucun
            </button>
          </div>
        </section>

        {/* Social links (read-only) */}
        {(user.linkedinUrl || user.instagramUrl || user.twitterUrl || user.doctolibUrl) && (
          <section className="rounded-card-lg border border-border bg-surface p-6 shadow-sm">
            <h2 className="mb-4 text-h3 font-bold text-text-primary">Liens</h2>
            <div className="flex flex-wrap gap-3">
              {user.linkedinUrl && (
                <SocialLink href={user.linkedinUrl} icon={Linkedin} label="LinkedIn" />
              )}
              {user.instagramUrl && (
                <SocialLink href={user.instagramUrl} icon={Instagram} label="Instagram" />
              )}
              {user.twitterUrl && (
                <SocialLink href={user.twitterUrl} icon={Twitter} label="Twitter / X" />
              )}
              {user.doctolibUrl && (
                <SocialLink href={user.doctolibUrl} icon={Stethoscope} label="Doctolib" />
              )}
            </div>
          </section>
        )}

        {/* Save actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFirstName(null);
              setLastName(null);
              setRole(undefined);
              setSaved(false);
            }}
            disabled={!hasPendingChanges || updateUser.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasPendingChanges || updateUser.isPending}
          >
            {updateUser.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>

        {/* Danger zone */}
        <section className="rounded-card-lg border border-danger/30 bg-surface p-6 shadow-sm">
          <h2 className="mb-2 text-h3 font-bold text-danger">Zone dangereuse</h2>
          <p className="mb-5 text-body-sm text-text-secondary">
            La suppression du compte est irréversible. Toutes les données liées (forum, progression)
            seront effacées.
          </p>
          <Button
            type="button"
            variant="danger"
            onClick={() => setConfirmDelete(true)}
            disabled={user.isAdmin || isSelf}
          >
            Supprimer le compte
          </Button>
          {user.isAdmin && !isSelf && (
            <p className="mt-2 text-[12px] text-text-muted">
              Retirez d'abord les droits admin avant de supprimer ce compte.
            </p>
          )}
        </section>
      </div>

      {/* Toggle admin confirmation */}
      <ConfirmDialog
        open={confirmToggle}
        title={user.isAdmin ? 'Retirer les droits admin ?' : 'Rendre cet utilisateur admin ?'}
        description={
          user.isAdmin
            ? `"${displayName}" ne pourra plus accéder à l'espace admin.`
            : `"${displayName}" aura accès à l'intégralité de l'espace admin.`
        }
        confirmLabel={user.isAdmin ? 'Retirer' : 'Confirmer'}
        variant={user.isAdmin ? 'danger' : 'default'}
        onConfirm={handleToggleAdmin}
        onCancel={() => setConfirmToggle(false)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer ce compte ?"
        description={`Le compte de "${displayName}" (${user.email}) sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Linkedin;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex items-center gap-2 rounded-full border border-border-default px-4 py-2 text-body-sm text-text-secondary transition-colors hover:border-brand hover:text-brand"
    >
      <Icon size={16} />
      {label}
    </a>
  );
}
