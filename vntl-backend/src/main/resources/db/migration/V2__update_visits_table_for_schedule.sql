-- Atualiza a tabela de visitas para suportar o novo modelo de agendamento

-- Garante a existência das colunas necessárias
ALTER TABLE visits
    ADD COLUMN IF NOT EXISTS device_id BIGINT,
    ADD COLUMN IF NOT EXISTS date_time_schedule TIMESTAMP,
    ADD COLUMN IF NOT EXISTS date_time_concluida TIMESTAMP,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS next_visit TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Ajusta o tipo e o conjunto de valores permitidos para o tipo de visita
ALTER TABLE visits
    ALTER COLUMN visit_type TYPE VARCHAR(50);

ALTER TABLE visits
    DROP CONSTRAINT IF EXISTS visits_visit_type_check;

ALTER TABLE visits
    ADD CONSTRAINT visits_visit_type_check
        CHECK (visit_type IN ('VERIFICACAO', 'MANUTENCAO', 'TROCA', 'INSTALACAO'));

-- Adiciona restrição para status de visita
ALTER TABLE visits
    DROP CONSTRAINT IF EXISTS visits_status_check;

ALTER TABLE visits
    ADD CONSTRAINT visits_status_check
        CHECK (status IN ('AGENDADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'REMARCADA'));

-- Relacionamento opcional com aparelhos
ALTER TABLE visits
    ADD CONSTRAINT fk_visits_device
        FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL;

-- Índices auxiliares para performance de consultas
CREATE INDEX IF NOT EXISTS idx_visits_schedule ON visits(date_time_schedule);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);

