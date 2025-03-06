import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import { HostTable } from './components/HostTable';
import { HostForm } from './components/HostForm';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Network Monitor</Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <HostForm />
        <HostTable />
      </Container>
    </Router>
  );
}

export default App;