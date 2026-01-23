import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceService } from '../../services/device.service';
import { useState } from 'react';
import DeviceForm from './DeviceForm';
import type { Aparelho, StatusAparelho } from '../../types/devices.types';
import { StatusAparelho as StatusAparelhoEnum } from '../../types/devices.types';

const DeviceList = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Aparelho | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const queryClient = useQueryClient();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices', statusFilter],
    queryFn: () => statusFilter === 'all' 
      ? deviceService.getAll() 
      : deviceService.getByStatus(statusFilter)
  });

  const deleteMutation = useMutation({
    mutationFn: deviceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    }
  });

  const handleEdit = (device: Aparelho) => {
    setEditingDevice(device);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este aparelho?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDevice(null);
  };

  const getStatusLabel = (status: StatusAparelho) => {
    const labels: Record<StatusAparelho, string> = {
      ESTOQUE: 'Estoque',
      EM_USO: 'Em Uso',
      MANUTENCAO: 'Manutenção',
      INATIVO: 'Inativo'
    };
    return labels[status];
  };

  const getStatusClass = (status: StatusAparelho) => {
    const classes: Record<StatusAparelho, string> = {
      ESTOQUE: 'status-estoque',
      EM_USO: 'status-em-uso',
      MANUTENCAO: 'status-manutencao',
      INATIVO: 'status-inativo'
    };
    return classes[status];
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="device-list">
      <div className="page-header">
        <h2>Gerenciamento de Aparelhos</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Novo Aparelho
        </button>
      </div>

      <div className="filters">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todos os Status</option>
          {Object.values(StatusAparelhoEnum).map(status => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <DeviceForm
          device={editingDevice}
          onClose={handleCloseForm}
          onSuccess={handleCloseForm}
        />
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patrimônio</th>
              <th>Tipo</th>
              <th>Marca/Modelo</th>
              <th>Data Compra</th>
              <th>Status</th>
              <th>Paciente</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  Nenhum aparelho encontrado
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id}>
                  <td>{device.numeroPatrimonio}</td>
                  <td>{device.tipo}</td>
                  <td>
                    {device.marca && device.modelo 
                      ? `${device.marca} - ${device.modelo}`
                      : device.marca || device.modelo || '-'
                    }
                  </td>
                  <td>{new Date(device.dataCompra).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(device.status)}`}>
                      {getStatusLabel(device.status)}
                    </span>
                  </td>
                  <td>{device.pacienteNome || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(device)}
                        className="btn btn-sm btn-secondary"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(device.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceList;
