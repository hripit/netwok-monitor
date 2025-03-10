// src/App.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Snackbar } from '@mui/material';
import HostForm from './components/HostForm';
import HostTable from './components/HostTable';
import { Host } from './types';

const RECONNECT_INTERVAL = 1000; // 1 секунда
const BATCH_UPDATE_DELAY = 100; // 100 мс для группировки обновлений

const App = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const messageBuffer = useRef<Host[]>([]);
  const updateTimer = useRef<NodeJS.Timeout | null>(null);

  // Непосредственное обновление состояния
  const updateHostsState = useCallback((newData: Host[]) => {
    setHosts(prev => {
      const merged = new Map([...prev, ...newData].map(h => [h.ip, h]));
      return Array.from(merged.values());
    });
  }, []);

  // Обработчик WebSocket-сообщений
  const handleWsMessage = useCallback((event: MessageEvent) => {
    try {
      const newData: Host[] = JSON.parse(event.data);
      messageBuffer.current = [...messageBuffer.current, ...newData];

      // Группируем обновления для оптимизации
      if (updateTimer.current) clearTimeout(updateTimer.current);
      updateTimer.current = setTimeout(() => {
        updateHostsState(messageBuffer.current);
        messageBuffer.current = [];
      }, BATCH_UPDATE_DELAY);
    } catch (error) {
      console.error('Ошибка обработки сообщения:', error);
    }
  }, [updateHostsState]);

  // Подключение WebSocket
  const connectWebSocket = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'wss://localhost:8443';
    ws.current = new WebSocket(`${wsUrl}/api/ws/monitor`);

    ws.current.onopen = () => {
      console.log('WebSocket подключен');
      setErrorMessage(null);
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };

    ws.current.onmessage = handleWsMessage;

    ws.current.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      setErrorMessage('Ошибка соединения. Переподключение...');
    };

    ws.current.onclose = () => {
      console.log('WebSocket отключен');
      reconnectTimeout.current = setTimeout(connectWebSocket, RECONNECT_INTERVAL);
    };
  }, [handleWsMessage]);

  // Инициализация WebSocket
  useEffect(() => {

    connectWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        if (updateTimer.current) clearTimeout(updateTimer.current);
      }
    };
  }, [connectWebSocket]);

  // Обработчик добавления хоста
  const handleAddHost = async (newHost: Host) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/hosts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHost),
      });
      if (!response.ok) throw new Error('Ошибка добавления хоста');
      setSuccessMessage('Хост добавлен успешно');
    } catch (error: any) {
      setErrorMessage(error.message || 'Ошибка добавления хоста');
    }
  };

  // Принудительное обновление через WebSocket
  const handleRefresh = () => {
    ws.current?.send('refresh');
  };

  return (
      <Router>
        <div className="App">
          {/* Уведомления */}
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

          {/* Форма и таблица */}
          <HostForm
              onAddHost={handleAddHost}
              onImport={handleRefresh}
              hosts={hosts}
          />
          <HostTable hosts={hosts} />
        </div>
      </Router>
  );
};

export default App;