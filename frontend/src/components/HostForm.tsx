import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { Host } from '../types'; // Проверьте путь до types.ts

interface HostFormProps {
  onAddHost: (newHost: Host) => void;
}

const HostForm: React.FC<HostFormProps> = ({ onAddHost }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      const newHost: Host = {
        id: Date.now().toString(),
        url: url.trim(),
        status: 'Offline',
        responseTime: null,
        lastChecked: null
      };
      onAddHost(newHost);
      setUrl('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <TextField
        label="URL хоста"
        variant="outlined"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        fullWidth
        sx={{ mr: 2 }}
      />
      <Button type="submit" variant="contained" color="primary">
        Добавить хост
      </Button>
    </Box>
  );
};

export default HostForm; // Убедитесь, что компонент экспортируется