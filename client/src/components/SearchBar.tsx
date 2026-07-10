import { useState } from 'react';
import { InputAdornment, Paper, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <Paper
      component="form"
      onSubmit={submit}
      elevation={0}
      sx={{ p: 0.5, borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <TextField
        fullWidth
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search or ask a question about the All-In Podcast…"
        variant="standard"
        disabled={loading}
        InputProps={{
          disableUnderline: true,
          sx: { fontSize: '1.1rem', px: 1.5, py: 1 },
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="disabled" />
            </InputAdornment>
          ),
        }}
      />
    </Paper>
  );
}
