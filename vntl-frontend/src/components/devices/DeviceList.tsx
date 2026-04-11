import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceService } from '../../services/device.service';
import { useState } from 'react';
import DeviceForm from './DeviceForm';
import type { Aparelho, DeviceListFilters, StatusAparelho } from '../../types/devices.types';

const DeviceList = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Aparelho | null>(null);

  const [dataCompraDe, setDataCompraDe] = useState('');
  const [dataCompraAte, setDataCompraAte] = useState('');
  const [dataUltimaTrocaDe, setDataUltimaTrocaDe] = useState('');
  const [dataUltimaTrocaAte, setDataUltimaTrocaAte] = useState('');

  const queryClient = useQueryClient();

  const listFilters: DeviceListFilters | undefined = (() => {
    const p: DeviceListFilters = {};
    if (dataCompraDe) p.dataCompraDe = dataCompraDe;
    if (dataCompraAte) p.dataCompraAte = dataCompraAte;
    if (dataUltimaTrocaDe) p.dataUltimaTrocaDe = dataUltimaTrocaDe;
    if (dataUltimaTrocaAte) p.dataUltimaTrocaAte = dataUltimaTrocaAte;
    return Object.keys(p).length ? p : undefined;
  })();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices', dataCompraDe, dataCompraAte, dataUltimaTrocaDe, dataUltimaTrocaAte],
    queryFn: () => deviceService.getAll(listFilters)
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

  const formatTableDate = (value: string | null | undefined) => {
    if (!value) return '—';
    const iso = value.split('T')[0];
    return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR');
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

      <div className="filters device-filters-grid">
        <div className="form-group filter-date-group">
          <label htmlFor="filter-data-compra-de">Data de compra (de)</label>
          <input
            id="filter-data-compra-de"
            type="date"
            value={dataCompraDe}
            onChange={(e) => setDataCompraDe(e.target.value)}
            className="filter-select"
          />
        </div>
        <div className="form-group filter-date-group">
          <label htmlFor="filter-data-compra-ate">Data de compra (até)</label>
          <input
            id="filter-data-compra-ate"
            type="date"
            value={dataCompraAte}
            onChange={(e) => setDataCompraAte(e.target.value)}
            className="filter-select"
          />
        </div>
        <div className="form-group filter-date-group">
          <label htmlFor="filter-ultima-troca-de">Última troca (de)</label>
          <input
            id="filter-ultima-troca-de"
            type="date"
            value={dataUltimaTrocaDe}
            onChange={(e) => setDataUltimaTrocaDe(e.target.value)}
            className="filter-select"
          />
        </div>
        <div className="form-group filter-date-group">
          <label htmlFor="filter-ultima-troca-ate">Última troca (até)</label>
          <input
            id="filter-ultima-troca-ate"
            type="date"
            value={dataUltimaTrocaAte}
            onChange={(e) => setDataUltimaTrocaAte(e.target.value)}
            className="filter-select"
          />
        </div>
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
              <th>Última troca</th>
              <th>Status</th>
              <th>Paciente</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
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
                      : device.marca || device.modelo || '-'}
                  </td>
                  <td>{formatTableDate(device.dataCompra)}</td>
                  <td>{formatTableDate(device.dataUltimaTroca ?? undefined)}</td>
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
