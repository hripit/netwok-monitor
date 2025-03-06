import { useState } from 'react';
import { TextField, Button } from '@mui/material';

export const HostForm = () => {
  const [ip, setIp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8000/hosts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip }),
    });
    if (response.ok) setIp('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="IP-адрес"
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" color="primary">
        Добавить хост
      </Button>
    </form>
  );
};