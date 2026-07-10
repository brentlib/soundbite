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

export function formatDate(publishedAt?: string): string {
  if (!publishedAt) return '';
  const d = new Date(publishedAt);
  if (Number.isNaN(d.getTime())) return publishedAt.slice(0, 10);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
