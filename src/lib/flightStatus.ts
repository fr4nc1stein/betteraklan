type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'yellow'
  | 'success'
  | 'warning'
  | 'error'
  | 'slate'
  | 'outline';

const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  scheduled: 'primary',
  expected: 'primary',
  checkin: 'primary',
  boarding: 'primary',
  gateclosed: 'primary',
  enroute: 'secondary',
  approaching: 'secondary',
  departed: 'success',
  landed: 'success',
  arrived: 'success',
  delayed: 'warning',
  canceled: 'error',
  cancelled: 'error',
  diverted: 'error',
  redirected: 'error',
};

export function getStatusVariant(status: string): BadgeVariant {
  return STATUS_VARIANT_MAP[status.toLowerCase().replace(/\s+/g, '')] ?? 'slate';
}

// AeroDataBox local times look like "2026-08-02 11:20+08:00" — valid ISO
// 8601 except for the space where "T" belongs.
export function parseAeroDataBoxLocal(value: string | null): Date | null {
  if (!value) return null;
  const isoLike = value.replace(' ', 'T');
  const date = new Date(isoLike);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatFlightTime(value: string | null): string {
  const date = parseAeroDataBoxLocal(value);
  if (!date) return '—';
  return date.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila',
  });
}

export function formatRelativeToNow(value: string | null): string {
  const date = parseAeroDataBoxLocal(value);
  if (!date) return '';

  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  const absMin = Math.abs(diffMin);

  if (absMin < 1) return 'now';

  const hours = Math.floor(absMin / 60);
  const minutes = absMin % 60;
  const parts = [hours > 0 ? `${hours}h` : null, minutes > 0 ? `${minutes}m` : null]
    .filter(Boolean)
    .join(' ');

  return diffMin > 0 ? `in ${parts}` : `${parts} ago`;
}

export function formatUpdatedAgo(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const hours = Math.floor(diffMin / 60);
  const minutes = diffMin % 60;
  return minutes > 0 ? `${hours}h ${minutes}m ago` : `${hours}h ago`;
}
