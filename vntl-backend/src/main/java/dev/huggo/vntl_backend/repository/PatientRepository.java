package dev.huggo.vntl_backend.repository;

import dev.huggo.vntl_backend.domain.ContractType;
import dev.huggo.vntl_backend.domain.Patient;
import dev.huggo.vntl_backend.domain.PatientStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByCpf(String cpf);

    Page<Patient> findByStatus(PatientStatus status, Pageable pageable);

    Page<Patient> findByContractType(ContractType contractType, Pageable pageable);

    List<Patient> findByProfessionalResponsibleId(Long professionalId);

    Optional<Patient> findByDeviceId(Long deviceId);
}
