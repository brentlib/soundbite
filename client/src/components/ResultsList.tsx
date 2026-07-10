import { useEffect, useState } from 'react';
import { Box, Card, Pagination, Skeleton, Stack, Typography } from '@mui/material';
import type { SearchResult } from '../types';
import ResultCard from './ResultCard';

interface ResultsListProps {
  results: SearchResult[];
  loading: boolean;
  hasSearched: boolean;
}

const PAGE_SIZE = 10;

function CardSkeleton() {
  return (
    <Card elevation={0}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, p: 1.5, gap: 1.5 }}>
        <Skeleton variant="rounded" sx={{ width: { xs: '100%', sm: 300 }, aspectRatio: '16 / 9' }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="30%" />
          <Skeleton width="80%" height={32} />
          <Skeleton width="100%" />
          <Skeleton width="90%" />
        </Box>
      </Box>
    </Card>
  );
}

export default function ResultsList({ results, loading, hasSearched }: ResultsListProps) {
  const [page, setPage] = useState(1);

  // Reset to the first page whenever a fresh result set arrives.
  useEffect(() => {
    setPage(1);
  }, [results]);

  if (loading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </Stack>
    );
  }

  if (!hasSearched) {
    return (
      <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 8 }}>
        <Typography variant="h6" gutterBottom>
          Search the All-In Podcast
        </Typography>
        <Typography variant="body2">
          Ask a question or search a topic to pull relevant moments from the episodes.
        </Typography>
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 8 }}>
        <Typography variant="body1">No results found. Try a different query.</Typography>
      </Box>
    );
  }

  const pageCount = Math.ceil(results.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = results.slice(start, start + PAGE_SIZE);

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {results.length} result{results.length === 1 ? '' : 's'}
      </Typography>

      {pageItems.map((result) => (
        <ResultCard key={result.id} result={result} />
      ))}

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => {
              setPage(value);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            color="primary"
          />
        </Box>
      )}
    </Stack>
  );
}
