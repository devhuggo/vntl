import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceService } from '../../services/device.service';
import type { Aparelho } from '../../types/devices.types';
import { StatusAparelho as StatusAparelhoEnum } from '../../types/devices.types';
import type { AparelhoRequest } from '../../types/devices.types';
import { formatDateToBR, formatDateToISO, applyDateMask } from '../../utils/formatters';

type DeviceFormState = Omit<AparelhoRequest, 'dataCompra' | 'dataUltimaTroca'> & {
  dataCompra: string;
  dataUltimaTroca: string;
};

interface DeviceFormProps {
  device?: Aparelho | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DeviceForm = ({ device, onClose, onSuccess }: DeviceFormProps) => {
  // Inicializa dataCompra no formato dd/mm/yyyy para exibição
  const today = new Date();
  const todayBR = formatDateToBR(today.toISOString().split('T')[0]);
  
  const [formData, setFormData] = useState<DeviceFormState>({
    numeroPatrimonio: '',
    tipo: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    dataCompra: todayBR,
    dataUltimaTroca: '',
    status: StatusAparelhoEnum.ESTOQUE,
    observacoes: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (device) {
      const dataCompraBR = formatDateToBR(device.dataCompra.split('T')[0]);
      const dataUltimaTrocaBR = device.dataUltimaTroca
        ? formatDateToBR(device.dataUltimaTroca.split('T')[0])
        : '';
      setFormData({
        numeroPatrimonio: device.numeroPatrimonio,
        tipo: device.tipo,
        marca: device.marca || '',
        modelo: device.modelo || '',
        numeroSerie: device.numeroSerie || '',
        dataCompra: dataCompraBR,
        dataUltimaTroca: dataUltimaTrocaBR,
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
    
    // Converte data do formato dd/mm/yyyy para yyyy-mm-dd antes de enviar
    const submitData: AparelhoRequest = {
      ...formData,
      dataCompra: formatDateToISO(formData.dataCompra) || formData.dataCompra,
      dataUltimaTroca: !formData.dataUltimaTroca?.trim()
        ? null
        : formatDateToISO(formData.dataUltimaTroca) || null
    };
    
    if (device) {
      await updateMutation.mutateAsync(submitData);
    } else {
      await createMutation.mutateAsync(submitData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pacienteId' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = applyDateMask(rawValue);

    setFormData(prev => ({
      ...prev,
      dataCompra: maskedValue
    }));
  };

  const handleUltimaTrocaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyDateMask(e.target.value);
    setFormData(prev => ({
      ...prev,
      dataUltimaTroca: maskedValue
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
              <div className="date-input-wrapper">
                <input
                  type="text"
                  name="dataCompra"
                  value={formData.dataCompra}
                  onChange={handleDateChange}
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                  required
                />
                <input
                  type="date"
                  id="date-picker-dataCompra"
                  className="date-picker-hidden"
                  value={formData.dataCompra ? formatDateToISO(formData.dataCompra) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const brDate = formatDateToBR(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        dataCompra: brDate
                      }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="date-picker-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    const dateInput = document.getElementById('date-picker-dataCompra') as HTMLInputElement;
                    if (dateInput) {
                      if (typeof dateInput.showPicker === 'function') {
                        dateInput.showPicker();
                      } else {
                        dateInput.focus();
                        dateInput.click();
                      }
                    }
                  }}
                  title="Selecionar data"
                >
                  📅
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Data da última troca</label>
              <div className="date-input-wrapper">
                <input
                  type="text"
                  name="dataUltimaTroca"
                  value={formData.dataUltimaTroca}
                  onChange={handleUltimaTrocaChange}
                  placeholder="dd/mm/yyyy (opcional)"
                  maxLength={10}
                />
                <input
                  type="date"
                  id="date-picker-dataUltimaTroca"
                  className="date-picker-hidden"
                  value={
                    formData.dataUltimaTroca ? formatDateToISO(formData.dataUltimaTroca) || '' : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      const brDate = formatDateToBR(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        dataUltimaTroca: brDate
                      }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="date-picker-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    const dateInput = document.getElementById(
                      'date-picker-dataUltimaTroca'
                    ) as HTMLInputElement;
                    if (dateInput) {
                      if (typeof dateInput.showPicker === 'function') {
                        dateInput.showPicker();
                      } else {
                        dateInput.focus();
                        dateInput.click();
                      }
                    }
                  }}
                  title="Selecionar data"
                >
                  📅
                </button>
              </div>
            </div>
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
