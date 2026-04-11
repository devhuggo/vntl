package dev.huggo.vntl_backend.repository;

import dev.huggo.vntl_backend.domain.Visit;
import dev.huggo.vntl_backend.domain.VisitStatus;
import dev.huggo.vntl_backend.domain.VisitType;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {

    List<Visit> findByPatientId(Long patientId);

    List<Visit> findByProfessionalId(Long professionalId);

    List<Visit> findByDeviceId(Long deviceId);

    List<Visit> findByStatus(VisitStatus status);

    List<Visit> findByVisitType(VisitType visitType);

    List<Visit> findByVisitDateBetween(LocalDate start, LocalDate end);

    List<Visit> findByProfessionalIdAndVisitDateBetween(Long professionalId, LocalDate start, LocalDate end);

    @Query(
            "SELECT v FROM Visit v "
                    + "WHERE (:patientId IS NULL OR v.patientId = :patientId) "
                    + "AND (:professionalId IS NULL OR v.professionalId = :professionalId) "
                    + "AND (:deviceId IS NULL OR v.deviceId = :deviceId) "
                    + "AND (:status IS NULL OR v.status = :status) "
                    + "AND (:visitType IS NULL OR v.visitType = :visitType) "
                    + "AND (:visitFrom IS NULL OR v.visitDate >= :visitFrom) "
                    + "AND (:visitTo IS NULL OR v.visitDate <= :visitTo)")
    List<Visit> search(
            @Param("patientId") Long patientId,
            @Param("professionalId") Long professionalId,
            @Param("deviceId") Long deviceId,
            @Param("status") VisitStatus status,
            @Param("visitType") VisitType visitType,
            @Param("visitFrom") LocalDate visitFrom,
            @Param("visitTo") LocalDate visitTo);

    boolean existsByProfessionalIdAndStatusInAndVisitDate(
            Long professionalId,
            List<VisitStatus> statuses,
            LocalDate visitDate);
}

