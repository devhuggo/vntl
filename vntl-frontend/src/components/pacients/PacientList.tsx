import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pacientService } from '../../services/pacient.service';
import { useState } from 'react';
import PacientForm from './PacientForm';
import type { Pacient } from '../../types/pacient.types';
import { ContractType as ContractTypeEnum } from '../../types/pacient.types';

const PacientList = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPacient, setEditingPacient] = useState<Pacient | null>(null);
  const [contractFilter, setContractFilter] = useState<string>('all');
  const [bairroFilter, setBairroFilter] = useState<string>('all');

  const queryClient = useQueryClient();

  const { data: bairros = [] } = useQuery({
    queryKey: ['patients', 'bairros'],
    queryFn: () => pacientService.getNeighborhoods()
  });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', contractFilter, bairroFilter],
    queryFn: () =>
      pacientService.getAll({
        ...(contractFilter !== 'all' ? { tipoContrato: contractFilter } : {}),
        ...(bairroFilter !== 'all' ? { bairro: bairroFilter } : {})
      })
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

  const getContractLabel = (type: string) => {
    const labels: Record<string, string> = {
      PREFEITURA: 'Prefeitura',
      UNIMED: 'Unimed',
      PARTICULAR: 'Particular',
      OUTRO: 'Outro'
    };
    return labels[type] || type;
  };

  const formatAparelhos = (patient: Pacient) => {
    const list = patient.aparelhos;
    if (!list?.length) return '—';
    return list.map((a) => `${a.numeroPatrimonio} (${a.tipo})`).join(', ');
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

      <div className="filters filters-row">
        <select
          value={contractFilter}
          onChange={(e) => setContractFilter(e.target.value)}
          className="filter-select"
          aria-label="Filtrar por tipo de contrato"
        >
          <option value="all">Todos os contratos</option>
          {Object.values(ContractTypeEnum).map((tipo) => (
            <option key={tipo} value={tipo}>
              {getContractLabel(tipo)}
            </option>
          ))}
        </select>
        <select
          value={bairroFilter}
          onChange={(e) => setBairroFilter(e.target.value)}
          className="filter-select"
          aria-label="Filtrar por bairro"
        >
          <option value="all">Todos os bairros</option>
          {bairros.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <PacientForm pacient={editingPacient} onClose={handleCloseForm} onSuccess={handleCloseForm} />
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Contrato</th>
              <th>Aparelhos</th>
              <th>Profissional</th>
              <th>Última Visita</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  Nenhum paciente encontrado
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.nome}</td>
                  <td>{patient.telefone || '-'}</td>
                  <td>{getContractLabel(patient.tipoContrato)}</td>
                  <td className="cell-aparelhos">{formatAparelhos(patient)}</td>
                  <td>{patient.profissionalResponsavelNome || '-'}</td>
                  <td>
                    {patient.dataUltimaVisita
                      ? new Date(patient.dataUltimaVisita).toLocaleDateString('pt-BR')
                      : '-'}
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
