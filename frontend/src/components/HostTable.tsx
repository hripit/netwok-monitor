import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface Host {
  ip: string;
  status: string;
  rtt: number | null;
  delivered: number;
  loss: number;
  last_ping: string;
}

export const HostTable = () => {
  const [hosts, setHosts] = useState<Host[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/monitor');
    ws.onmessage = (e) => setHosts(JSON.parse(e.data));
    return () => ws.close();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>IP</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>RTT, мс</TableCell>
            <TableCell>% доставки</TableCell>
            <TableCell>% потерь</TableCell>
            <TableCell>Последний пинг</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hosts.map((host) => (
            <TableRow key={host.ip}>
              <TableCell>{host.ip}</TableCell>
              <TableCell>{host.status}</TableCell>
              <TableCell style={{ color: host.rtt ? 'green' : 'red' }}>
                {host.rtt ? `${host.rtt.toFixed(1)}` : 'n/a'}
              </TableCell>
              <TableCell>{host.delivered.toFixed(1)}%</TableCell>
              <TableCell>{host.loss.toFixed(1)}%</TableCell>
              <TableCell>{host.last_ping}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};