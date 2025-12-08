
import { UserProgress, TopicStatus } from './types';

// 1-7-30 Rule
export const calculateNextRevision = (level: number, lastRevisedDate: string): string => {
  const date = new Date(lastRevisedDate);
  let daysToAdd = 1;
  
  if (level === 0) daysToAdd = 1;      // First review: 1 day later
  else if (level === 1) daysToAdd = 7; // Second review: 7 days later
  else if (level === 2) daysToAdd = 30; // Third review: 30 days later
  else daysToAdd = 60;                 // Maintenance: 60 days

  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString();
};

export const getStatusColor = (status: TopicStatus) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'BACKLOG': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const formatDate = (isoString: string | null) => {
  if (!isoString) return 'Never';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short'
  });
};
