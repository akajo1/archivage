import React from 'react';
import { MailRoutingStatus } from '../types/mail-routing.types';

interface MailStatusBadgeProps {
  status: MailRoutingStatus;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge pour afficher le statut d'un routing avec couleur appropriée
 */
export const MailStatusBadge: React.FC<MailStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusColor = (status: MailRoutingStatus) => {
    switch (status) {
      case MailRoutingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case MailRoutingStatus.IN_REVIEW:
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case MailRoutingStatus.FORWARDED:
        return 'bg-purple-100 text-purple-800 border border-purple-300';
      case MailRoutingStatus.VERIFIED:
        return 'bg-green-100 text-green-800 border border-green-300';
      case MailRoutingStatus.REJECTED:
        return 'bg-red-100 text-red-800 border border-red-300';
      case MailRoutingStatus.RETURNED:
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      case MailRoutingStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getSizeClass = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const getStatusLabel = (status: MailRoutingStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getSizeClass(size)} ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};

