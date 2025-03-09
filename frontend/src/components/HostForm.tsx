import { useState } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import { Host } from '../types';

interface HostFormProps {
  onAddHost: (newHost: Host) => void;
}

const HostForm: React.FC<HostFormProps> = ({ onAddHost }) => {
  const [ip, setIp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валидация IP
    const isValid = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
    if (!isValid) {
      setError('Некорректный IP-адрес');
      return;
    }

    if (!ip.trim()) {
      setError('IP-адрес не может быть пустым');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/hosts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });

      if (response.ok) {
        const newHost = await response.json();  // Теперь получаем полный объект
        onAddHost(newHost);
        setIp('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Ошибка добавления хоста');
      }
    } catch (err) {
      setError('Сетевая ошибка');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="IP-адрес"
        variant="outlined"
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        required
        fullWidth
        sx={{ mr: 2 }}
        helperText="Пример: 192.168.1.1"
      />
      <Button type="submit" variant="contained" color="primary">
        Добавить хост
      </Button>
    </Box>
  );
};

export default HostForm;