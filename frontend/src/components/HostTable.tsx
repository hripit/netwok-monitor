import { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Host } from '../types';

interface HostTableProps {
  hosts: Host[];
  onRefresh: () => void;
}

const HostTable: React.FC<HostTableProps> = ({ hosts, onRefresh }) => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<Host[]>([]);

  useEffect(() => {
    setRowData(hosts);
  }, [hosts]);

  const exportToCSV = () => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `monitoring_${new Date().toLocaleDateString()}.csv`,
        columnSeparator: ';',
        processCellCallback: (params) => {
          if (params.column.getColId() === 'lastChecked') {
            return params.value ? new Date(params.value).toLocaleString() : '';
          }
          if (params.column.getColId() === 'responseTime') {
            return params.value ? params.value.toFixed(2) : 'N/A';
          }
          return params.value;
        },
      });
    }
  };

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
      <div className="d-flex gap-2 mb-3">
        <button onClick={onRefresh} className="btn btn-primary">
          🔄 Обновить данные
        </button>
        <button onClick={exportToCSV} className="btn btn-success">
          📄 Экспорт в CSV
        </button>
      </div>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={[
          {
            field: 'url',
            sortable: true,
            filter: true,
            headerName: 'URL',
            minWidth: 250,
          },
          {
            field: 'status',
            sortable: true,
            filter: 'agTextColumnFilter',
            headerName: 'Статус',
            cellStyle: (params) => ({
              color: params.value === 'Online' ? 'green' : 'red',
              fontWeight: 'bold',
            }),
          },
          {
            field: 'responseTime',
            sortable: true,
            filter: 'agNumberColumnFilter',
            headerName: 'Время отклика (мс)',
            valueFormatter: (params) =>
              params.value ? params.value.toFixed(2) : 'N/A',
          },
          {
            field: 'lastChecked',
            sortable: true,
            filter: 'agDateColumnFilter',
            headerName: 'Последняя проверка',
            valueFormatter: (params) =>
              params.value ? new Date(params.value).toLocaleString() : 'N/A',
          },
        ]}
        pagination={true}
        paginationPageSize={20}
        rowSelection="multiple"
        localeText={{
          page: 'Страница',
          to: 'из',
          of: 'всего',
          noRowsToShow: 'Нет данных для отображения',
        }}
      />
    </div>
  );
};

export default HostTable;