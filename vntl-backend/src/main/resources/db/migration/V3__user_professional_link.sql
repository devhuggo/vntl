-- MVP: um usuário logado corresponde a um registro em professionals
ALTER TABLE users
    ADD COLUMN professional_id BIGINT REFERENCES professionals (id) ON DELETE SET NULL;

INSERT INTO professionals (name, cpf, phone, secondary_phone, email, active, observations)
VALUES (
    'Administrador (Profissional)',
    '52998224725',
    NULL,
    NULL,
    'admin@vntl.com',
    TRUE,
    'Registro criado para o MVP: usuário admin atua como único profissional.'
);

UPDATE users
SET professional_id = (SELECT id FROM professionals WHERE cpf = '52998224725' LIMIT 1)
WHERE username = 'admin';

CREATE INDEX idx_users_professional ON users (professional_id);
