import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { pacientService } from '../../services/pacient.service';
import { deviceService } from '../../services/device.service';
import { cepService } from '../../services/cep.service';
import type { Pacient, PacientRequest } from '../../types/pacient.types';
import { PacientStatus as PacientStatusEnum, ContractType } from '../../types/pacient.types';
import { applyCPFMask, validateCPF, applyPhoneMask, validatePhone, removeFormatting, formatDateToBR, formatDateToISO, applyDateMask, applyCEPMask, validateCEP } from '../../utils/formatters';

interface PacientFormProps {
  pacient?: Pacient | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PacientForm = ({ pacient, onClose, onSuccess }: PacientFormProps) => {
  const { user } = useAuth();
  const myProfessionalId = user?.professionalId ?? undefined;

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
    aparelhoIds: [],
    profissionalResponsavelId: undefined,
    observacoes: ''
  });
  const [cpfError, setCpfError] = useState<string>('');
  const [telefoneError, setTelefoneError] = useState<string>('');
  const [telefoneSecundarioError, setTelefoneSecundarioError] = useState<string>('');
  const [cepError, setCepError] = useState<string>('');
  const [isSearchingCep, setIsSearchingCep] = useState<boolean>(false);

  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceService.getAll()
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
        aparelhoIds: pacient.aparelhos?.map((a) => a.id) ?? [],
        profissionalResponsavelId: pacient.profissionalResponsavelId,
        observacoes: pacient.observacoes || ''
      });
    }
  }, [pacient]);

  const createMutation = useMutation({
    mutationFn: pacientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', 'bairros'] });
      onSuccess();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PacientRequest>) => 
      pacientService.update(pacient!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', 'bairros'] });
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

    // Valida CEP antes de submeter (se preenchido)
    if (formData.enderecoCep && !validateCEP(formData.enderecoCep)) {
      setCepError('CEP deve conter 8 dígitos');
      return;
    }
    
    setCpfError('');
    setTelefoneError('');
    setTelefoneSecundarioError('');
    setCepError('');

    if (!myProfessionalId) {
      alert(
        'Sua conta não está vinculada a um profissional. Ajuste o cadastro no banco de dados ou contate o suporte.'
      );
      return;
    }

    // Converte datas do formato dd/mm/yyyy para yyyy-mm-dd antes de enviar
    const submitData = {
      ...formData,
      profissionalResponsavelId: myProfessionalId,
      aparelhoIds: formData.aparelhoIds ?? [],
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
      [name]: value
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

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = applyCEPMask(rawValue);

    // Remove formatação para armazenar apenas números
    const numbersOnly = removeFormatting(maskedValue);

    setFormData(prev => ({
      ...prev,
      enderecoCep: numbersOnly
    }));

    // Validação em tempo real
    if (numbersOnly.length > 0 && numbersOnly.length < 8) {
      setCepError('CEP deve conter 8 dígitos');
    } else if (numbersOnly.length === 8) {
      setCepError('');
    } else if (numbersOnly.length > 8) {
      setCepError('CEP deve conter no máximo 8 dígitos');
    } else {
      setCepError('');
    }
  };

  const handleSearchCep = async () => {
    const cep = formData.enderecoCep;

    if (!cep || !validateCEP(cep)) {
      setCepError('Informe um CEP válido com 8 dígitos para buscar o endereço');
      return;
    }

    try {
      setIsSearchingCep(true);
      setCepError('');

      const address = await cepService.getAddressByCep(cep);

      setFormData(prev => ({
        ...prev,
        enderecoLogradouro: address.logradouro || prev.enderecoLogradouro,
        enderecoBairro: address.bairro || prev.enderecoBairro,
        enderecoCidade: address.localidade || prev.enderecoCidade,
        enderecoEstado: address.uf || prev.enderecoEstado
      }));
    } catch (error) {
      setCepError('Não foi possível buscar o endereço para este CEP');
    } finally {
      setIsSearchingCep(false);
    }
  };


  const selectedIds = new Set(formData.aparelhoIds ?? []);
  const availableDevices = devices.filter(
    (d) => d.status === 'ESTOQUE' || selectedIds.has(d.id)
  );

  const toggleAparelho = (deviceId: number) => {
    setFormData((prev) => {
      const ids = new Set(prev.aparelhoIds ?? []);
      if (ids.has(deviceId)) ids.delete(deviceId);
      else ids.add(deviceId);
      return { ...prev, aparelhoIds: [...ids] };
    });
  };

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
              
            <div className="form-group">
                <label>CEP</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="enderecoCep"
                    value={applyCEPMask(formData.enderecoCep)}
                    onChange={handleCEPChange}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    onClick={handleSearchCep}
                    disabled={isSearchingCep}
                    title="Buscar endereço pelo CEP"
                  >
                    🔍
                  </button>
                </div>
                {cepError && 
                  <span className="error-message" style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {cepError}
                  </span>}
              </div>

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

            <div className="form-group">
              <label>Aparelhos vinculados</label>
              <p className="form-hint" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Marque os aparelhos em uso por este paciente (apenas itens em estoque ou já vinculados a ele).
              </p>
              <div className="device-checklist">
                {availableDevices.length === 0 ? (
                  <span className="text-muted">Nenhum aparelho disponível para vincular.</span>
                ) : (
                  availableDevices.map((device) => (
                    <label key={device.id} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(device.id)}
                        onChange={() => toggleAparelho(device.id)}
                      />
                      <span>
                        {device.numeroPatrimonio} — {device.tipo}
                        {device.status !== 'ESTOQUE' && (
                          <span className="text-muted"> ({device.status})</span>
                        )}
                      </span>
                    </label>
                  ))
                )}
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
