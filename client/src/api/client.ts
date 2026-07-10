import type { SearchOptions, SearchResult } from '../types';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Server errors come back as { error: string }.
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // non-JSON error body; keep the generic message
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export function search(query: string, opts: SearchOptions = {}): Promise<SearchResult[]> {
  return postJson<SearchResult[]>('/api/ai/search', { query, ...opts });
}

export async function answerRag(query: string, searchResults: SearchResult[]): Promise<string> {
  const data = await postJson<{ answer: string }>('/api/ai/rag-answer', { query, searchResults });
  return data.answer;
}
