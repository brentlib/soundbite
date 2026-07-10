import { useLayoutEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Chip, Divider, Link, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { EpisodeGroup, SearchResult } from '../types';
import { formatDate, formatTimestamp, watchUrl } from '../lib/youtube';
import VideoThumbnail from './VideoThumbnail';

interface EpisodeCardProps {
  group: EpisodeGroup;
}

// One matching moment within an episode: timestamped watch link + snippet that
// clamps to a few lines with an inline "Show more" when the text overflows.
function ChunkRow({ chunk }: { chunk: SearchResult }) {
  const p = chunk.properties;
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const textRef = useRef<HTMLElement>(null);
  const ts = formatTimestamp(p.start_duration);

  // Detect overflow only while collapsed; when expanded, clientHeight === scrollHeight
  // so we'd otherwise wrongly conclude the text fits and hide "Show less".
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!expanded && el) {
      setClamped(el.scrollHeight > el.clientHeight + 1);
    }
  }, [p.chunk_text, expanded]);

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        {chunk.reranked && chunk.rank != null && (
          <Chip label={`#${chunk.rank}`} size="small" color="primary" sx={{ fontWeight: 700, height: 20 }} />
        )}
        <Link
          href={watchUrl(p.video_id, p.start_duration)}
          target="_blank"
          rel="noopener"
          underline="hover"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem', fontWeight: 600 }}
        >
          {ts ? `Watch at ${ts}` : 'Watch on YouTube'} <OpenInNewIcon sx={{ fontSize: 15 }} />
        </Link>
      </Stack>

      <Typography
        ref={textRef}
        variant="body2"
        color="text.secondary"
        sx={
          expanded
            ? undefined
            : {
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
        }
      >
        {p.chunk_text}
      </Typography>

      {(clamped || expanded) && (
        <Link
          component="button"
          type="button"
          onClick={() => setExpanded((e) => !e)}
          underline="hover"
          sx={{ fontSize: '0.8rem', mt: 0.25 }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Link>
      )}
    </Box>
  );
}

export default function EpisodeCard({ group }: EpisodeCardProps) {
  const p = group.properties;
  const speakers = Array.isArray(p.speakers) ? p.speakers : [];
  const best = group.chunks[0];
  const count = group.chunks.length;

  return (
    <Card elevation={0}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ width: { xs: '100%', sm: 300 }, flexShrink: 0, p: 1.5 }}>
          <VideoThumbnail
            videoId={p.video_id}
            start={best.properties.start_duration}
            title={p.video_title}
          />
        </Box>

        <CardContent sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {formatDate(p.published_at)}
          </Typography>

          <Typography variant="h6" sx={{ lineHeight: 1.25, mt: 0.25, mb: 0.75 }}>
            {p.video_title}
          </Typography>

          {speakers.length > 0 && (
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
              {speakers.map((s) => (
                <Chip key={s} label={s} size="small" variant="outlined" />
              ))}
            </Stack>
          )}

          {count > 1 && (
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.75 }}
            >
              {count} matching moments
            </Typography>
          )}

          <Stack spacing={1.5} divider={<Divider flexItem />}>
            {group.chunks.map((chunk) => (
              <ChunkRow key={chunk.id} chunk={chunk} />
            ))}
          </Stack>
        </CardContent>
      </Box>
    </Card>
  );
}
