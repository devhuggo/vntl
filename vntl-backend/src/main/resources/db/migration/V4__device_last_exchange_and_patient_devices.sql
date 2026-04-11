-- Última troca do aparelho (lista / formulário de devices)
ALTER TABLE devices
    ADD COLUMN last_exchange_date DATE;

-- Paciente com vários aparelhos; cada aparelho no máximo em um paciente.
CREATE TABLE patient_devices (
    patient_id BIGINT NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    device_id  BIGINT NOT NULL REFERENCES devices (id) ON DELETE CASCADE,
    PRIMARY KEY (patient_id, device_id),
    CONSTRAINT uq_patient_devices_device UNIQUE (device_id)
);

INSERT INTO patient_devices (patient_id, device_id)
SELECT id, device_id
FROM patients
WHERE device_id IS NOT NULL;

ALTER TABLE patients
    DROP CONSTRAINT IF EXISTS patients_device_id_fkey;

ALTER TABLE patients
    DROP COLUMN IF EXISTS device_id;
