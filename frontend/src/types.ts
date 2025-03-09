export type Host = {
  ip: string;
  status: 'online' | 'offline' | 'error' | 'unknown'; // Добавили 'unknown'
  rtt: number | null;
  delivered: number;
  loss: number;
  last_ping: string;
};