import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import HostTable from './components/HostTable';
import HostForm from './components/HostForm';
import { useState, useEffect } from 'react';
import { Host } from './types'; // Импортируем тип Host

function App() {
  // Состояние для хранения хостов
  const [hosts, setHosts] = useState<Host[]>([]);

  // Функция обновления данных
  const handleRefresh = async () => {
    try {
      const response = await fetch('/api/hosts');
      const data = await response.json();
      setHosts(data);
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
    }
  };

  // Начальное получение данных
  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Network Monitor</Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <HostForm onAddHost={(newHost) => setHosts([...hosts, newHost])} />

        {/* Передаем обязательные пропсы */}
        <HostTable
          hosts={hosts}
          onRefresh={handleRefresh}
        />
      </Container>
    </Router>
  );
}

export default App;