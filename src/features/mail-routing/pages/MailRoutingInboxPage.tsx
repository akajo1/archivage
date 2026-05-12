import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  RiMailLine,
  RiFilterLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiArrowRightLine,
  RiUserLine,
  RiCalendarLine,
  RiChat3Line,
  RiAddLine,
  RiCloseLine,
  RiUploadCloud2Line,
  RiPencilLine,
  RiFileTextLine,
  RiBookmarkLine,
  RiAlignLeft,
  RiAttachment2,
  RiDeleteBinLine,
  RiCheckLine,
  RiArrowDownLine,
} from 'react-icons/ri';
import { useMailRoutingInbox } from '../hooks/useMailRouting';
import { MailStatusBadge } from '../components/MailStatusBadge';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import type { MailRouting } from '../types/mail-routing.types';
import { mailRoutingClient } from '../services/mailRoutingClient';
import { documentService } from '../../documents/services/documentService';
import { badgeService } from '../../badges/services/badgeService';
import { confidentialityService } from '../../confidentiality/services/confidentialityService';
import { usePermissions } from '../../auth/hooks/usePermissions';
import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';
import { FileUpload } from '../../../shared/components/molecules/FileUpload';
import { RichTextEditor } from '../../../shared/components/molecules/RichTextEditor';
import { MultiFileUpload } from '../../../shared/components/molecules/MultiFileUpload';
import { userManagementService } from '../../users/services/userManagementService';
import type { ManagedUser } from '../../users/types/userManagement.types';
import { Button } from '../../../shared/components/atoms/Button';
import { ParticipantRole } from '../types/mail-routing.types';

type ContentMode = 'upload' | 'write';

interface MailStep {
  id: string;
  order: number;
  role: ParticipantRole;
  userIds: string[];
}

