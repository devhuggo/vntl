import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { visitService } from '../../services/visit.service';
import { pacientService } from '../../services/pacient.service';
import type { Visit, VisitStatus } from '../../types/visit.types';
import { VisitStatus as VisitStatusEnum } from '../../types/visit.types';
import type { Pacient } from '../../types/pacient.types';
import VisitForm from './VisitForm';

const VisitList = () => {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dataVisitaDe, setDataVisitaDe] = useState('');
  const [dataVisitaAte, setDataVisitaAte] = useState('');

  const listParams = (() => {
    const p: {
      status?: string;
      dataVisitaDe?: string;
      dataVisitaAte?: string;
    } = {};
    if (statusFilter !== 'all') p.status = statusFilter;
    if (dataVisitaDe && dataVisitaAte) {
      p.dataVisitaDe = dataVisitaDe;
      p.dataVisitaAte = dataVisitaAte;
    }
    return Object.keys(p).length ? p : undefined;
  })();

  const { data: visits = [], isLoading } = useQuery<Visit[]>({
    queryKey: ['visits', statusFilter, dataVisitaDe, dataVisitaAte],
    queryFn: () => visitService.getAll(listParams)
  });

  const { data: patients = [] } = useQuery<Pacient[]>({
    queryKey: ['patients'],
    queryFn: () => pacientService.getAll()
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

  const getPatientName = (id: number | undefined) => {
    if (!id) return '-';
    const patient = patients.find((p) => p.id === id);
    return patient?.nome || '-';
  };

  const periodFilterIncomplete =
    (dataVisitaDe && !dataVisitaAte) || (!dataVisitaDe && dataVisitaAte);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="visit-list">
      <div className="page-header">
        <h2>Agendamento de Visitas</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Nova Visita
        </button>
      </div>

      <div className="filters visit-filters-grid">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
          aria-label="Filtrar por status"
        >
          <option value="all">Todos os Status</option>
          {Object.values(VisitStatusEnum).map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </select>
        <div className="form-group filter-date-group">
          <label htmlFor="visit-filter-de">Data da visita (de)</label>
          <input
            id="visit-filter-de"
            type="date"
            value={dataVisitaDe}
            onChange={(e) => setDataVisitaDe(e.target.value)}
            className="filter-select"
          />
        </div>
        <div className="form-group filter-date-group">
          <label htmlFor="visit-filter-ate">Data da visita (até)</label>
          <input
            id="visit-filter-ate"
            type="date"
            value={dataVisitaAte}
            onChange={(e) => setDataVisitaAte(e.target.value)}
            className="filter-select"
          />
        </div>
      </div>
      {periodFilterIncomplete && (
        <p className="filter-hint" role="status">
          Informe <strong>data inicial e final</strong> para filtrar por período. Com apenas uma data, o
          período não é aplicado.
        </p>
      )}

      {showForm && (
        <VisitForm visit={editingVisit} onClose={handleCloseForm} onSuccess={handleCloseForm} />
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Paciente</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">
                  Nenhuma visita encontrada
                </td>
              </tr>
            ) : (
              visits.map((visit) => (
                <tr key={visit.id}>
                  <td>
                    {visit.dataVisita
                      ? new Date(visit.dataVisita).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td>{getPatientName(visit.pacienteId)}</td>
                  <td>{visit.tipoVisita}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(visit.status)}`}>
                      {getStatusLabel(visit.status)}
                    </span>
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
