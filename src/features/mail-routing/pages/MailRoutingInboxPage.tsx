import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiMailLine,
  RiFilterLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiArrowRightLine,
  RiUserLine,
  RiCalendarLine,
  RiChat3Line,
} from 'react-icons/ri';
import { useMailRoutingInbox } from '../hooks/useMailRouting';
import { MailStatusBadge } from '../components/MailStatusBadge';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import type { MailRouting } from '../types/mail-routing.types';

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

  const filtered = filterStatus ? routings.filter((r) => r.status === filterStatus) : routings;

  const pending = routings.filter((r) => ['pending', 'forwarded', 'in_review', 'returned'].includes(r.status)).length;
  const completed = routings.filter((r) => r.status === 'completed').length;
  const overdue = routings.filter((r) => r.dueDate && new Date(r.dueDate) < new Date() && r.status !== 'completed').length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="arch-hero relative overflow-hidden rounded-3xl px-8 py-8 shadow-sm">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">📮 Circuit de traitement</h1>
        <p className="mt-1 text-[#a8c8de]">Documents en cours de traitement vous concernant</p>

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
    </div>
  );
};
