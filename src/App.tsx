import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HostTable } from './components/HostTable';
import { HostForm } from './components/HostForm';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Network Monitor</Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Container>
    </Router>
  );
}

const Home = () => {
  return (
    <>
      <HostForm />
      <HostTable />
    </>
  );
};

export default App;