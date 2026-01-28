package dev.huggo.vntl_backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "visits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "professional_id", nullable = false)
    private Long professionalId;

    @Column(name = "device_id")
    private Long deviceId;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name = "date_time_concluida")
    private LocalDateTime dateTimeConcluida;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private VisitStatus status;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    @Enumerated(EnumType.STRING)
    @Column(name = "visit_type", nullable = false, length = 50)
    private VisitType visitType;

    @Column(name = "next_visit")
    private LocalDate nextVisit;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

