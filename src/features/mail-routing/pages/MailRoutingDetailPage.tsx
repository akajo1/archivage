import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  RiArrowLeftLine,
  RiSendPlane2Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiArrowGoBackLine,
  RiArchiveDrawerLine,
  RiChat3Line,
  RiUserLine,
  RiTimeLine,
  RiHistoryLine,
  RiFileTextLine,
  RiCloseLine,
  RiAddLine,
  RiDownloadLine,
  RiEyeLine,
} from 'react-icons/ri';
import {
  useMailRouting,
  useForwardRouting,
  useVerifyRouting,
  useRejectRouting,
  useCompleteRouting,
  useAddComment,
} from '../hooks/useMailRouting';
import { MailStatusBadge } from '../components/MailStatusBadge';
import { MailParticipantList } from '../components/MailParticipantList';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { Button } from '../../../shared/components/atoms/Button';
import { useAuthStore } from '../../auth/store/authStore';
import { userManagementService } from '../../users/services/userManagementService';
import type { ManagedUser } from '../../users/types/userManagement.types';
import { ParticipantRole, MailRoutingStatus } from '../types/mail-routing.types';
import { mailRoutingClient } from '../services/mailRoutingClient';

/* ─── helpers ─────────────────────────────────────────────── */
const is = (url: string) => ({
  image: /\.(png|jpe?g|gif|webp|svg)$/i.test(url),
  pdf: /\.pdf$/i.test(url),
});

const ACTION_LABELS: Record<string, string> = {
  forward: '📤 Transmission',
  verify: '✅ Validation',
  reject: '❌ Rejet',
  return_to_sender: '↩️ Retour expéditeur',
  mark_complete: '🏁 Traitement terminé',
  archive: '📦 Archivage',
  comment: '💬 Commentaire',
  add_cc: '📋 Ajout en copie',
  assign: '👤 Assignation',
};

/* ─── Modal shell ──────────────────────────────────────────── */
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="w-full max-w-lg rounded-2xl border border-[#dde8f0] bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#dde8f0] px-5 py-4">
        <p className="font-semibold text-[#1B3C53]">{title}</p>
        <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#456882] hover:bg-[#edf4f8]">
          <RiCloseLine className="h-4 w-4" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

/* ─── User Select ──────────────────────────────────────────── */
const UserSelect: React.FC<{
  users: ManagedUser[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  placeholder?: string;
}> = ({ users, value, onChange, label, placeholder }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-[#1B3C53]">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2.5 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
    >
      <option value="">{placeholder ?? 'Sélectionner un utilisateur...'}</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name} ({u.role})
        </option>
      ))}
    </select>
  </div>
);

