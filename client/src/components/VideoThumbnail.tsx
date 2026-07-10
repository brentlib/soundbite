import { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { embedUrl, thumbnailUrl } from '../lib/youtube';

interface VideoThumbnailProps {
  videoId: string;
  start?: number;
  title: string;
}

// Shows the YouTube thumbnail with a play overlay; on click it swaps to an embedded
// iframe cued to the chunk's start timestamp.
export default function VideoThumbnail({ videoId, start, title }: VideoThumbnailProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#000',
      }}
    >
      {playing ? (
        <iframe
          src={embedUrl(videoId, start)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      ) : (
        <Box
          role="button"
          aria-label={`Play ${title}`}
          onClick={() => setPlaying(true)}
          sx={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
        >
          <Box
            component="img"
            src={thumbnailUrl(videoId)}
            alt={title}
            loading="lazy"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.25)',
              transition: 'background-color 0.2s',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' },
            }}
          >
            <IconButton
              disableRipple
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.50),
                color: '#fff',
                '&:hover': { bgcolor: 'primary.main' },
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 40 }} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}
