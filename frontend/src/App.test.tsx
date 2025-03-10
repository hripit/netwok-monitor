// src/App.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Моковые данные для тестирования
const mockHosts = [
  {
    ip: '192.168.1.1',
    status: 'online',
    rtt: 10.5,
    delivered: 99.9,
    loss: 0.1,
    last_ping: '2023-10-01T12:00:00Z',
  },
];

test('renders learn react link', () => {
  render(
      <App />
  );

  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});