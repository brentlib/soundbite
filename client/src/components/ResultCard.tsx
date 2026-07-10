import { Box, Card, CardContent, Chip, Link, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { SearchResult } from '../types';
import { formatDate, watchUrl } from '../lib/youtube';
import VideoThumbnail from './VideoThumbnail';

interface ResultCardProps {
  result: SearchResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const p = result.properties;
  const speakers = Array.isArray(p.speakers) ? p.speakers : [];

  return (
    <Card elevation={0}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ width: { xs: '100%', sm: 300 }, flexShrink: 0, p: 1.5 }}>
          <VideoThumbnail videoId={p.video_id} start={p.start_duration} title={p.video_title} />
        </Box>

        <CardContent sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            {result.reranked && result.rank != null && (
              <Chip
                label={`#${result.rank}`}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {formatDate(p.published_at)}
            </Typography>
          </Stack>

          <Typography variant="h6" sx={{ lineHeight: 1.25, mb: 0.75 }}>
            {p.video_title}
          </Typography>

          {speakers.length > 0 && (
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
              {speakers.map((s) => (
                <Chip key={s} label={s} size="small" variant="outlined" />
              ))}
            </Stack>
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {p.chunk_text}
          </Typography>

          <Link
            href={watchUrl(p.video_id, p.start_duration)}
            target="_blank"
            rel="noopener"
            underline="hover"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1.25, fontSize: '0.85rem' }}
          >
            Watch on YouTube <OpenInNewIcon sx={{ fontSize: 15 }} />
          </Link>
        </CardContent>
      </Box>
    </Card>
  );
}
