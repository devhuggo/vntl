package dev.huggo.vntl_backend.repository;

import dev.huggo.vntl_backend.domain.ContractType;
import dev.huggo.vntl_backend.domain.Patient;
import dev.huggo.vntl_backend.domain.PatientStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByCpf(String cpf);

    Page<Patient> findByStatus(PatientStatus status, Pageable pageable);

    Page<Patient> findByContractType(ContractType contractType, Pageable pageable);

    List<Patient> findByProfessionalResponsibleId(Long professionalId);

    Optional<Patient> findByDeviceId(Long deviceId);

    /**
     * Query otimizada que retorna o ID do paciente, nome do profissional responsável e tipo do equipamento
     * usando LEFT JOIN para evitar N+1 queries.
     * Retorna um array onde [0] = patientId (Long), [1] = professionalName (String), [2] = deviceType (String).
     */
    @Query(value = "SELECT p.id, pr.name, d.type " +
            "FROM patients p " +
            "LEFT JOIN professionals pr ON p.professional_responsible_id = pr.id " +
            "LEFT JOIN devices d ON p.device_id = d.id",
            nativeQuery = true)
    List<Object[]> findAllPatientIdsWithProfessionalNames();

    /**
     * Query otimizada que retorna o ID do paciente, nome do profissional responsável e tipo do equipamento
     * filtrados por status usando LEFT JOIN para evitar N+1 queries.
     * Retorna um array onde [0] = patientId (Long), [1] = professionalName (String), [2] = deviceType (String).
     */
    @Query(value = "SELECT p.id, pr.name, d.type " +
            "FROM patients p " +
            "LEFT JOIN professionals pr ON p.professional_responsible_id = pr.id " +
            "LEFT JOIN devices d ON p.device_id = d.id " +
            "WHERE p.status = :status",
            nativeQuery = true)
    List<Object[]> findPatientIdsWithProfessionalNamesByStatus(@Param("status") String status);
}
