import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalService } from '../../services/professional.service';
import type { Professional, ProfessionalRequest } from '../../types/professional.types';
import { applyCPFMask, validateCPF, applyPhoneMask, validatePhone, removeFormatting } from '../../utils/formatters';

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
  const [cpfError, setCpfError] = useState<string>('');
  const [telefoneError, setTelefoneError] = useState<string>('');
  const [telefoneSecundarioError, setTelefoneSecundarioError] = useState<string>('');

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
    
    // Valida CPF antes de submeter
    if (!validateCPF(formData.cpf)) {
      setCpfError('CPF deve conter 11 dígitos');
      return;
    }
    
    // Valida telefones antes de submeter
    if (formData.telefone && !validatePhone(formData.telefone)) {
      setTelefoneError('Telefone deve conter 10 ou 11 dígitos');
      return;
    }
    
    if (formData.telefoneSecundario && !validatePhone(formData.telefoneSecundario)) {
      setTelefoneSecundarioError('Telefone deve conter 10 ou 11 dígitos');
      return;
    }
    
    setCpfError('');
    setTelefoneError('');
    setTelefoneSecundarioError('');
    
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

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = applyCPFMask(rawValue);
    
    // Remove formatação para armazenar apenas números
    const numbersOnly = removeFormatting(maskedValue);
    
    setFormData(prev => ({
      ...prev,
      cpf: numbersOnly
    }));

    // Validação em tempo real
    if (numbersOnly.length > 0 && numbersOnly.length < 11) {
      setCpfError('CPF deve conter 11 dígitos');
    } else if (numbersOnly.length === 11) {
      setCpfError('');
    } else {
      setCpfError('');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'telefone' | 'telefoneSecundario') => {
    const rawValue = e.target.value;
    const maskedValue = applyPhoneMask(rawValue);
    
    // Remove formatação para armazenar apenas números
    const numbersOnly = removeFormatting(maskedValue);
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: numbersOnly
    }));

    // Validação em tempo real
    const errorSetter = fieldName === 'telefone' ? setTelefoneError : setTelefoneSecundarioError;
    
    if (numbersOnly.length > 0 && numbersOnly.length < 10) {
      errorSetter('Telefone deve conter 10 ou 11 dígitos');
    } else if (numbersOnly.length === 10 || numbersOnly.length === 11) {
      errorSetter('');
    } else if (numbersOnly.length > 11) {
      errorSetter('Telefone deve conter no máximo 11 dígitos');
    } else {
      errorSetter('');
    }
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
                value={applyCPFMask(formData.cpf)}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
              {cpfError && 
              <span className="error-message" style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {cpfError}
                </span>}
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
                value={applyPhoneMask(formData.telefone)}
                onChange={(e) => handlePhoneChange(e, 'telefone')}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
              {telefoneError && 
                <span className="error-message" style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {telefoneError}
                </span>}
            </div>

            <div className="form-group">
              <label>Telefone Secundário</label>
              <input
                type="tel"
                name="telefoneSecundario"
                value={applyPhoneMask(formData.telefoneSecundario)}
                onChange={(e) => handlePhoneChange(e, 'telefoneSecundario')}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
              {telefoneSecundarioError && 
                <span className="error-message" style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {telefoneSecundarioError}
                </span>}
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
