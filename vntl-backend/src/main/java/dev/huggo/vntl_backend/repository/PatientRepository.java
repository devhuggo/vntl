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

    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.devices WHERE p.id = :id")
    Optional<Patient> findByIdWithDevices(@Param("id") Long id);

    @Query(
            """
            SELECT DISTINCT p FROM Patient p LEFT JOIN FETCH p.devices
            WHERE (:contractType IS NULL OR p.contractType = :contractType)
              AND (:neighborhood IS NULL OR TRIM(p.addressNeighborhood) = :neighborhood)
            """)
    List<Patient> findAllWithDevicesFiltered(
            @Param("contractType") ContractType contractType, @Param("neighborhood") String neighborhood);

    @Query(
            value =
                    """
                    SELECT DISTINCT TRIM(address_neighborhood) AS nb
                    FROM patients
                    WHERE address_neighborhood IS NOT NULL
                      AND TRIM(address_neighborhood) <> ''
                    ORDER BY nb
                    """,
            nativeQuery = true)
    List<String> findDistinctNeighborhoodsTrimmed();

    @Query(value = "SELECT patient_id FROM patient_devices WHERE device_id = :deviceId", nativeQuery = true)
    Optional<Long> findPatientIdOwningDevice(@Param("deviceId") Long deviceId);

    @Query("SELECT p FROM Patient p JOIN p.devices d WHERE d.id = :deviceId")
    Optional<Patient> findByLinkedDeviceId(@Param("deviceId") Long deviceId);
}
