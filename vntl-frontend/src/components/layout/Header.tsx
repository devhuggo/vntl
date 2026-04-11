interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  return (
    <header className="header">
      <button
        className="header-toggle-btn"
        onClick={onToggleSidebar}
        aria-label="Abrir menu"
        title="Abrir menu"
      >
        ☰
      </button>
      <h1>Sistema de Gestão Hospitalar</h1>
    </header>
  );
};

export default Header;