/* ─── Main page ────────────────────────────────────────────── */
export const MailRoutingDetailPage: React.FC = () => {
  const { routingId } = useParams<{ routingId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { routing, loading, error, refetch } = useMailRouting(routingId);
  const { forward, loading: fwdLoading } = useForwardRouting();
  const { verify, loading: verLoading } = useVerifyRouting();
  const { reject, loading: rejLoading } = useRejectRouting();
  const { complete, loading: compLoading } = useCompleteRouting();
  const { addComment, loading: comLoading } = useAddComment();

  const [allUsers, setAllUsers] = useState<ManagedUser[]>([]);
  const [modal, setModal] = useState<'forward' | 'verify' | 'reject' | 'return' | 'complete' | 'comment' | 'addParticipant' | null>(null);
  const [fwdReceiver, setFwdReceiver] = useState('');
  const [fwdCcIds, setFwdCcIds] = useState<string[]>([]);
  const [fwdNote, setFwdNote] = useState('');
  const [verNote, setVerNote] = useState('');
  const [rejReason, setRejReason] = useState('');
  const [retNote, setRetNote] = useState('');
  const [compNote, setCompNote] = useState('');
  const [compArchive, setCompArchive] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [partUserId, setPartUserId] = useState('');
  const [partRole, setPartRole] = useState<'cc' | 'observer' | 'reviewer'>('cc');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [addPartLoading, setAddPartLoading] = useState(false);

  useEffect(() => {
    userManagementService.getAll().then(setAllUsers).catch(() => {});
  }, []);

  const closeModal = () => setModal(null);

  if (!routingId) return <p className="p-8 text-red-600">ID du circuit manquant</p>;
  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (error || !routing) return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-800">{error ?? 'Circuit introuvable'}</p>
        <Button className="mt-4" variant="secondary" size="sm" onClick={() => navigate('/mail-routing/inbox')}>
          ← Retour
        </Button>
      </div>
    </div>
  );

  const { document: doc, participants, actions, comments } = routing;
  const myRole = participants?.find((p) => p.userId === currentUser?.id)?.role;
  const isInitiator = routing.initiatedBy?.id === currentUser?.id;
  const isAssignee = routing.currentAssignee?.id === currentUser?.id;
  const isReadOnly = myRole === ParticipantRole.CC || myRole === ParticipantRole.OBSERVER;
  const canAct = (isAssignee || isInitiator) && routing.status !== MailRoutingStatus.COMPLETED;
  const canComment = !isReadOnly && routing.status !== MailRoutingStatus.COMPLETED;
  const isCompleted = routing.status === MailRoutingStatus.COMPLETED;

  /* ─── handlers ─── */
  const doForward = async () => {
    if (!fwdReceiver) return;
    const res = await forward(routing.id, fwdReceiver, fwdCcIds, fwdNote);
    if (res) { closeModal(); refetch(); void Swal.fire({ title: 'Transmis !', icon: 'success', timer: 1500, showConfirmButton: false }); }
  };

  const doVerify = async () => {
    const res = await verify(routing.id, verNote);
    if (res) { closeModal(); refetch(); void Swal.fire({ title: 'Validé !', icon: 'success', timer: 1500, showConfirmButton: false }); }
  };

  const doReject = async () => {
    if (!rejReason.trim()) return;
    const res = await reject(routing.id, rejReason);
    if (res) { closeModal(); refetch(); void Swal.fire({ title: 'Rejeté', icon: 'warning', timer: 1500, showConfirmButton: false }); }
  };

  const doReturn = async () => {
    const res = await mailRoutingClient.returnRouting(routing.id, { note: retNote });
    if (res) { closeModal(); refetch(); void Swal.fire({ title: 'Retourné à l\'expéditeur', icon: 'info', timer: 1500, showConfirmButton: false }); }
  };

  const doComplete = async () => {
    const res = await complete(routing.id, compNote, compArchive);
    if (res) { closeModal(); refetch(); void Swal.fire({ title: compArchive ? 'Traitement terminé & archivé !' : 'Traitement terminé !', icon: 'success', timer: 2000, showConfirmButton: false }); }
  };

  const doComment = async () => {
    if (!commentBody.trim()) return;
    const res = await addComment(routing.id, commentBody);
    if (res) { closeModal(); setCommentBody(''); refetch(); }
  };

  const doAddParticipant = async () => {
    if (!partUserId) return;
    setAddPartLoading(true);
    try {
      await mailRoutingClient.addParticipant(routing.id, { userId: partUserId, role: partRole });
      closeModal(); setPartUserId(''); refetch();
      void Swal.fire({ title: 'Participant ajouté', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch { /* noop */ }
    finally { setAddPartLoading(false); }
  };

  const toggleCc = (id: string) =>
    setFwdCcIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  /* ─── timeline sorted ─── */
  const timeline = [...actions, ...comments]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/mail-routing/inbox')}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#c4d4df] bg-[#edf4f8] px-4 py-2 text-sm font-medium text-[#456882] transition hover:bg-[#dbeaf3]"
      >
        <RiArrowLeftLine className="h-4 w-4" /> Retour au circuit
      </button>

      {/* Header card */}
      <div className="overflow-hidden rounded-3xl arch-card">
        <div className="arch-hero px-8 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{doc?.title ?? '—'}</h1>
              {doc?.registrationNumber && (
                <p className="mt-1 font-mono text-sm text-[#a8c8de]">N° {doc.registrationNumber}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <MailStatusBadge status={routing.status} />
                {myRole && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                    <RiUserLine className="h-3.5 w-3.5" />
                    {myRole === ParticipantRole.CC ? 'Copie (CC)' :
                     myRole === ParticipantRole.OBSERVER ? 'Observateur' :
                     myRole === ParticipantRole.RECEIVER ? 'Destinataire' :
                     myRole === ParticipantRole.REVIEWER ? 'Réviseur' :
                     myRole === ParticipantRole.APPROVER ? 'Approbateur' : myRole}
                  </span>
                )}
                {isInitiator && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                    ✦ Initiateur
                  </span>
                )}
                {isReadOnly && (
                  <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-medium text-amber-200">
                    👁 Lecture seule
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!isCompleted && (
              <div className="flex flex-wrap gap-2">
                {canAct && (
                  <>
                    <Button size="sm" onClick={() => setModal('forward')}>
                      <RiSendPlane2Line className="h-3.5 w-3.5" /> Transmettre
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setModal('verify')}>
                      <RiCheckboxCircleLine className="h-3.5 w-3.5" /> Valider
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setModal('return')}>
                      <RiArrowGoBackLine className="h-3.5 w-3.5" /> Retourner
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setModal('reject')}>
                      <RiCloseCircleLine className="h-3.5 w-3.5" /> Rejeter
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setModal('complete')}>
                      <RiArchiveDrawerLine className="h-3.5 w-3.5" /> Terminer
                    </Button>
                  </>
                )}
                {canComment && (
                  <Button size="sm" variant="ghost" onClick={() => setModal('comment')}>
                    <RiChat3Line className="h-3.5 w-3.5" /> Commenter
                  </Button>
                )}
                {(canAct || isInitiator) && (
                  <Button size="sm" variant="ghost" onClick={() => setModal('addParticipant')}>
                    <RiAddLine className="h-3.5 w-3.5" /> Participant
                  </Button>
                )}
              </div>
            )}
            {isCompleted && canComment && (
              <Button size="sm" variant="ghost" onClick={() => setModal('comment')}>
                <RiChat3Line className="h-3.5 w-3.5" /> Commenter
              </Button>
            )}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-b border-[#dde8f0] bg-[#f4f7fa] px-8 py-5 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#456882]">Initié par</p>
            <p className="mt-0.5 text-sm font-medium text-[#1B3C53]">{routing.initiatedBy?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#456882]">Assigné à</p>
            <p className="mt-0.5 text-sm font-medium text-[#1B3C53]">{routing.currentAssignee?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#456882]">Créé le</p>
            <p className="mt-0.5 text-sm font-medium text-[#1B3C53]">
              {new Date(routing.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          {routing.dueDate && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#456882]">Échéance</p>
              <p className={`mt-0.5 text-sm font-medium ${new Date(routing.dueDate) < new Date() ? 'text-red-600' : 'text-[#1B3C53]'}`}>
                <RiTimeLine className="inline h-3.5 w-3.5 mr-1" />
                {new Date(routing.dueDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>

        {/* Document info footer */}
        {(doc?.description || routing.notes) && (
          <div className="space-y-3 px-8 py-5">
            {doc?.description && (
              <p className="rounded-xl bg-[#edf4f8] px-4 py-3 text-sm text-[#1B3C53]">
                <span className="font-semibold text-[#456882]">Description : </span>{doc.description}
              </p>
            )}
            {routing.notes && (
              <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[#1B3C53]">
                <span className="font-semibold text-blue-700">Notes : </span>{routing.notes}
              </p>
            )}
          </div>
        )}

        {/* Document files */}
        {doc?.fileUrl && (
          <div className="border-t border-[#dde8f0] px-8 py-5">
            <div className="flex items-center gap-3 rounded-2xl border border-[#c4d4df] bg-[#edf4f8] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dbeaf3] text-[#234C6A]">
                <RiFileTextLine className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1B3C53]">Fichier principal</p>
                <p className="truncate text-xs text-[#456882]">{doc.fileUrl.split('/').pop()}</p>
              </div>
              <div className="flex items-center gap-2">
                {(is(doc.fileUrl).image || is(doc.fileUrl).pdf) && (
                  <button type="button" onClick={() => setPreviewUrl(doc.fileUrl!)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#dbeaf3] px-3 py-1.5 text-xs font-medium text-[#234C6A] hover:bg-[#c8dcea]">
                    <RiEyeLine className="h-3.5 w-3.5" /> Aperçu
                  </button>
                )}
                <a href={doc.fileUrl} download className="inline-flex items-center gap-1 rounded-lg bg-[#234C6A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1B3C53]">
                  <RiDownloadLine className="h-3.5 w-3.5" /> Télécharger
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Document meta: badge + confidentiality */}
        <div className="flex flex-wrap items-center gap-4 border-t border-[#dde8f0] px-8 py-4 text-xs text-[#456882]">
          {doc?.id && (
            <Link to={`/documents/${doc.id}`} className="inline-flex items-center gap-1 rounded-lg bg-[#edf4f8] px-3 py-1.5 text-xs font-medium text-[#234C6A] hover:bg-[#dbeaf3]">
              <RiFileTextLine className="h-3.5 w-3.5" /> Voir le document complet
            </Link>
          )}
        </div>
      </div>

      {/* Body: 2 columns — participants + timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Participants */}
        <div className="space-y-4">
          <div className="arch-card rounded-2xl p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1B3C53]">
              <RiUserLine className="h-4 w-4 text-[#7aaac4]" /> Participants
            </h2>
            <MailParticipantList participants={participants} />
          </div>
        </div>

        {/* Timeline + Comments */}
        <div className="col-span-2 space-y-5">

          {/* Timeline */}
          <div className="arch-card rounded-2xl p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1B3C53]">
              <RiHistoryLine className="h-4 w-4 text-[#7aaac4]" /> Historique de traitement
            </h2>
            {timeline.length === 0 ? (
              <p className="text-sm text-[#7aaac4]">Aucune activité pour le moment.</p>
            ) : (
              <div className="relative space-y-4 pl-4">
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#dde8f0]" />
                {timeline.map((item, idx) => {
                  const isAction = 'actionType' in item;
                  return (
                    <div key={idx} className="relative flex gap-3">
                      <span className="absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#234C6A] bg-white" />
                      <div className="flex-1 overflow-hidden rounded-xl border border-[#dde8f0] bg-[#f4f7fa] px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <p className="text-sm font-medium text-[#1B3C53]">
                            {isAction
                              ? <>{ACTION_LABELS[item.actionType] ?? item.actionType} · <span className="text-[#456882]">{item.actor?.name ?? '—'}</span></>
                              : <>💬 Commentaire · <span className="text-[#456882]">{item.author?.name ?? '—'}</span></>
                            }
                          </p>
                          <p className="text-[11px] text-[#7aaac4]">
                            {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {isAction ? (
                          item.note && <p className="mt-1 text-sm text-[#456882]">{item.note}</p>
                        ) : (
                          <p className="mt-1 text-sm text-[#1B3C53]">{item.body}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comment quick-add (if allowed) */}
          {canComment && (
            <div className="arch-card rounded-2xl p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1B3C53]">
                <RiChat3Line className="h-4 w-4 text-[#7aaac4]" /> Ajouter un commentaire
              </h2>
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={3}
                placeholder="Saisir votre commentaire..."
                className="w-full resize-none rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-4 py-2.5 text-sm text-[#1B3C53] placeholder:text-[#7aaac4] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => void doComment()}
                  isLoading={comLoading}
                  disabled={!commentBody.trim()}
                >
                  <RiChat3Line className="h-3.5 w-3.5" /> Poster
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modals ─── */}

      {modal === 'forward' && (
        <Modal title="📤 Transmettre le document" onClose={closeModal}>
          <div className="space-y-4">
            <UserSelect users={allUsers.filter((u) => u.id !== currentUser?.id)} value={fwdReceiver} onChange={setFwdReceiver} label="Destinataire *" placeholder="Choisir le destinataire..." />
            <div>
              <p className="mb-2 text-sm font-medium text-[#1B3C53]">Copies (CC) — optionnel</p>
              <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-[#c4d4df] bg-[#f4f7fa] p-3">
                {allUsers.filter((u) => u.id !== currentUser?.id && u.id !== fwdReceiver).map((u) => (
                  <label key={u.id} className="flex cursor-pointer items-center gap-2 text-sm text-[#1B3C53]">
                    <input type="checkbox" checked={fwdCcIds.includes(u.id)} onChange={() => toggleCc(u.id)} className="rounded" />
                    {u.name} <span className="text-xs text-[#7aaac4]">({u.role})</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Note (optionnel)</label>
              <textarea value={fwdNote} onChange={(e) => setFwdNote(e.target.value)} rows={2}
                className="w-full resize-none rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void doForward()} isLoading={fwdLoading} disabled={!fwdReceiver}>
                <RiSendPlane2Line className="h-4 w-4" /> Transmettre
              </Button>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'verify' && (
        <Modal title="✅ Valider le document" onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-[#456882]">Confirmez-vous la validation de ce document ?</p>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Note (optionnel)</label>
              <textarea value={verNote} onChange={(e) => setVerNote(e.target.value)} rows={2}
                className="w-full resize-none rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void doVerify()} isLoading={verLoading}>
                <RiCheckboxCircleLine className="h-4 w-4" /> Valider
              </Button>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'reject' && (
        <Modal title="❌ Rejeter le document" onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Motif du rejet *</label>
              <textarea value={rejReason} onChange={(e) => setRejReason(e.target.value)} rows={3}
                placeholder="Expliquer le motif..."
                className="w-full resize-none rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="danger" onClick={() => void doReject()} isLoading={rejLoading} disabled={!rejReason.trim()}>
                <RiCloseCircleLine className="h-4 w-4" /> Rejeter
              </Button>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'return' && (
        <Modal title="↩️ Retourner à l'expéditeur" onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-[#456882]">Le document sera retourné à l'expéditeur pour corrections.</p>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Note</label>
              <textarea value={retNote} onChange={(e) => setRetNote(e.target.value)} rows={2}
                className="w-full resize-none rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => void doReturn()}>
                <RiArrowGoBackLine className="h-4 w-4" /> Retourner
              </Button>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'complete' && (
        <Modal title="🏁 Terminer le traitement" onClose={closeModal}>
          <div className="space-y-4">
            <p className="text-sm text-[#456882]">Marquer ce circuit de traitement comme terminé.</p>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#c4d4df] bg-[#f4f7fa] p-4">
              <input type="checkbox" checked={compArchive} onChange={(e) => setCompArchive(e.target.checked)} className="h-4 w-4 rounded" />
              <div>
                <p className="text-sm font-medium text-[#1B3C53]">Archiver le document</p>
                <p className="text-xs text-[#456882]">Le document sera protégé en lecture seule dans les archives.</p>
              </div>
            </label>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Note de clôture (optionnel)</label>
              <textarea value={compNote} onChange={(e) => setCompNote(e.target.value)} rows={2}
                className="w-full resize-none rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void doComplete()} isLoading={compLoading}>
                <RiArchiveDrawerLine className="h-4 w-4" /> {compArchive ? 'Terminer & archiver' : 'Terminer'}
              </Button>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'comment' && (
        <Modal title="💬 Ajouter un commentaire" onClose={closeModal}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Commentaire *</label>
              <textarea value={commentBody} onChange={(e) => setCommentBody(e.target.value)} rows={4}
                placeholder="Saisir votre commentaire..."
                className="w-full resize-none rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void doComment()} isLoading={comLoading} disabled={!commentBody.trim()}>
                <RiChat3Line className="h-4 w-4" /> Poster
              </Button>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'addParticipant' && (
        <Modal title="👤 Ajouter un participant" onClose={closeModal}>
          <div className="space-y-4">
            <UserSelect users={allUsers.filter((u) => !participants.some((p) => p.userId === u.id))} value={partUserId} onChange={setPartUserId} label="Utilisateur *" />
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Rôle *</label>
              <select value={partRole} onChange={(e) => setPartRole(e.target.value as 'cc' | 'observer' | 'reviewer')}
                className="w-full rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2.5 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30">
                <option value="cc">Copie (CC) — reçoit le document, lecture seule</option>
                <option value="observer">Observateur — accès lecture seule, sans notification</option>
                <option value="reviewer">Réviseur — peut commenter et modifier</option>
              </select>
            </div>
            <div className="rounded-xl bg-[#edf4f8] p-3 text-xs text-[#456882]">
              <strong>CC/Observateur :</strong> accès lecture seule.<br />
              <strong>Réviseur :</strong> peut commenter et contribuer au traitement.
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void doAddParticipant()} isLoading={addPartLoading} disabled={!partUserId}>
                <RiAddLine className="h-4 w-4" /> Ajouter
              </Button>
              <Button variant="secondary" onClick={closeModal}>Annuler</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* File preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-[#dde8f0] bg-[#f4f7fa] px-5 py-3">
              <p className="text-sm font-semibold text-[#1B3C53]">Aperçu du fichier</p>
              <button type="button" onClick={() => setPreviewUrl(null)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4f8] text-[#456882] hover:bg-[#dbeaf3]">
                <RiCloseLine className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[#1B3C53]/10">
              {is(previewUrl).image ? (
                <img src={previewUrl} alt="aperçu" className="mx-auto max-h-[75vh] object-contain p-4" />
              ) : is(previewUrl).pdf ? (
                <iframe src={previewUrl} title="aperçu" className="h-[75vh] w-full border-0" />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

