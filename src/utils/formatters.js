// Formatiraj datum u lokalni format
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Formatiraj cenu
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '-';
  return `${Number(price).toLocaleString('sr-RS')} RSD`;
};

// Boje za statuse
export const statusColors = {
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
};