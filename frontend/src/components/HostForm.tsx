// src/components/HostForm.tsx
import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert, Typography } from '@mui/material';
import { Host } from '../types';
import { CSVLink } from "react-csv";
import GetAppIcon from '@mui/icons-material/GetApp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface HostFormProps {
    onAddHost: (newHost: Host) => Promise<void>;
    onImport: () => void;
    hosts: Host[]; // Для экспорта данных
}

const HostForm = ({ onAddHost, onImport, hosts }: HostFormProps) => {
    const [ip, setIp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Автоматический сброс сообщений через useEffect
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 6000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Заголовки для CSV
    const csvHeaders = [
        { label: "IP", key: "ip" },
        { label: "Статус", key: "status" },
        { label: "RTT, мс", key: "rtt" },
        { label: "% доставки", key: "delivered" },
        { label: "% потерь", key: "loss" },
        { label: "Последний пинг", key: "last_ping" }
    ];

    // Преобразование данных для экспорта
    const exportData = hosts.map(host => ({
        ip: host.ip,
        status: host.status,
        rtt: host.rtt ? `${host.rtt.toFixed(1)}` : 'N/A',
        delivered: `${host.delivered.toFixed(1)}%`,
        loss: `${host.loss.toFixed(1)}%`,
        last_ping: host.last_ping ? new Date(host.last_ping).toLocaleString() : 'N/A'
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const normalizedIP = ip.trim().toLowerCase();

        if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(normalizedIP)) {
            setError('Некорректный формат IP-адреса');
            return;
        }

        try {
            const newHost: Host = {
                ip: normalizedIP,
                status: 'unknown',
                rtt: null,
                delivered: 0,
                loss: 100,
                last_ping: '00:00:00'
            };

            await onAddHost(newHost);
            setIp('');
            setError(null);
            setSuccessMessage('Хост успешно добавлен');
        } catch (error: any) {
            setError(error?.response?.data?.detail || 'Ошибка добавления хоста');
            setSuccessMessage(null);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) {
            setError('Файл не выбран');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/import`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка импорта');
            }

            setSuccessMessage(`Успешно импортировано: ${await response.text()}`);
            setError(null);
            onImport(); // Обновляем данные через WebSocket
        } catch (error: any) {
            setError(error.message || 'Ошибка импорта CSV');
            setSuccessMessage(null);
        }
    };

    return (
        <Box component="form" sx={{ mt: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

            {/* Группировка блока "Добавить хост" */}
            <Box
                sx={{
                    p: 3,
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    bgcolor: '#f9f9f9',
                    mb: 3,
                }}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Добавить хост
                </Typography>

                {/* Поле для IP и кнопка "Добавить хост" */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Поле для IP */}
                    <TextField
                        label="IP-адрес"
                        variant="outlined"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        error={!!error}
                        helperText={error ? 'Проверьте формат IP' : ''}
                        slotProps={{
                            htmlInput: { maxLength: 15, style: { fontFamily: 'monospace' } },
                        }}
                        sx={{ flex: 1 }}
                    />

                    {/* Кнопка "Добавить хост" */}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!ip.trim()}
                        onClick={handleSubmit}
                        sx={{ height: 'fit-content' }}
                    >
                        Добавить
                    </Button>
                </Box>
            </Box>

            {/* Блок импорта/экспорта */}
            <Box sx={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Импорт CSV */}
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange} // Вызываем импорт сразу после выбора файла
                    id="csv-file-input"
                    style={{ display: 'none' }}
                />
                <label htmlFor="csv-file-input">
                    <Button
                        variant="contained"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                    >
                        Import CSV
                    </Button>
                </label>

                {/* Экспорт CSV */}
                <CSVLink
                    data={exportData}
                    headers={csvHeaders}
                    filename={`monitoring_${new Date().toISOString().slice(0,10)}.csv`}
                    separator=";"
                    style={{ textDecoration: 'none' }}
                >
                    <Button
                        variant="outlined"
                        startIcon={<GetAppIcon />}
                        sx={{ mt: 2 }}
                    >
                        Export CSV
                    </Button>
                </CSVLink>
            </Box>
        </Box>
    );
};

export default HostForm;