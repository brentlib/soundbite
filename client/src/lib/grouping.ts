import type { EpisodeGroup, SearchResult } from '../types';

// Collapse a flat, relevance-sorted result list into one group per episode.
// The list is already ordered best-first, and Map preserves insertion order, so the
// first chunk seen for an episode is its best and groups come out in relevance order.
export function groupByEpisode(results: SearchResult[]): EpisodeGroup[] {
  const groups = new Map<string, EpisodeGroup>();

  for (const result of results) {
    const videoId = result.properties.video_id;
    const existing = groups.get(videoId);
    if (existing) {
      existing.chunks.push(result);
    } else {
      groups.set(videoId, {
        videoId,
        properties: result.properties,
        chunks: [result],
        bestRank: result.rank,
      });
    }
  }

  return Array.from(groups.values());
}

// Wrap each chunk as its own single-moment group so the chunk-level ("by moment")
// view can render through the same EpisodeCard as the grouped view.
export function toMomentGroups(results: SearchResult[]): EpisodeGroup[] {
  return results.map((result) => ({
    videoId: result.properties.video_id,
    properties: result.properties,
    chunks: [result],
    bestRank: result.rank,
  }));
}
