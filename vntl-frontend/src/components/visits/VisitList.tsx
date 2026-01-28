import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { visitService } from '../../services/visit.service';
import { pacientService } from '../../services/pacient.service';
import { professionalService } from '../../services/professional.service';
import type { Visit, VisitStatus } from '../../types/visit.types';
import { VisitStatus as VisitStatusEnum } from '../../types/visit.types';
import type { Pacient } from '../../types/pacient.types';
import type { Professional } from '../../types/professional.types';
import VisitForm from './VisitForm';

const VisitList = () => {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [professionalFilter, setProfessionalFilter] = useState<number | 'all'>('all');

  const { data: visits = [], isLoading } = useQuery<Visit[]>({
    queryKey: ['visits'],
    queryFn: visitService.getAll
  });

  const { data: patients = [] } = useQuery<Pacient[]>({
    queryKey: ['patients'],
    queryFn: pacientService.getAll
  });

  const { data: professionals = [] } = useQuery<Professional[]>({
    queryKey: ['professionals'],
    queryFn: professionalService.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: visitService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: visitService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    }
  });

  const finalizeMutation = useMutation({
    mutationFn: ({ id, criarProximaVisita }: { id: number; criarProximaVisita: boolean }) =>
      visitService.finalize(id, { criarProximaVisita, observacoes: undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    }
  });

  const handleEdit = (visit: Visit) => {
    setEditingVisit(visit);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta visita?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Tem certeza que deseja cancelar esta visita?')) {
      await cancelMutation.mutateAsync(id);
    }
  };

  const handleFinalize = async (id: number) => {
    const criarProxima = window.confirm(
      'Deseja agendar automaticamente uma nova visita para 30 dias após esta?'
    );
    await finalizeMutation.mutateAsync({ id, criarProximaVisita: criarProxima });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVisit(null);
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

  const getStatusClass = (status: VisitStatus) => {
    const classes: Record<VisitStatus, string> = {
      AGENDADA: 'status-agendada',
      CONFIRMADA: 'status-confirmada',
      REALIZADA: 'status-realizada',
      CANCELADA: 'status-cancelada',
      REMARCADA: 'status-remarcada'
    };
    return classes[status];
  };

  const getProfessionalName = (id: number | undefined) => {
    if (!id) return '-';
    const prof = professionals.find(p => p.id === id);
    return prof?.nome || '-';
  };

  const getPatientName = (id: number | undefined) => {
    if (!id) return '-';
    const patient = patients.find(p => p.id === id);
    return patient?.nome || '-';
  };

  const filteredVisits = visits.filter(v => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (professionalFilter !== 'all' && v.profissionalId !== professionalFilter) return false;
    return true;
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="visit-list">
      <div className="page-header">
        <h2>Agendamento de Visitas</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Nova Visita
        </button>
      </div>

      <div className="filters">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todos os Status</option>
          {Object.values(VisitStatusEnum).map(status => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </select>

        <select
          value={professionalFilter}
          onChange={(e) =>
            setProfessionalFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
          }
          className="filter-select"
        >
          <option value="all">Todos os Profissionais</option>
          {professionals.map(p => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <VisitForm
          visit={editingVisit}
          onClose={handleCloseForm}
          onSuccess={handleCloseForm}
        />
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Paciente</th>
              <th>Profissional</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Próxima Visita</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  Nenhuma visita encontrada
                </td>
              </tr>
            ) : (
              filteredVisits.map(visit => (
                <tr key={visit.id}>
                  <td>
                    {visit.dataVisita
                      ? new Date(visit.dataVisita).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td>{getPatientName(visit.pacienteId)}</td>
                  <td>{getProfessionalName(visit.profissionalId)}</td>
                  <td>{visit.tipoVisita}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(visit.status)}`}>
                      {getStatusLabel(visit.status)}
                    </span>
                  </td>
                  <td>
                    {visit.proximaVisita
                      ? new Date(visit.proximaVisita).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(visit)}
                        className="btn btn-sm btn-secondary"
                      >
                        Editar
                      </button>
                      {visit.status !== VisitStatusEnum.CANCELADA && (
                        <button
                          onClick={() => handleCancel(visit.id)}
                          className="btn btn-sm btn-warning"
                        >
                          Cancelar
                        </button>
                      )}
                      {visit.status !== VisitStatusEnum.REALIZADA &&
                        visit.status !== VisitStatusEnum.CANCELADA && (
                          <button
                            onClick={() => handleFinalize(visit.id)}
                            className="btn btn-sm btn-success"
                          >
                            Finalizar
                          </button>
                        )}
                      <button
                        onClick={() => handleDelete(visit.id)}
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

export default VisitList;

