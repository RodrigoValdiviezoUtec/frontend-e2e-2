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
