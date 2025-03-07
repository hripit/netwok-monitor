export interface Host {
  ip: string;
  status: 'online' | 'offline' | 'error';
  rtt: number | null;
  delivered: number;
  loss: number;
  last_ping: string;
}