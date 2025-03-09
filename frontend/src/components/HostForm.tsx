import { useState } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import { Host } from '../types';

interface HostFormProps {
  onAddHost: (newHost: Host) => Promise<void>;
}

const HostForm = ({ onAddHost }: HostFormProps) => {
  const [ip, setIp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Нормализация IP: убираем пробелы и приводим к нижнему регистру
    const normalizedIP = ip.trim().toLowerCase();
    setIp(normalizedIP); // Обновляем состояние для отображения очищенного IP

    // Валидация формата IP
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(normalizedIP)) {
      setError('Некорректный формат IP-адреса');
      return;
    }

    try {
      // Создаем новый хост (статус по умолчанию 'unknown')
      const newHost: Host = {
        ip: normalizedIP,
        status: 'unknown',
        rtt: null,
        delivered: 0,
        loss: 100,
        last_ping: '00:00:00'
      };

      // Вызываем функцию добавления хоста из родительского компонента
      await onAddHost(newHost);

      // Очищаем форму при успешном добавлении
      setIp('');
      setError(null);

    } catch (error: any) {
      // Обрабатываем ошибки от API
      const errorMessage = error?.response?.data?.detail || 'Ошибка добавления хоста';
      setError(errorMessage);
    }
  };

  return (
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
            label="IP-адрес"
            variant="outlined"
            fullWidth
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            error={!!error}
            helperText={error ? 'Проверьте формат IP' : ''}
            InputProps={{
              style: { fontFamily: 'monospace' }
            }}
        />

        <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={!ip.trim()}
        >
          Добавить хост
        </Button>
      </Box>
  );
};

export default HostForm;