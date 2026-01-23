import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceService } from '../../services/device.service';
import type { Aparelho, AparelhoRequest } from '../../types/devices.types';
import { StatusAparelho as StatusAparelhoEnum } from '../../types/devices.types';
import { useQuery } from '@tanstack/react-query';
import { pacientService } from '../../services/pacient.service';

interface DeviceFormProps {
  device?: Aparelho | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DeviceForm = ({ device, onClose, onSuccess }: DeviceFormProps) => {
  const [formData, setFormData] = useState<AparelhoRequest>({
    numeroPatrimonio: '',
    tipo: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    dataCompra: new Date().toISOString().split('T')[0],
    status: StatusAparelhoEnum.ESTOQUE,
    observacoes: ''
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: pacientService.getAll
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (device) {
      setFormData({
        numeroPatrimonio: device.numeroPatrimonio,
        tipo: device.tipo,
        marca: device.marca || '',
        modelo: device.modelo || '',
        numeroSerie: device.numeroSerie || '',
        dataCompra: device.dataCompra.split('T')[0],
        status: device.status,
        pacienteId: device.pacienteId,
        observacoes: device.observacoes || ''
      });
    }
  }, [device]);

  const createMutation = useMutation({
    mutationFn: deviceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      onSuccess();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AparelhoRequest>) => 
      deviceService.update(device!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      onSuccess();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (device) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pacienteId' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{device ? 'Editar Aparelho' : 'Novo Aparelho'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Número de Patrimônio *</label>
            <input
              type="text"
              name="numeroPatrimonio"
              value={formData.numeroPatrimonio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Aparelho *</label>
            <input
              type="text"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              placeholder="Ex: Concentrador de Oxigênio, CPAP, etc"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Marca</label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Modelo</label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Número de Série</label>
            <input
              type="text"
              name="numeroSerie"
              value={formData.numeroSerie}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data de Compra *</label>
              <input
                type="date"
                name="dataCompra"
                value={formData.dataCompra}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                {Object.values(StatusAparelhoEnum).map(status => (
                  <option key={status} value={status}>
                    {status === StatusAparelhoEnum.ESTOQUE && 'Estoque'}
                    {status === StatusAparelhoEnum.EM_USO && 'Em Uso'}
                    {status === StatusAparelhoEnum.MANUTENCAO && 'Manutenção'}
                    {status === StatusAparelhoEnum.INATIVO && 'Inativo'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.status === StatusAparelhoEnum.EM_USO && (
            <div className="form-group">
              <label>Paciente</label>
              <select
                name="pacienteId"
                value={formData.pacienteId || ''}
                onChange={handleChange}
              >
                <option value="">Nenhum</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nome} - {patient.cpf}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending 
                ? 'Salvando...' 
                : device ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceForm;
