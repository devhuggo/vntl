import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalService } from '../../services/professional.service';
import { useState } from 'react';
import ProfessionalForm from './ProfessionalForm';
import type { Professional } from '../../types/professional.types';

const ProfessionalList = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

  const queryClient = useQueryClient();

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: professionalService.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: professionalService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
    }
  });

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProfessional(null);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="professional-list">
      <div className="page-header">
        <h2>Gerenciamento de Profissionais</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + Novo Profissional
        </button>
      </div>

      {showForm && (
        <ProfessionalForm
          professional={editingProfessional}
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
              <th>E-mail</th>
              <th>Pacientes</th>
              <th>Status</th>
              <th>Data Registro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {professionals.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  Nenhum profissional encontrado
                </td>
              </tr>
            ) : (
              professionals.map((professional) => (
                <tr key={professional.id}>
                  <td>{professional.nome}</td>
                  <td>{formatCPF(professional.cpf)}</td>
                  <td>{professional.telefone || '-'}</td>
                  <td>{professional.email || '-'}</td>
                  <td>{professional.pacientesCount || 0}</td>
                  <td>
                    <span className={`status-badge ${professional.ativo ? 'status-ativo' : 'status-inativo'}`}>
                      {professional.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>{new Date(professional.dataRegistro).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(professional)}
                        className="btn btn-sm btn-secondary"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(professional.id)}
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

export default ProfessionalList;
