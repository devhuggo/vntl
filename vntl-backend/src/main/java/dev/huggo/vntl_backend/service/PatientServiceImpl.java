package dev.huggo.vntl_backend.service;

import dev.huggo.vntl_backend.domain.ContractType;
import dev.huggo.vntl_backend.domain.DeviceStatus;
import dev.huggo.vntl_backend.domain.Patient;
import dev.huggo.vntl_backend.domain.PatientStatus;
import dev.huggo.vntl_backend.repository.DeviceRepository;
import dev.huggo.vntl_backend.repository.PatientRepository;
import dev.huggo.vntl_backend.service.dto.PatientRequest;
import dev.huggo.vntl_backend.service.dto.PatientResponse;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final DeviceRepository deviceRepository;

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

        Long previousDeviceId = patient.getDeviceId();
        Long newDeviceId = request.getDeviceId();

        applyRequestToEntity(request, patient);
        Patient saved = patientRepository.save(patient);

        // Atualiza o status do aparelho de acordo com a nova vinculação
        updateDeviceAssociation(previousDeviceId, newDeviceId);
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
        List<Object[]> patientIdsWithNames;
        
        if (status == null || status.isBlank()) {
            patientIdsWithNames = patientRepository.findAllPatientIdsWithProfessionalNames();
        } else {
            PatientStatus parsedStatus = PatientStatus.valueOf(status.toUpperCase(Locale.ROOT));
            patientIdsWithNames = patientRepository.findPatientIdsWithProfessionalNamesByStatus(parsedStatus.name());
        }

        // Criar mapas de patientId -> professionalName e patientId -> deviceType
        Map<Long, String> professionalNamesMap = new HashMap<>();
        Map<Long, String> deviceTypesMap = new HashMap<>();
        List<Long> patientIds = patientIdsWithNames.stream()
                .map(result -> {
                    Long patientId = ((Number) result[0]).longValue();
                    String professionalName = result[1] != null ? (String) result[1] : null;
                    String deviceType = result[2] != null ? (String) result[2] : null;
                    professionalNamesMap.put(patientId, professionalName);
                    deviceTypesMap.put(patientId, deviceType);
                    return patientId;
                })
                .collect(Collectors.toList());

        // Buscar todos os pacientes em uma única query (batch)
        List<Patient> patients = patientRepository.findAllById(patientIds);

        // Mapear pacientes para responses com os nomes dos profissionais e tipos dos equipamentos
        return patients.stream()
                .map(patient -> {
                    String professionalName = professionalNamesMap.get(patient.getId());
                    String deviceType = deviceTypesMap.get(patient.getId());
                    return toResponse(patient, professionalName, deviceType);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        // Se o paciente possui um aparelho vinculado, devolve-o para o estoque
        if (patient.getDeviceId() != null) {
            updateDeviceAssociation(patient.getDeviceId(), null);
        }

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

    /**
     * Atualiza o status dos aparelhos ao alterar o vínculo com o paciente.
     *
     * - Se {@code previousDeviceId} não for nulo e for diferente de {@code newDeviceId},
     *   o aparelho anterior volta para o status ESTOQUE.
     * - Se {@code newDeviceId} não for nulo e for diferente de {@code previousDeviceId},
     *   o novo aparelho passa para o status EM_USO.
     */
    private void updateDeviceAssociation(Long previousDeviceId, Long newDeviceId) {
        if (previousDeviceId != null && !previousDeviceId.equals(newDeviceId)) {
            deviceRepository.findById(previousDeviceId)
                    .ifPresent(device -> {
                        device.setStatus(DeviceStatus.ESTOQUE);
                        deviceRepository.save(device);
                    });
        }

        if (newDeviceId != null && !newDeviceId.equals(previousDeviceId)) {
            deviceRepository.findById(newDeviceId)
                    .ifPresent(device -> {
                        device.setStatus(DeviceStatus.EM_USO);
                        deviceRepository.save(device);
                    });
        }
    }

    private PatientResponse toResponse(Patient patient) {
        return toResponse(patient, null, null);
    }

    private PatientResponse toResponse(Patient patient, String professionalName, String deviceType) {
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
                .deviceType(deviceType)
                .professionalResponsibleId(patient.getProfessionalResponsibleId())
                .professionalResponsibleName(professionalName)
                .observations(patient.getObservations())
                .build();
    }
}
