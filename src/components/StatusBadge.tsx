/*
import type { TripStatus } from '../types';

interface StatusBadgeProps {
  status: TripStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let bgColor = '';
  let textColor = '';
  let text = '';

  switch (status) {
    case 'PENDING':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      text = 'Pendiente';
      break;
    case 'IN_PROGRESS':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      text = 'En progreso';
      break;
    case 'COMPLETED':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      text = 'Completado';
      break;
  }

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
}
*/

import type { TripStatus } from '../types';

interface StatusBadgeProps {
  status: TripStatus;
}

const STYLES: Record<TripStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const LABELS: Record<TripStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}