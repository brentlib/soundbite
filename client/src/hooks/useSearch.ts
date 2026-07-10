import { useCallback, useState } from 'react';
import { answerRag, search } from '../api/client';
import type { SearchResult } from '../types';

// Orchestrates the two-step flow: search first (render fast), then auto-generate the
// RAG answer from those same results. The two steps have independent loading flags so
// the results list isn't blocked waiting on the slower answer call.
export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setHasSearched(true);
    setError(null);
    setAnswer('');
    setSearchLoading(true);

    let hits: SearchResult[] = [];
    try {
      hits = await search(trimmed);
      setResults(hits);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchLoading(false);
      return;
    }
    setSearchLoading(false);

    if (hits.length === 0) return;

    // Auto-generate the answer from the results we just got.
    setAnswerLoading(true);
    try {
      const text = await answerRag(trimmed, hits);
      setAnswer(text);
    } catch (err) {
      setAnswer('');
      setError(err instanceof Error ? err.message : 'Answer generation failed');
    } finally {
      setAnswerLoading(false);
    }
  }, []);

  return {
    query,
    results,
    answer,
    searchLoading,
    answerLoading,
    error,
    hasSearched,
    runSearch,
  };
}
