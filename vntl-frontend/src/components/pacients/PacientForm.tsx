import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { pacientService } from '../../services/pacient.service';
import { deviceService } from '../../services/device.service';
import { professionalService } from '../../services/professional.service';
import type { Pacient, PacientRequest } from '../../types/pacient.types';
import { PacientStatus as PacientStatusEnum, ContractType } from '../../types/pacient.types';

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
        dataNascimento: pacient.dataNascimento?.split('T')[0] || '',
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
        dataProximaVisita: pacient.dataProximaVisita?.split('T')[0] || '',
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
    if (pacient) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
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
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="00000000000"
                  required
                />
              </div>

              <div className="form-group">
                <label>Data de Nascimento</label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
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
                <input
                  type="date"
                  name="dataProximaVisita"
                  value={formData.dataProximaVisita}
                  onChange={handleChange}
                />
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
