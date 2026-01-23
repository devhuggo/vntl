import { useQuery } from '@tanstack/react-query';
import { deviceService } from '../services/device.service';
import { pacientService } from '../services/pacient.service';
import { professionalService } from '../services/professional.service';
import { StatusAparelho } from '../types/devices.types';
import { PacientStatus } from '../types/pacient.types';

const Dashboard = () => {
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: deviceService.getAll
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: pacientService.getAll
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: professionalService.getAll
  });

  const devicesInStock = devices.filter(d => d.status === StatusAparelho.ESTOQUE).length;
  const devicesInUse = devices.filter(d => d.status === StatusAparelho.EM_USO).length;
  const devicesInMaintenance = devices.filter(d => d.status === StatusAparelho.MANUTENCAO).length;

  const activePatients = patients.filter(p => p.status === PacientStatus.ATIVO).length;
  const waitingPatients = patients.filter(p => p.status === PacientStatus.AGUARDANDO).length;

  const activeProfessionals = professionals.filter(p => p.ativo).length;

  const upcomingVisits = patients.filter(p => {
    if (!p.dataProximaVisita) return false;
    const visitDate = new Date(p.dataProximaVisita);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    return visitDate >= today && visitDate <= nextWeek;
  }).length;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <h3>Aparelhos</h3>
            <p className="stat-number">{devices.length}</p>
            <div className="stat-details">
              <span>Estoque: {devicesInStock}</span>
              <span>Em Uso: {devicesInUse}</span>
              <span>Manutenção: {devicesInMaintenance}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Pacientes</h3>
            <p className="stat-number">{patients.length}</p>
            <div className="stat-details">
              <span>Ativos: {activePatients}</span>
              <span>Aguardando: {waitingPatients}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>Profissionais</h3>
            <p className="stat-number">{professionals.length}</p>
            <div className="stat-details">
              <span>Ativos: {activeProfessionals}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Próximas Visitas</h3>
            <p className="stat-number">{upcomingVisits}</p>
            <div className="stat-details">
              <span>Próximos 7 dias</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>Visitas Pendentes</h3>
          <div className="visit-list">
            {patients
              .filter(p => p.dataProximaVisita && new Date(p.dataProximaVisita) <= new Date())
              .slice(0, 5)
              .map(patient => (
                <div key={patient.id} className="visit-item">
                  <div>
                    <strong>{patient.nome}</strong>
                    <span className="visit-date">
                      {patient.dataProximaVisita 
                        ? new Date(patient.dataProximaVisita).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </span>
                  </div>
                  <span className="visit-professional">
                    {patient.profissionalResponsavelNome || 'Sem profissional'}
                  </span>
                </div>
              ))}
            {patients.filter(p => p.dataProximaVisita && new Date(p.dataProximaVisita) <= new Date()).length === 0 && (
              <p className="empty-message">Nenhuma visita pendente</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Aparelhos em Manutenção</h3>
          <div className="maintenance-list">
            {devices
              .filter(d => d.status === StatusAparelho.MANUTENCAO)
              .slice(0, 5)
              .map(device => (
                <div key={device.id} className="maintenance-item">
                  <div>
                    <strong>{device.numeroPatrimonio}</strong>
                    <span>{device.tipo}</span>
                  </div>
                </div>
              ))}
            {devices.filter(d => d.status === StatusAparelho.MANUTENCAO).length === 0 && (
              <p className="empty-message">Nenhum aparelho em manutenção</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
