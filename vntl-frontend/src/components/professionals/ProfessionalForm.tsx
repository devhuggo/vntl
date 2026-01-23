import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalService } from '../../services/professional.service';
import type { Professional, ProfessionalRequest } from '../../types/professional.types';

interface ProfessionalFormProps {
  professional?: Professional | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProfessionalForm = ({ professional, onClose, onSuccess }: ProfessionalFormProps) => {
  const [formData, setFormData] = useState<ProfessionalRequest>({
    nome: '',
    cpf: '',
    telefone: '',
    telefoneSecundario: '',
    email: '',
    ativo: true,
    observacoes: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (professional) {
      setFormData({
        nome: professional.nome,
        cpf: professional.cpf,
        telefone: professional.telefone || '',
        telefoneSecundario: professional.telefoneSecundario || '',
        email: professional.email || '',
        ativo: professional.ativo,
        observacoes: professional.observacoes || ''
      });
    }
  }, [professional]);

  const createMutation = useMutation({
    mutationFn: professionalService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      onSuccess();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ProfessionalRequest>) => 
      professionalService.update(professional!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      onSuccess();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (professional) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{professional ? 'Editar Profissional' : 'Novo Profissional'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Nome Completo *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CPF *</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="00000000000"
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="ativo"
                value={formData.ativo ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.value === 'true' }))}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Telefone Secundário</label>
              <input
                type="tel"
                name="telefoneSecundario"
                value={formData.telefoneSecundario}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
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
                : professional ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalForm;
