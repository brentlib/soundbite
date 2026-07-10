// Mirrors the YoutubeVideos properties the server returns on each search hit.
export interface ResultProperties {
  video_title: string;
  published_at: string;
  video_id: string;
  chunk_text: string;
  speakers?: string[];
  start_duration?: number;
  end_duration?: number;
  chunk_index?: number;
  channel_name?: string;
  [key: string]: unknown;
}

// One item from POST /api/ai/search. Reranked hits sort first (rank 1..N);
// the search-score tail has reranked=false and rank=null.
export interface SearchResult {
  id: string;
  properties: ResultProperties;
  score?: number;
  reranked: boolean;
  rank: number | null;
}

export interface SearchOptions {
  alpha?: number;
  weaviateLimit?: number;
  rerankerLimit?: number;
}
