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

// Polje <input type="datetime-local"> radi u lokalnom vremenu, bez zone.
// Za prikaz u formi pretvaramo vreme sa servera u lokalno "YYYY-MM-DDTHH:mm"...
export const toLocalInputValue = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ...a serveru šaljemo ISO sa zonom, da 10:00 ostane 10:00 i posle čuvanja.
export const fromLocalInputValue = (value) => (value ? new Date(value).toISOString() : value);

// Formatiraj cenu
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '-';
  return `${Number(price).toLocaleString('sr-RS')} RSD`;
};

// Statusi: vrednosti ostaju na engleskom jer ih tako čuva backend,
// a korisniku se prikazuju na srpskom.
export const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export const statusLabels = {
  Pending: 'Na čekanju',
  Confirmed: 'Potvrđen',
  Completed: 'Završen',
  Cancelled: 'Otkazan',
};

export const statusLabel = (status) => statusLabels[status] || status;
