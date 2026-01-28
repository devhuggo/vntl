import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { visitService } from '../../services/visit.service';
import { pacientService } from '../../services/pacient.service';
import { professionalService } from '../../services/professional.service';
import { deviceService } from '../../services/device.service';
import type { Visit, VisitRequest, VisitStatus, VisitType } from '../../types/visit.types';
import { VisitStatus as VisitStatusEnum, VisitType as VisitTypeEnum } from '../../types/visit.types';
import type { Pacient } from '../../types/pacient.types';
import type { Professional } from '../../types/professional.types';
import type { Aparelho } from '../../types/devices.types';

interface VisitFormProps {
  visit?: Visit | null;
  onClose: () => void;
  onSuccess: () => void;
}

const VisitForm = ({ visit, onClose, onSuccess }: VisitFormProps) => {
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery<Pacient[]>({
    queryKey: ['patients'],
    queryFn: pacientService.getAll
  });

  const { data: professionals = [] } = useQuery<Professional[]>({
    queryKey: ['professionals'],
    queryFn: professionalService.getAll
  });

  const { data: devices = [] } = useQuery<Aparelho[]>({
    queryKey: ['devices'],
    queryFn: deviceService.getAll
  });

  const [formData, setFormData] = useState<VisitRequest>(() => ({
    pacienteId: visit?.pacienteId ?? 0,
    profissionalId: visit?.profissionalId ?? 0,
    aparelhoId: visit?.aparelhoId,
    dataVisita: visit?.dataVisita ?? '',
    status: visit?.status ?? VisitStatusEnum.AGENDADA,
    observacoes: visit?.observacoes ?? '',
    tipoVisita: visit?.tipoVisita ?? VisitTypeEnum.VERIFICACAO,
    proximaVisita: visit?.proximaVisita ? visit.proximaVisita.slice(0, 16) : undefined
  }));

  useEffect(() => {
    if (!visit && patients.length > 0 && professionals.length > 0) {
      setFormData(prev => ({
        ...prev,
        pacienteId: prev.pacienteId || patients[0].id,
        profissionalId: prev.profissionalId || professionals[0].id
      }));
    }
  }, [visit, patients, professionals]);

  const createMutation = useMutation({
    mutationFn: visitService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      onSuccess();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: VisitRequest }) => visitService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      onSuccess();
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'pacienteId' || name === 'profissionalId' || name === 'aparelhoId'
        ? (value ? Number(value) : undefined)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: VisitRequest = {
      ...formData,
      proximaVisita: formData.proximaVisita || undefined
    };

    if (visit) {
      await updateMutation.mutateAsync({ id: visit.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const getStatusLabel = (status: VisitStatus) => {
    const labels: Record<VisitStatus, string> = {
      AGENDADA: 'Agendada',
      CONFIRMADA: 'Confirmada',
      REALIZADA: 'Realizada',
      CANCELADA: 'Cancelada',
      REMARCADA: 'Remarcada'
    };
    return labels[status];
  };

  const getTypeLabel = (type: VisitType) => {
    const labels: Record<VisitType, string> = {
      VERIFICACAO: 'Verificação',
      MANUTENCAO: 'Manutenção',
      TROCA: 'Troca',
      INSTALACAO: 'Instalação'
    };
    return labels[type];
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{visit ? 'Editar Visita' : 'Nova Visita'}</h3>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Paciente</label>
              <select
                name="pacienteId"
                value={formData.pacienteId || ''}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um paciente</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Profissional</label>
              <select
                name="profissionalId"
                value={formData.profissionalId || ''}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um profissional</option>
                {professionals.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Aparelho (opcional)</label>
              <select
                name="aparelhoId"
                value={formData.aparelhoId || ''}
                onChange={handleChange}
              >
                <option value="">Sem aparelho vinculado</option>
                {devices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.numeroPatrimonio} - {d.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Data da Visita</label>
              <input
                type="date"
                name="dataVisita"
                value={formData.dataVisita}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo de Visita</label>
              <select
                name="tipoVisita"
                value={formData.tipoVisita}
                onChange={handleChange}
                required
              >
                {Object.values(VisitTypeEnum).map(type => (
                  <option key={type} value={type}>
                    {getTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                {Object.values(VisitStatusEnum).map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes || ''}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {visit ? 'Salvar Alterações' : 'Agendar Visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitForm;

