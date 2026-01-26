import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { pacientService } from '../../services/pacient.service';
import { deviceService } from '../../services/device.service';
import { professionalService } from '../../services/professional.service';
import type { Pacient, PacientRequest } from '../../types/pacient.types';
import { PacientStatus as PacientStatusEnum, ContractType } from '../../types/pacient.types';
import { applyCPFMask, validateCPF, applyPhoneMask, validatePhone, removeFormatting, formatDateToBR, formatDateToISO, applyDateMask } from '../../utils/formatters';

interface PacientFormProps {
  pacient?: Pacient | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PacientForm = ({ pacient, onClose, onSuccess }: PacientFormProps) => {
  const [formData, setFormData] = useState<PacientRequest>({
    nome: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    telefoneSecundario: '',
    email: '',
    enderecoLogradouro: '',
    enderecoNumero: '',
    enderecoComplemento: '',
    enderecoBairro: '',
    enderecoCidade: '',
    enderecoEstado: '',
    enderecoCep: '',
    tipoContrato: ContractType.PARTICULAR,
    status: PacientStatusEnum.ATIVO,
    dataProximaVisita: '',
    aparelhoId: undefined,
    profissionalResponsavelId: undefined,
    observacoes: ''
  });
  const [cpfError, setCpfError] = useState<string>('');
  const [telefoneError, setTelefoneError] = useState<string>('');
  const [telefoneSecundarioError, setTelefoneSecundarioError] = useState<string>('');

  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: deviceService.getAll
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: professionalService.getAll
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (pacient) {
      setFormData({
        nome: pacient.nome,
        cpf: pacient.cpf,
        dataNascimento: formatDateToBR(pacient.dataNascimento?.split('T')[0]),
        telefone: pacient.telefone || '',
        telefoneSecundario: pacient.telefoneSecundario || '',
        email: pacient.email || '',
        enderecoLogradouro: pacient.enderecoLogradouro || '',
        enderecoNumero: pacient.enderecoNumero || '',
        enderecoComplemento: pacient.enderecoComplemento || '',
        enderecoBairro: pacient.enderecoBairro || '',
        enderecoCidade: pacient.enderecoCidade || '',
        enderecoEstado: pacient.enderecoEstado || '',
        enderecoCep: pacient.enderecoCep || '',
        tipoContrato: pacient.tipoContrato,
        status: pacient.status,
        dataProximaVisita: formatDateToBR(pacient.dataProximaVisita?.split('T')[0]),
        aparelhoId: pacient.aparelhoId,
        profissionalResponsavelId: pacient.profissionalResponsavelId,
        observacoes: pacient.observacoes || ''
      });
    }
  }, [pacient]);

  const createMutation = useMutation({
    mutationFn: pacientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      onSuccess();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PacientRequest>) => 
      pacientService.update(pacient!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
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
    
    // Converte datas do formato dd/mm/yyyy para yyyy-mm-dd antes de enviar
    const submitData = {
      ...formData,
      dataNascimento: formData.dataNascimento ? formatDateToISO(formData.dataNascimento) : '',
      dataProximaVisita: formData.dataProximaVisita ? formatDateToISO(formData.dataProximaVisita) : ''
    };
    
    if (pacient) {
      await updateMutation.mutateAsync(submitData);
    } else {
      await createMutation.mutateAsync(submitData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'aparelhoId' || name === 'profissionalResponsavelId' 
        ? (value ? parseInt(value) : undefined) 
        : value
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'dataNascimento' | 'dataProximaVisita') => {
    const rawValue = e.target.value;
    const maskedValue = applyDateMask(rawValue);
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: maskedValue
    }));
  };


  const availableDevices = devices.filter(d => 
    d.status === 'ESTOQUE' || d.id === formData.aparelhoId
  );

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h3>{pacient ? 'Editar Paciente' : 'Novo Paciente'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-section">
            <h4>Dados Pessoais</h4>
            <div className="form-row">
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
                <label>Data de Nascimento</label>
                <div className="date-input-wrapper">
                  <input
                    type="text"
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={(e) => handleDateChange(e, 'dataNascimento')}
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                  />
                  <input
                    type="date"
                    id="date-picker-dataNascimento"
                    className="date-picker-hidden"
                    value={formData.dataNascimento ? formatDateToISO(formData.dataNascimento) : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const brDate = formatDateToBR(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          dataNascimento: brDate
                        }));
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="date-picker-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      const dateInput = document.getElementById('date-picker-dataNascimento') as HTMLInputElement;
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

            <div className="form-row">
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={applyPhoneMask(formData.telefone)}
                  onChange={(e) => handlePhoneChange(e, 'telefone')}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  required
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

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Endereço</h4>
            <div className="form-row">
              <div className="form-group form-group-large">
                <label>Logradouro</label>
                <input
                  type="text"
                  name="enderecoLogradouro"
                  value={formData.enderecoLogradouro}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Número</label>
                <input
                  type="text"
                  name="enderecoNumero"
                  value={formData.enderecoNumero}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Complemento</label>
                <input
                  type="text"
                  name="enderecoComplemento"
                  value={formData.enderecoComplemento}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bairro</label>
                <input
                  type="text"
                  name="enderecoBairro"
                  value={formData.enderecoBairro}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  name="enderecoCidade"
                  value={formData.enderecoCidade}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <input
                  type="text"
                  name="enderecoEstado"
                  value={formData.enderecoEstado}
                  onChange={handleChange}
                  maxLength={2}
                  placeholder="UF"
                />
              </div>

              <div className="form-group">
                <label>CEP</label>
                <input
                  type="text"
                  name="enderecoCep"
                  value={formData.enderecoCep}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Informações Clínicas</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Contrato *</label>
                <select
                  name="tipoContrato"
                  value={formData.tipoContrato}
                  onChange={handleChange}
                  required
                >
                  {Object.values(ContractType).map(type => (
                    <option key={type} value={type}>
                      {type === ContractType.PREFEITURA && 'Prefeitura'}
                      {type === ContractType.UNIMED && 'Unimed'}
                      {type === ContractType.PARTICULAR && 'Particular'}
                      {type === ContractType.OUTRO && 'Outro'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  {Object.values(PacientStatusEnum).map(status => (
                    <option key={status} value={status}>
                      {status === PacientStatusEnum.ATIVO && 'Ativo'}
                      {status === PacientStatusEnum.INATIVO && 'Inativo'}
                      {status === PacientStatusEnum.AGUARDANDO && 'Aguardando'}
                      {status === PacientStatusEnum.ALTA && 'Alta'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Data da Próxima Visita</label>
                <div className="date-input-wrapper">
                  <input
                    type="text"
                    name="dataProximaVisita"
                    value={formData.dataProximaVisita}
                    onChange={(e) => handleDateChange(e, 'dataProximaVisita')}
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                  />
                  <input
                    type="date"
                    id="date-picker-dataProximaVisita"
                    className="date-picker-hidden"
                    value={formData.dataProximaVisita ? formatDateToISO(formData.dataProximaVisita) : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const brDate = formatDateToBR(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          dataProximaVisita: brDate
                        }));
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="date-picker-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      const dateInput = document.getElementById('date-picker-dataProximaVisita') as HTMLInputElement;
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

            <div className="form-row">
              <div className="form-group">
                <label>Aparelho</label>
                <select
                  name="aparelhoId"
                  value={formData.aparelhoId || ''}
                  onChange={handleChange}
                >
                  <option value="">Nenhum</option>
                  {availableDevices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.numeroPatrimonio} - {device.tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Profissional Responsável</label>
                <select
                  name="profissionalResponsavelId"
                  value={formData.profissionalResponsavelId || ''}
                  onChange={handleChange}
                >
                  <option value="">Nenhum</option>
                  {professionals.filter(p => p.ativo).map(professional => (
                    <option key={professional.id} value={professional.id}>
                      {professional.nome}
                    </option>
                  ))}
                </select>
              </div>
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
                : pacient ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PacientForm;
