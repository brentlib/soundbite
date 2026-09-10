import { Alert, Box, Container, Grid, Stack, Typography } from '@mui/material';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import AnswerPanel from './components/AnswerPanel';
import { useSearch } from './hooks/useSearch';

export default function App() {
  const {
    results,
    answer,
    searchLoading,
    answerLoading,
    error,
    hasSearched,
    runSearch,
  } = useSearch();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h5">
          Sound<Box component="span" sx={{ color: 'primary.main' }}>bite</Box>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search episodes from the All-In Podcast.
        </Typography>
      </Stack>

      <SearchBar onSearch={runSearch} loading={searchLoading} />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={7}>
          <ResultsList results={results} loading={searchLoading} hasSearched={hasSearched} />
        </Grid>
        <Grid item xs={12} md={5}>
          <AnswerPanel
            answer={answer}
            loading={answerLoading}
            searchLoading={searchLoading}
            hasSearched={hasSearched}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
