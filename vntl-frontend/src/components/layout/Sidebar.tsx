import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/devices', label: 'Aparelhos', icon: '🏥' },
    { path: '/patients', label: 'Pacientes', icon: '👥' },
    { path: '/professionals', label: 'Profissionais', icon: '👨‍⚕️' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>VNTL Gestão</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-name">{user?.nome}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <button onClick={logout} className="logout-btn">
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
