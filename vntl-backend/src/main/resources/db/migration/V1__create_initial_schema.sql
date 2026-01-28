-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TECHNICIAN')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Professionals
CREATE TABLE professionals (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    phone VARCHAR(20),
    secondary_phone VARCHAR(20),
    email VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devices
CREATE TABLE devices (
    id BIGSERIAL PRIMARY KEY,
    asset_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('ESTOQUE', 'EM_USO', 'MANUTENCAO', 'INATIVO')),
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients
CREATE TABLE patients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    birth_date DATE,
    phone VARCHAR(20),
    secondary_phone VARCHAR(20),
    email VARCHAR(255),
    address_street VARCHAR(255),
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zip_code VARCHAR(10),
    contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('PREFEITURA', 'UNIMED', 'PARTICULAR', 'OUTRO')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('ATIVO', 'INATIVO', 'AGUARDANDO', 'ALTA')),
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_visit_date DATE,
    next_visit_date DATE,
    device_id BIGINT,
    professional_responsible_id BIGINT,
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL,
    FOREIGN KEY (professional_responsible_id) REFERENCES professionals(id) ON DELETE SET NULL
);

-- Visits
CREATE TABLE visits (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    professional_id BIGINT NOT NULL,
    visit_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    visit_type VARCHAR(50) CHECK (visit_type IN ('INSTALACAO', 'MANUTENCAO', 'RETIRADA', 'ROTINA')),
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE SET NULL
);

-- Device history
CREATE TABLE device_history (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT NOT NULL,
    patient_id BIGINT,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observations TEXT,
    user_id BIGINT,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_professional ON patients(professional_responsible_id);
CREATE INDEX idx_patients_device ON patients(device_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_professional ON visits(professional_id);
CREATE INDEX idx_visits_date ON visits(visit_date);

-- Default admin user (password: admin123)
INSERT INTO users (username, password, name, email, role) VALUES 
('admin', '$2a$10$XNq9whoMBKICfspt8SekjeYcLiC0SN4K1hje5xOdYlYlTRxSrdzyi', 'Administrator', 'admin@vntl.com', 'ROLE_ADMIN');