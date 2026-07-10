import { Box, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReactMarkdown from 'react-markdown';

interface AnswerPanelProps {
  answer: string;
  loading: boolean;
  searchLoading: boolean;
  hasSearched: boolean;
}

export default function AnswerPanel({ answer, loading, searchLoading, hasSearched }: AnswerPanelProps) {
  return (
    <Card
      elevation={0}
      sx={{
        position: 'sticky',
        top: 24,
        maxHeight: 'calc(100vh - 48px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <AutoAwesomeIcon color="primary" fontSize="small" />
          <Typography variant="h6">Answer</Typography>
        </Stack>

        {!hasSearched && (
          <Typography variant="body2" color="text.secondary">
            A grounded answer generated from the matching episode transcripts will appear here after
            you search.
          </Typography>
        )}

        {hasSearched && searchLoading && (
          <Typography variant="body2" color="text.secondary">
            An answer will appear once the search finishes…
          </Typography>
        )}

        {hasSearched && !searchLoading && loading && (
          <Box>
            <Skeleton width="95%" />
            <Skeleton width="88%" />
            <Skeleton width="92%" />
            <Skeleton width="70%" />
            <Skeleton width="85%" sx={{ mt: 1.5 }} />
            <Skeleton width="60%" />
          </Box>
        )}

        {hasSearched && !searchLoading && !loading && answer && (
          <Box
            sx={{
              color: 'text.primary',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              overflowY: 'auto',
              minHeight: 0,
              pr: 1,
              '& p': { mt: 0, mb: 1.5 },
              '& a': { color: 'secondary.main' },
              '& ul': { pl: 2.5, mb: 1.5 },
            }}
          >
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
              }}
            >
              {answer}
            </ReactMarkdown>
          </Box>
        )}

        {hasSearched && !searchLoading && !loading && !answer && (
          <Typography variant="body2" color="text.secondary">
            No answer available for this query.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
