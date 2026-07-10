import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  Pagination,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import type { SearchResult } from '../types';
import { groupByEpisode, toMomentGroups } from '../lib/grouping';
import EpisodeCard from './EpisodeCard';

interface ResultsListProps {
  results: SearchResult[];
  loading: boolean;
  hasSearched: boolean;
}

type GroupBy = 'moment' | 'episode';

const PAGE_SIZE = 8;

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
  const [groupBy, setGroupBy] = useState<GroupBy>('moment');
  const groups = useMemo(
    () => (groupBy === 'episode' ? groupByEpisode(results) : toMomentGroups(results)),
    [results, groupBy],
  );

  // Reset to the first page whenever the result set or grouping changes.
  useEffect(() => {
    setPage(1);
  }, [results, groupBy]);

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

  const episodeCount = groupBy === 'episode' ? groups.length : new Set(results.map((r) => r.properties.video_id)).size;
  const pageCount = Math.ceil(groups.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = groups.slice(start, start + PAGE_SIZE);

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        useFlexGap
      >
        <Typography variant="body2" color="text.secondary">
          {episodeCount} episode{episodeCount === 1 ? '' : 's'} · {results.length} moment
          {results.length === 1 ? '' : 's'}
        </Typography>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={groupBy}
          onChange={(_, value: GroupBy | null) => value && setGroupBy(value)}
          aria-label="Group results by"
        >
          <ToggleButton value="moment">By moment</ToggleButton>
          <ToggleButton value="episode">By episode</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {pageItems.map((group) => (
        <EpisodeCard key={group.chunks[0].id} group={group} />
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
