export function thumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Embed cued to the chunk's start second, autoplaying (used once the user clicks the thumbnail).
export function embedUrl(videoId: string, start?: number): string {
  const t = typeof start === 'number' ? `&start=${Math.floor(start)}` : '';
  return `https://www.youtube.com/embed/${videoId}?autoplay=1${t}`;
}

export function watchUrl(videoId: string, start?: number): string {
  const t = typeof start === 'number' ? `&t=${Math.floor(start)}s` : '';
  return `https://www.youtube.com/watch?v=${videoId}${t}`;
}

// Seconds -> "m:ss" (or "h:mm:ss" for episodes past the hour mark).
export function formatTimestamp(seconds?: number): string {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return '';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`;
  return `${m}:${ss}`;
}

export function formatDate(publishedAt?: string): string {
  if (!publishedAt) return '';
  const d = new Date(publishedAt);
  if (Number.isNaN(d.getTime())) return publishedAt.slice(0, 10);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
