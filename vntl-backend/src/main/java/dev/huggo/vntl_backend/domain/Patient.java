package dev.huggo.vntl_backend.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "patients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "devices")
@ToString(exclude = "devices")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;

    @NotBlank
    @Column(name = "cpf", unique = true, nullable = false, length = 14)
    private String cpf;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "secondary_phone", length = 20)
    private String secondaryPhone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "address_street")
    private String addressStreet;

    @Column(name = "address_number", length = 20)
    private String addressNumber;

    @Column(name = "address_complement", length = 100)
    private String addressComplement;

    @Column(name = "address_neighborhood", length = 100)
    private String addressNeighborhood;

    @Column(name = "address_city", length = 100)
    private String addressCity;

    @Column(name = "address_state", length = 2)
    private String addressState;

    @Column(name = "address_zip_code", length = 10)
    private String addressZipCode;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", nullable = false, length = 50)
    private ContractType contractType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private PatientStatus status;

    @NotNull
    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate;

    @Column(name = "last_visit_date")
    private LocalDate lastVisitDate;

    @Column(name = "next_visit_date")
    private LocalDate nextVisitDate;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "patient_devices",
            joinColumns = @JoinColumn(name = "patient_id"),
            inverseJoinColumns = @JoinColumn(name = "device_id"))
    @Builder.Default
    private Set<Device> devices = new HashSet<>();

    @Column(name = "professional_responsible_id")
    private Long professionalResponsibleId;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observations;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
