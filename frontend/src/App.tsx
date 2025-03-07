import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Snackbar } from '@mui/material';
import HostTable from './components/HostTable';
import HostForm from './components/HostForm';
import { useState, useEffect, useRef } from 'react';
import { Host } from './types';

function App() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://backend:8000';

  // Исправленный URL для WebSocket
  const wsUrl = `${apiUrl.replace(/^http/, 'ws')}/api/ws/monitor`;

  useEffect(() => {
    // Настройка WebSocket
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const data: Host[] = JSON.parse(event.data);
      setHosts(data);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setErrorMessage('Ошибка соединения с сервером');
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(() => {
        ws.current = new WebSocket(wsUrl); // Повторное подключение
      }, 5000);
    };

    // Начальный fetch при разрыве WS
    if (!ws.current) {
      fetch(apiUrl + '/api/hosts')
        .then(response => response.json())
        .then(data => setHosts(data))
        .catch(() => setErrorMessage('Ошибка загрузки данных'));
    }

    return () => {
      ws.current?.close();
    };
  }, [apiUrl, wsUrl]);

  // Обработчик добавления хоста
  const handleAddHost = async (newHost: Host) => {
    try {
      const response = await fetch(`${apiUrl}/api/hosts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHost)
      });

      if (response.ok) {
        const createdHost = await response.json();
        setHosts(prev => [...prev, createdHost]);
      }
    } catch (error) {
      setErrorMessage('Ошибка добавления хоста');
    }
  };

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Network Monitor</Typography>
        </Toolbar>
      </AppBar>
      <Container>
        {errorMessage && (
          <Snackbar
            open={!!errorMessage}
            message={errorMessage}
            autoHideDuration={6000}
            onClose={() => setErrorMessage(null)}
          />
        )}
        <HostForm onAddHost={handleAddHost} />
        <HostTable
          hosts={hosts}
          onRefresh={() => ws.current?.send('refresh')}
        />
      </Container>
    </Router>
  );
}

export default App;