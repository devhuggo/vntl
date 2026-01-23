import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pacientService } from '../../services/pacient.service';
import { useState } from 'react';
import PacientForm from './PacientForm';
import type { Pacient, PacientStatus } from '../../types/pacient.types';
import { PacientStatus as PacientStatusEnum } from '../../types/pacient.types';

const PacientList = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPacient, setEditingPacient] = useState<Pacient | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', statusFilter],
    queryFn: () => statusFilter === 'all' 
      ? pacientService.getAll() 
      : pacientService.getByStatus(statusFilter as PacientStatus)
  });

  const deleteMutation = useMutation({
    mutationFn: pacientService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });

  const handleEdit = (pacient: Pacient) => {
    setEditingPacient(pacient);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPacient(null);
  };

  const getStatusLabel = (status: PacientStatus) => {
    const labels: Record<PacientStatus, string> = {
      ATIVO: 'Ativo',
      INATIVO: 'Inativo',
      AGUARDANDO: 'Aguardando',
      ALTA: 'Alta'
    };
    return labels[status];
  };

  const getContractLabel = (type: string) => {
    const labels: Record<string, string> = {
      PREFEITURA: 'Prefeitura',
      UNIMED: 'Unimed',
      PARTICULAR: 'Particular',
      OUTRO: 'Outro'
    };
    return labels[type] || type;
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="pacient-list">
      <div className="page-header">
        <h2>Gerenciamento de Pacientes</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Novo Paciente
        </button>
      </div>

      <div className="filters">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todos os Status</option>
          {Object.values(PacientStatusEnum).map(status => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <PacientForm
          pacient={editingPacient}
          onClose={handleCloseForm}
          onSuccess={handleCloseForm}
        />
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Contrato</th>
              <th>Status</th>
              <th>Aparelho</th>
              <th>Profissional</th>
              <th>Última Visita</th>
              <th>Próxima Visita</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-state">
                  Nenhum paciente encontrado
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.nome}</td>
                  <td>{formatCPF(patient.cpf)}</td>
                  <td>{patient.telefone || '-'}</td>
                  <td>{getContractLabel(patient.tipoContrato)}</td>
                  <td>
                    <span className={`status-badge status-${patient.status.toLowerCase()}`}>
                      {getStatusLabel(patient.status)}
                    </span>
                  </td>
                  <td>{patient.aparelhoNumeroPatrimonio || '-'}</td>
                  <td>{patient.profissionalResponsavelNome || '-'}</td>
                  <td>
                    {patient.dataUltimaVisita 
                      ? new Date(patient.dataUltimaVisita).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </td>
                  <td>
                    {patient.dataProximaVisita 
                      ? new Date(patient.dataProximaVisita).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(patient)}
                        className="btn btn-sm btn-secondary"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(patient.id)}
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

export default PacientList;
