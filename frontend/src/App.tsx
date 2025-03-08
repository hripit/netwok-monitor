import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Snackbar } from '@mui/material';
import HostTable from './components/HostTable';
import HostForm from './components/HostForm';
import { useState, useEffect, useRef } from 'react';
import { Host } from './types';

function App() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

// Используем URL API для корректной обработки протокола
const apiURL = new URL(process.env.REACT_APP_API_URL || 'https://localhost:8443');
const WS_URL = `${apiURL.protocol === 'http:' ? 'wss' : 'ws'}:/${apiURL.host}/api/ws/monitor`;


  useEffect(() => {
    const connectWebSocket = () => {
      if (typeof window === 'undefined') return;

      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('WebSocket connected to:', WS_URL);
      };

      ws.current.onmessage = (event) => {
        try {
          const data: Host[] = JSON.parse(event.data);
          setHosts(data);
        } catch (error) {
          console.error('Ошибка парсинга данных:', error);
          setErrorMessage('Ошибка обработки данных');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setErrorMessage('Ошибка соединения с сервером');
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting...');
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    // Начальная загрузка данных
    fetch(`${apiURL}/api/hosts`)
      .then(response => {
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        return response.json();
      })
      .then(data => setHosts(data))
      .catch(error => {
        console.error('Ошибка инициализации:', error);
        setErrorMessage('Ошибка загрузки данных');
      });

    return () => {
      ws.current?.close();
    };
  }, [apiURL, WS_URL]);

  const handleAddHost = async (newHost: Host) => {
    try {
      const response = await fetch(`${apiURL}/api/hosts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHost),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка добавления хоста');
      }

      const createdHost = await response.json();
      setHosts(prev => [...prev, createdHost]);
      setSuccessMessage('Хост успешно добавлен');
      setErrorMessage(null);
    } catch (error: any) {
      setErrorMessage(error.message || 'Ошибка добавления хоста');
      setSuccessMessage(null);
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
        {successMessage && (
          <Snackbar
            open={!!successMessage}
            message={successMessage}
            autoHideDuration={3000}
            onClose={() => setSuccessMessage(null)}
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