const STATUS_FILTERS = [
  { key: '', label: 'Tous' },
  { key: 'pending', label: 'En attente' },
  { key: 'forwarded', label: 'Transmis' },
  { key: 'in_review', label: 'En révision' },
  { key: 'verified', label: 'Validé' },
  { key: 'completed', label: 'Terminé' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  forwarded: 'bg-blue-100 text-blue-800',
  in_review: 'bg-purple-100 text-purple-800',
  verified: 'bg-green-100 text-green-800',
  completed: 'bg-[#dbeaf3] text-[#234C6A]',
  rejected: 'bg-red-100 text-red-800',
  returned: 'bg-orange-100 text-orange-800',
};

const SectionCard = ({
  icon,
  title,
  children,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  badge?: string;
}) => (
  <div className="overflow-hidden rounded-2xl border border-[#dde8f0] bg-white shadow-sm">
    <div className="flex items-center gap-2.5 border-b border-[#dde8f0] bg-[#f4f7fa] px-5 py-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dbeaf3] text-[#234C6A]">
        {icon}
      </span>
      <span className="text-sm font-semibold text-[#1B3C53]">{title}</span>
      {badge && (
        <span className="ml-auto rounded-full bg-[#dbeaf3] px-2 py-0.5 text-[10px] font-medium text-[#234C6A]">
          {badge}
        </span>
      )}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const ModeOption = ({
  active,
  onClick,
  icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-1 flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all ${
      active
        ? 'border-[#234C6A] bg-[#edf4f8] shadow-md'
        : 'border-[#dde8f0] bg-white hover:border-[#a8c8de] hover:bg-[#f4f7fa]'
    }`}
  >
    <span className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
      active ? 'bg-[#234C6A] text-white' : 'bg-[#edf4f8] text-[#456882]'
    }`}>
      {icon}
    </span>
    <div>
      <p className={`text-sm font-semibold ${active ? 'text-[#1B3C53]' : 'text-[#456882]'}`}>{title}</p>
      <p className="mt-0.5 text-xs text-[#7aaac4]">{description}</p>
    </div>
  </button>
);

const RoutingCard: React.FC<{ routing: MailRouting; onClick: () => void }> = ({ routing, onClick }) => {
  const isOverdue = routing.dueDate && new Date(routing.dueDate) < new Date() && routing.status !== 'completed';

  return (
    <div
      onClick={onClick}
      className={`arch-card group cursor-pointer rounded-2xl border p-5 transition-all hover:shadow-md ${
        isOverdue ? 'border-red-200 bg-red-50/30' : 'border-[#dde8f0] hover:border-[#a8c8de]'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          STATUS_COLORS[routing.status] ?? 'bg-[#edf4f8] text-[#456882]'
        }`}>
          <RiMailLine className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          {/* Title + status */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-semibold text-[#1B3C53] group-hover:text-[#234C6A] truncate max-w-xs sm:max-w-md">
              {routing.document?.title ?? '—'}
            </h3>
            <MailStatusBadge status={routing.status} size="sm" />
          </div>

          {/* Registration number */}
          {routing.document?.registrationNumber && (
            <p className="mt-0.5 font-mono text-xs text-[#7aaac4]">
              N° {routing.document.registrationNumber}
            </p>
          )}

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#456882]">
            <span className="inline-flex items-center gap-1">
              <RiUserLine className="h-3.5 w-3.5" />
              De {routing.initiatedBy?.name ?? '—'}
            </span>
            <span className="inline-flex items-center gap-1">
              <RiCalendarLine className="h-3.5 w-3.5" />
              {new Date(routing.createdAt).toLocaleDateString('fr-FR')}
            </span>
            {routing.dueDate && (
              <span className={`inline-flex items-center gap-1 ${isOverdue ? 'font-semibold text-red-600' : ''}`}>
                <RiTimeLine className="h-3.5 w-3.5" />
                {isOverdue ? 'En retard — ' : 'Échéance '}
                {new Date(routing.dueDate).toLocaleDateString('fr-FR')}
              </span>
            )}
            {(routing.comments?.length ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-[#234C6A]">
                <RiChat3Line className="h-3.5 w-3.5" />
                {routing.comments.length} commentaire{routing.comments.length > 1 ? 's' : ''}
              </span>
            )}
            {(routing.participants?.length ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1">
                <RiUserLine className="h-3.5 w-3.5" />
                {routing.participants.length} participant{routing.participants.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <RiArrowRightLine className="h-4 w-4 shrink-0 text-[#c4d4df] transition-colors group-hover:text-[#456882]" />
      </div>
    </div>
  );
};

export const MailRoutingInboxPage: React.FC = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('');
  const { routings, total, loading, error } = useMailRoutingInbox();
  const { canCreateFeature, canEditFeature } = usePermissions();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [mailTitle, setMailTitle] = useState('');
  const [mailReference, setMailReference] = useState('');
  const [mailDescription, setMailDescription] = useState('');
  const [mailContent, setMailContent] = useState('<p></p>');
  const [mailFile, setMailFile] = useState<File | null>(null);
  const [mailAnnexes, setMailAnnexes] = useState<File[]>([]);
  const [contentMode, setContentMode] = useState<ContentMode>('write');
  const [mailDueDate, setMailDueDate] = useState('');
  const [mailRoutingNote, setMailRoutingNote] = useState('');
  const [mailBadgeId, setMailBadgeId] = useState('');
  const [mailConfidentialityId, setMailConfidentialityId] = useState('');
  const [mailSteps, setMailSteps] = useState<MailStep[]>([
    { id: '1', order: 1, role: ParticipantRole.RECEIVER, userIds: [] },
  ]);
  const [allUsers, setAllUsers] = useState<ManagedUser[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [confidentialities, setConfidentialities] = useState<Confidentiality[]>([]);

  const canInitDirectMail = canCreateFeature('documents') || canEditFeature('mail_routing');

  useEffect(() => {
    if (!showCreateModal) return;
    userManagementService.getAll().then(setAllUsers).catch(() => {});
    Promise.all([badgeService.getAll(), confidentialityService.getAll()])
      .then(([badgeList, confList]) => {
        setBadges(badgeList);
        setConfidentialities(confList);
        if (!mailBadgeId && badgeList.length > 0) setMailBadgeId(badgeList[0].id);
        if (!mailConfidentialityId && confList.length > 0) setMailConfidentialityId(confList[0].id);
      })
      .catch(() => {
        void Swal.fire({
          title: 'Erreur',
          text: 'Impossible de charger les paramètres du courrier.',
          icon: 'error',
        });
      });
  }, [showCreateModal, mailBadgeId, mailConfidentialityId]);

  const resetCreateForm = () => {
    setMailTitle('');
    setMailReference('');
    setMailDescription('');
    setMailContent('<p></p>');
    setMailFile(null);
    setMailAnnexes([]);
    setContentMode('write');
    setMailDueDate('');
    setMailRoutingNote('');
    setMailSteps([{ id: '1', order: 1, role: ParticipantRole.RECEIVER, userIds: [] }]);
  };

  const addStepUser = (stepId: string, userId: string) => {
    if (!userId) return;
    setMailSteps((prev) => prev.map((step) =>
      step.id === stepId && !step.userIds.includes(userId)
        ? { ...step, userIds: [...step.userIds, userId] }
        : step
    ));
  };

  const removeStepUser = (stepId: string, userId: string) => {
    setMailSteps((prev) => prev.map((step) =>
      step.id === stepId
        ? { ...step, userIds: step.userIds.filter((id) => id !== userId) }
        : step
    ));
                          {/* Add user to this step */}
                          <div className="flex gap-2 border-t border-[#dde8f0] pt-3">
                            <select
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  addStepUser(step.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="flex-1 rounded-lg border border-[#c4d4df] bg-white px-2.5 py-1.5 text-xs text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                            >
                              <option value="">Ajouter un utilisateur...</option>
                              {allUsers
                                .filter((u) => !step.userIds.includes(u.id))
                                .map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name} ({u.role})
                                  </option>
                                ))}
                            </select>
                          </div>
  };

  const addStep = () => {
    const newOrder = Math.max(...mailSteps.map((s) => s.order), 0) + 1;
    const newId = `${newOrder}`;
    setMailSteps((prev) => [...prev, { id: newId, order: newOrder, role: ParticipantRole.REVIEWER, userIds: [] }]);
  };

  const removeStep = (stepId: string) => {
    setMailSteps((prev) => prev.filter((s) => s.id !== stepId));
  };

  const handleCreateAndInit = async () => {
    if (!mailTitle.trim() || !mailBadgeId || !mailConfidentialityId) {
      void Swal.fire({
        title: 'Champs requis',
        text: 'Titre, badge et confidentialité sont obligatoires.',
        icon: 'warning',
      });
      return;
    }

    // Validate that at least one step has participants
    const hasParticipants = mailSteps.some((step) => step.userIds.length > 0);
    if (!hasParticipants) {
      void Swal.fire({
        title: 'Étapes requises',
        text: 'Ajoutez au moins un utilisateur à une étape du circuit de traitement.',
        icon: 'warning',
      });
      return;
    }

    const plainContent = mailContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();

    if (contentMode === 'write' && !plainContent) {
      void Swal.fire({
        title: 'Contenu requis',
        text: 'Renseignez le contenu du courriel en mode rédaction.',
        icon: 'warning',
      });
      return;
    }

    if (contentMode === 'upload' && !mailFile) {
      void Swal.fire({
        title: 'Fichier requis',
        text: 'Ajoutez un fichier principal en mode upload.',
        icon: 'warning',
      });
      return;
    }

    setCreateLoading(true);
    try {
      const createdDocument = await documentService.create({
        title: mailTitle.trim(),
        reference: mailReference.trim() || undefined,
        description: mailDescription.trim() || undefined,
        content: contentMode === 'write' ? mailContent : undefined,
        file: contentMode === 'upload' ? (mailFile ?? undefined) : undefined,
        annexes: mailAnnexes.length > 0 ? mailAnnexes : undefined,
        badge_id: mailBadgeId,
        confidentiality_id: mailConfidentialityId,
      });

      const routing = await mailRoutingClient.initializeRouting({
        documentId: createdDocument.id,
        dueDate: mailDueDate || undefined,
        notes: mailRoutingNote.trim() || undefined,
      });

      // Add all step participants to routing
      for (const step of mailSteps) {
        for (const userId of step.userIds) {
          await mailRoutingClient.addParticipant(routing.id, {
            userId,
            role: step.role,
          });
        }
      }

      // Set current assignee to first receiver
      const firstReceiverStep = mailSteps.find((s) => s.role === ParticipantRole.RECEIVER);
      if (firstReceiverStep?.userIds[0]) {
        // Could call an update endpoint here if needed
      }

      setShowCreateModal(false);
      resetCreateForm();
      void Swal.fire({
        title: 'Courriel créé',
        text: 'Le circuit de traitement est initié.',
        icon: 'success',
        confirmButtonText: 'Voir le circuit',
        showCancelButton: true,
        cancelButtonText: 'Rester ici',
      }).then((result) => {
        if (result.isConfirmed) navigate(`/mail-routing/${routing.id}`);
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création du courriel.';
      void Swal.fire({ title: 'Erreur', text: message, icon: 'error' });
    } finally {
      setCreateLoading(false);
    }
  };

  const filtered = filterStatus ? routings.filter((r) => r.status === filterStatus) : routings;

  const pending = routings.filter((r) => ['pending', 'forwarded', 'in_review', 'returned'].includes(r.status)).length;
  const completed = routings.filter((r) => r.status === 'completed').length;
  const overdue = routings.filter((r) => r.dueDate && new Date(r.dueDate) < new Date() && r.status !== 'completed').length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="arch-hero relative overflow-hidden rounded-3xl px-8 py-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">📮 Circuit de traitement</h1>
            <p className="mt-1 text-[#a8c8de]">Documents en cours de traitement vous concernant</p>
          </div>
          {canInitDirectMail && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/25"
            >
              <RiAddLine className="h-4 w-4" /> Nouveau courriel
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { label: 'À traiter', value: pending, color: 'text-amber-300' },
            { label: 'Terminés', value: completed, color: 'text-green-300' },
            { label: 'En retard', value: overdue, color: 'text-red-300' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/10 px-4 py-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <RiFilterLine className="h-4 w-4 text-[#7aaac4]" />
        {STATUS_FILTERS.map((f) => {
          const count = f.key ? routings.filter((r) => r.status === f.key).length : total;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilterStatus(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === f.key
                  ? 'bg-[#234C6A] text-white shadow-sm'
                  : 'bg-[#edf4f8] text-[#456882] hover:bg-[#dbeaf3]'
              }`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="rounded-2xl border border-[#f4a8bf] bg-[#fce8ef] p-4 text-sm text-[#BD114A]">
          Erreur : {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="arch-card rounded-2xl p-12 text-center">
          <RiMailLine className="mx-auto h-12 w-12 text-[#c4d4df]" />
          <p className="mt-4 font-medium text-[#456882]">
            {total === 0 ? 'Aucun document dans votre circuit.' : 'Aucun résultat pour ce filtre.'}
          </p>
          {total === 0 && (
            <p className="mt-1 text-sm text-[#7aaac4]">
              Les documents transmis ou assignés apparaîtront ici.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((routing) => (
            <RoutingCard
              key={routing.id}
              routing={routing}
              onClick={() => navigate(`/mail-routing/${routing.id}`)}
            />
          ))}
        </div>
      )}

      {/* Completed section footer */}
      {completed > 0 && filterStatus === '' && (
        <div className="rounded-2xl border border-[#dde8f0] bg-[#f4f7fa] px-5 py-3 text-sm text-[#456882]">
          <RiCheckDoubleLine className="mr-1.5 inline h-4 w-4 text-[#2FA084]" />
          {completed} circuit{completed > 1 ? 's' : ''} terminé{completed > 1 ? 's' : ''} — archivés ou clôturés
        </div>
      )}

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !createLoading) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#dde8f0] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dde8f0] px-5 py-4">
              <p className="font-semibold text-[#1B3C53]">📨 Nouveau courriel et lancement du circuit</p>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#456882] hover:bg-[#edf4f8] disabled:opacity-50"
              >
                <RiCloseLine className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <SectionCard icon={<RiBookmarkLine className="h-4 w-4" />} title="Informations générales">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Titre du courriel *</label>
                    <input
                      value={mailTitle}
                      onChange={(e) => setMailTitle(e.target.value)}
                      placeholder="Objet du courriel"
                      className="w-full rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2.5 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Référence / Numéro</label>
                    <input
                      value={mailReference}
                      onChange={(e) => setMailReference(e.target.value)}
                      placeholder="REF-COURR-2026-001"
                      className="w-full rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2.5 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Badge *</label>
                      <select
                        value={mailBadgeId}
                        onChange={(e) => setMailBadgeId(e.target.value)}
                        className="arch-select w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                      >
                        <option value="">-- Choisir un badge --</option>
                        {badges.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Confidentialité *</label>
                      <select
                        value={mailConfidentialityId}
                        onChange={(e) => setMailConfidentialityId(e.target.value)}
                        className="arch-select w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                      >
                        <option value="">-- Choisir un niveau --</option>
                        {confidentialities.map((c) => (
                          <option key={c.id} value={c.id}>{c.level}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={<RiAlignLeft className="h-4 w-4" />} title="Description additionnelle" badge="Optionnel">
                <textarea
                  value={mailDescription}
                  onChange={(e) => setMailDescription(e.target.value)}
                  rows={3}
                  placeholder="Résumé, contexte, objet du courriel..."
                  className="arch-select w-full resize-none rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                />
              </SectionCard>

              <div className="overflow-hidden rounded-2xl border border-[#dde8f0] bg-white shadow-sm">
                <div className="flex items-center gap-2.5 border-b border-[#dde8f0] bg-[#f4f7fa] px-5 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dbeaf3] text-[#234C6A]">
                    <RiFileTextLine className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-[#1B3C53]">Contenu du courriel</span>
                  <span className="ml-auto rounded-full bg-[#234C6A] px-2 py-0.5 text-[10px] font-medium text-white">
                    Choisir le mode
                  </span>
                </div>

                <div className="space-y-5 p-5">
                  <div className="flex gap-3">
                    <ModeOption
                      active={contentMode === 'upload'}
                      onClick={() => setContentMode('upload')}
                      icon={<RiUploadCloud2Line className="h-6 w-6" />}
                      title="Uploader un fichier"
                      description="Importez un PDF, Word, Excel ou image existant"
                    />
                    <ModeOption
                      active={contentMode === 'write'}
                      onClick={() => setContentMode('write')}
                      icon={<RiPencilLine className="h-6 w-6" />}
                      title="Rédiger le contenu"
                      description="Saisissez le texte du courriel directement"
                    />
                  </div>

                  {contentMode === 'upload' ? (
                    <FileUpload
                      onChange={(selected) => setMailFile(selected)}
                      value={mailFile}
                      label="Cliquer ou glisser le fichier principal"
                    />
                  ) : (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Contenu *</label>
                      <RichTextEditor
                        value={mailContent}
                        onChange={setMailContent}
                      />
                    </div>
                  )}
                </div>
              </div>

               <SectionCard
                 icon={<RiAttachment2 className="h-4 w-4" />}
                 title="Fichiers annexes"
                 badge={mailAnnexes.length > 0 ? `${mailAnnexes.length} fichier(s)` : 'Optionnel'}
               >
                 <MultiFileUpload value={mailAnnexes} onChange={setMailAnnexes} />
               </SectionCard>

               <SectionCard
                 icon={<RiTimeLine className="h-4 w-4" />}
                 title="Hiérarchie de traitement"
                 badge={`${mailSteps.length} étape(s)`}
               >
                 <div className="space-y-4">
                   {mailSteps.map((step) => (
                     <div key={step.id} className="rounded-xl border border-[#c4d4df] bg-[#f4f7fa] p-4">
                       <div className="mb-3 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#234C6A] text-xs font-bold text-white">
                             {step.order}
                           </span>
                           <label className="text-sm font-medium text-[#1B3C53]">Rôle :</label>
                           <select
                             value={step.role}
                             onChange={(e) =>
                               setMailSteps((prev) =>
                                 prev.map((s) =>
                                   s.id === step.id
                                     ? { ...s, role: e.target.value as ParticipantRole }
                                     : s
                                 )
                               )
                             }
                             className="rounded-lg border border-[#c4d4df] bg-white px-2 py-1 text-xs text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                           >
                             <option value={ParticipantRole.RECEIVER}>Destinataire</option>
                             <option value={ParticipantRole.REVIEWER}>Réviseur</option>
                             <option value={ParticipantRole.APPROVER}>Approbateur</option>
                             <option value={ParticipantRole.CC}>Copie (CC)</option>
                             <option value={ParticipantRole.OBSERVER}>Observateur</option>
                           </select>
                         </div>
                         {mailSteps.length > 1 && (
                           <button
                             type="button"
                             onClick={() => removeStep(step.id)}
                             className="flex h-6 w-6 items-center justify-center rounded text-[#BD114A] hover:bg-red-100"
                           >
                             <RiDeleteBinLine className="h-4 w-4" />
                           </button>
                         )}
                       </div>

                       {/* Participants in this step */}
                       <div className="mb-3 flex flex-wrap gap-1">
                         {step.userIds.map((userId) => {
                           const user = allUsers.find((u) => u.id === userId);
                           return user ? (
                             <span
                               key={userId}
                               className="inline-flex items-center gap-1 rounded-full bg-[#dbeaf3] px-2.5 py-1 text-xs text-[#234C6A]"
                             >
                               {user.name}
                               <button
                                 type="button"
                                 onClick={() => removeStepUser(step.id, userId)}
                                 className="hover:text-[#BD114A]"
                               >
                                 ✕
                               </button>
                             </span>
                           ) : null;
                         })}
                       </div>

                       {/* Add user to this step */}
                       <div className="flex gap-2 border-t border-[#dde8f0] pt-3">
                         <select
                           defaultValue=""
                           onChange={(e) => {
                             if (e.target.value) {
                               addStepUser(step.id, e.target.value);
                               e.target.value = '';
                             }
                           }}
                           className="flex-1 rounded-lg border border-[#c4d4df] bg-white px-2.5 py-1.5 text-xs text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                         >
                           <option value="">Ajouter un utilisateur...</option>
                           {allUsers
                             .filter((u) => !step.userIds.includes(u.id))
                             .map((u) => (
                               <option key={u.id} value={u.id}>
                                 {u.name} ({u.role})
                               </option>
                             ))}
                         </select>
                       </div>
                     </div>
                   ))}

                   <button
                     type="button"
                     onClick={addStep}
                     className="w-full rounded-lg border border-dashed border-[#c4d4df] bg-[#edf4f8] py-2 text-sm font-medium text-[#456882] transition hover:border-[#234C6A] hover:bg-[#dbeaf3] hover:text-[#234C6A]"
                   >
                     + Ajouter une étape
                   </button>
                 </div>
               </SectionCard>

               <SectionCard
                 icon={<RiTimeLine className="h-4 w-4" />}
                 title="Paramètres du circuit"
                 badge="Optionnel"
               >
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Échéance du circuit</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={mailDueDate}
                      onChange={(e) => setMailDueDate(e.target.value)}
                      className="w-full rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2.5 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Note d'initiation</label>
                    <input
                      value={mailRoutingNote}
                      onChange={(e) => setMailRoutingNote(e.target.value)}
                      placeholder="Instruction initiale"
                      className="w-full rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2.5 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                    />
                  </div>
                </div>
              </SectionCard>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => void handleCreateAndInit()}
                  disabled={createLoading}
                  className="inline-flex items-center justify-center rounded-xl bg-[#234C6A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1B3C53] disabled:opacity-60"
                >
                  {createLoading ? 'Création en cours...' : 'Créer et initier le circuit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  disabled={createLoading}
                  className="inline-flex items-center justify-center rounded-xl border border-[#c4d4df] bg-[#edf4f8] px-4 py-2 text-sm font-medium text-[#456882] transition hover:bg-[#dbeaf3] disabled:opacity-60"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
