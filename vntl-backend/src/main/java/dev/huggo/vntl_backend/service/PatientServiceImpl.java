package dev.huggo.vntl_backend.service;

import dev.huggo.vntl_backend.domain.ContractType;
import dev.huggo.vntl_backend.domain.Patient;
import dev.huggo.vntl_backend.domain.PatientStatus;
import dev.huggo.vntl_backend.repository.PatientRepository;
import dev.huggo.vntl_backend.service.dto.PatientRequest;
import dev.huggo.vntl_backend.service.dto.PatientResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Override
    @Transactional
    public PatientResponse create(PatientRequest request) {
        Patient patient = new Patient();
        applyRequestToEntity(request, patient);
        patient.setRegistrationDate(LocalDate.now());

        try {
            Patient saved = patientRepository.save(patient);
            log.info("Created patient id={}", saved.getId());
            return toResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("CPF already exists");
        }
    }

    @Override
    @Transactional
    public PatientResponse update(Long id, PatientRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        // Check CPF uniqueness
        patientRepository.findByCpf(request.getCpf())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> {
                    throw new IllegalArgumentException("CPF already exists");
                });

        applyRequestToEntity(request, patient);
        Patient saved = patientRepository.save(patient);
        log.info("Updated patient id={}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getById(Long id) {
        return patientRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponse> listAll(String status) {
        if (status == null || status.isBlank()) {
            return patientRepository.findAll().stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        PatientStatus parsedStatus = PatientStatus.valueOf(status.toUpperCase(Locale.ROOT));
        return patientRepository.findByStatus(parsedStatus, PageRequest.of(0, Integer.MAX_VALUE))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        patientRepository.delete(patient);
        log.info("Deleted patient id={}", id);
    }

    @Override
    @Transactional
    public PatientResponse updateLastVisit(Long id, LocalDate lastVisitDate) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        patient.setLastVisitDate(lastVisitDate);
        Patient saved = patientRepository.save(patient);
        return toResponse(saved);
    }

    private void applyRequestToEntity(PatientRequest request, Patient patient) {
        patient.setName(request.getName());
        patient.setCpf(request.getCpf());
        patient.setBirthDate(request.getBirthDate());
        patient.setPhone(request.getPhone());
        patient.setSecondaryPhone(request.getSecondaryPhone());
        patient.setEmail(request.getEmail());
        patient.setAddressStreet(request.getAddressStreet());
        patient.setAddressNumber(request.getAddressNumber());
        patient.setAddressComplement(request.getAddressComplement());
        patient.setAddressNeighborhood(request.getAddressNeighborhood());
        patient.setAddressCity(request.getAddressCity());
        patient.setAddressState(request.getAddressState());
        patient.setAddressZipCode(request.getAddressZipCode());
        patient.setContractType(ContractType.valueOf(request.getContractType()));
        patient.setStatus(PatientStatus.valueOf(request.getStatus()));
        patient.setNextVisitDate(request.getNextVisitDate());
        patient.setDeviceId(request.getDeviceId());
        patient.setProfessionalResponsibleId(request.getProfessionalResponsibleId());
        patient.setObservations(request.getObservations());
    }

    private PatientResponse toResponse(Patient patient) {
        return PatientResponse.builder()
                .id(patient.getId())
                .name(patient.getName())
                .cpf(patient.getCpf())
                .birthDate(patient.getBirthDate())
                .phone(patient.getPhone())
                .secondaryPhone(patient.getSecondaryPhone())
                .email(patient.getEmail())
                .addressStreet(patient.getAddressStreet())
                .addressNumber(patient.getAddressNumber())
                .addressComplement(patient.getAddressComplement())
                .addressNeighborhood(patient.getAddressNeighborhood())
                .addressCity(patient.getAddressCity())
                .addressState(patient.getAddressState())
                .addressZipCode(patient.getAddressZipCode())
                .contractType(patient.getContractType().name())
                .status(patient.getStatus().name())
                .registrationDate(patient.getRegistrationDate())
                .lastVisitDate(patient.getLastVisitDate())
                .nextVisitDate(patient.getNextVisitDate())
                .deviceId(patient.getDeviceId())
                .professionalResponsibleId(patient.getProfessionalResponsibleId())
                .observations(patient.getObservations())
                .build();
    }
}
