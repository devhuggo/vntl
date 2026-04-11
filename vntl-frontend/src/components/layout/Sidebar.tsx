import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/devices', label: 'Aparelhos', icon: '🏥' },
    { path: '/patients', label: 'Pacientes', icon: '👥' },
    { path: '/visits', label: 'Visitas', icon: '📅' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = () => {
    // Fechar sidebar em mobile após clicar em um link
    if (window.innerWidth <= 640) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && window.innerWidth <= 640 && (
        <div
          className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2>VNTL Gestão</h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={handleNavClick}
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
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="logout-btn"
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
