package dev.huggo.vntl_backend.service;

import dev.huggo.vntl_backend.domain.ContractType;
import dev.huggo.vntl_backend.domain.Device;
import dev.huggo.vntl_backend.domain.DeviceStatus;
import dev.huggo.vntl_backend.domain.Patient;
import dev.huggo.vntl_backend.domain.PatientStatus;
import dev.huggo.vntl_backend.domain.Professional;
import dev.huggo.vntl_backend.repository.DeviceRepository;
import dev.huggo.vntl_backend.repository.PatientRepository;
import dev.huggo.vntl_backend.repository.ProfessionalRepository;
import dev.huggo.vntl_backend.service.dto.PatientDeviceItem;
import dev.huggo.vntl_backend.service.dto.PatientRequest;
import dev.huggo.vntl_backend.service.dto.PatientResponse;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
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
    private final ProfessionalRepository professionalRepository;

    @Override
    @Transactional
    public PatientResponse create(PatientRequest request) {
        Patient patient = new Patient();
        applyRequestToEntity(request, patient);
        patient.setRegistrationDate(LocalDate.now());

        try {
            Patient saved = patientRepository.save(patient);
            syncPatientDevices(saved, request.getDeviceIds());
            Patient reloaded = patientRepository.findByIdWithDevices(saved.getId()).orElse(saved);
            log.info("Created patient id={}", reloaded.getId());
            return toResponse(reloaded);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("CPF already exists");
        }
    }

    @Override
    @Transactional
    public PatientResponse update(Long id, PatientRequest request) {
        Patient patient = patientRepository.findByIdWithDevices(id).orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        patientRepository.findByCpf(request.getCpf())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> {
                    throw new IllegalArgumentException("CPF already exists");
                });

        applyRequestToEntity(request, patient);
        patientRepository.save(patient);
        syncPatientDevices(patient, request.getDeviceIds());
        patientRepository.save(patient);
        log.info("Updated patient id={}", patient.getId());
        return toResponse(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getById(Long id) {
        Patient patient = patientRepository.findByIdWithDevices(id).orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        return toResponse(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponse> listAll(String tipoContrato, String bairro) {
        ContractType contractTypeParam = null;
        if (tipoContrato != null && !tipoContrato.isBlank()) {
            contractTypeParam = ContractType.valueOf(tipoContrato.trim().toUpperCase(Locale.ROOT));
        }

        String neighborhoodExact = null;
        if (bairro != null && !bairro.isBlank()) {
            neighborhoodExact = bairro.trim();
        }

        List<Patient> patients = patientRepository.findAllWithDevicesFiltered(contractTypeParam, neighborhoodExact);
        patients.sort(Comparator.comparing(Patient::getId));

        Set<Long> profIds = patients.stream()
                .map(Patient::getProfessionalResponsibleId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, String> profNames = professionalRepository.findAllById(profIds).stream()
                .collect(Collectors.toMap(Professional::getId, Professional::getName));

        return patients.stream()
                .map(p -> toResponse(p, profNames.get(p.getProfessionalResponsibleId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> listDistinctNeighborhoods() {
        return patientRepository.findDistinctNeighborhoodsTrimmed();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Patient patient = patientRepository.findByIdWithDevices(id).orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        syncPatientDevices(patient, List.of());
        patientRepository.save(patient);
        patientRepository.delete(patient);
        log.info("Deleted patient id={}", id);
    }

    @Override
    @Transactional
    public PatientResponse updateLastVisit(Long id, LocalDate lastVisitDate) {
        Patient patient = patientRepository.findByIdWithDevices(id).orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        patient.setLastVisitDate(lastVisitDate);
        patientRepository.save(patient);
        return toResponse(patient);
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
        patient.setProfessionalResponsibleId(request.getProfessionalResponsibleId());
        patient.setObservations(request.getObservations());
    }

    private void syncPatientDevices(Patient patient, List<Long> requestedIds) {
        Set<Long> wanted = requestedIds == null
                ? Set.of()
                : new LinkedHashSet<>(requestedIds.stream().filter(Objects::nonNull).toList());

        Set<Device> currentCopy = new HashSet<>(patient.getDevices());
        for (Device d : currentCopy) {
            if (!wanted.contains(d.getId())) {
                patient.getDevices().remove(d);
                d.setStatus(DeviceStatus.ESTOQUE);
                deviceRepository.save(d);
            }
        }

        for (Long deviceId : wanted) {
            boolean already = patient.getDevices().stream().anyMatch(dev -> dev.getId().equals(deviceId));
            if (!already) {
                Optional<Long> ownerPatientId = patientRepository.findPatientIdOwningDevice(deviceId);
                if (ownerPatientId.isPresent() && !ownerPatientId.get().equals(patient.getId())) {
                    throw new IllegalArgumentException("Device already assigned to another patient");
                }
                Device device = deviceRepository
                        .findById(deviceId)
                        .orElseThrow(() -> new IllegalArgumentException("Device not found: " + deviceId));
                patient.getDevices().add(device);
                device.setStatus(DeviceStatus.EM_USO);
                deviceRepository.save(device);
            }
        }
    }

    private PatientResponse toResponse(Patient patient) {
        return toResponse(patient, resolveProfessionalName(patient.getProfessionalResponsibleId()));
    }

    private PatientResponse toResponse(Patient patient, String professionalName) {
        List<PatientDeviceItem> aparelhos = new ArrayList<>();
        if (patient.getDevices() != null) {
            aparelhos = patient.getDevices().stream()
                    .sorted(Comparator.comparing(Device::getId))
                    .map(d -> PatientDeviceItem.builder()
                            .id(d.getId())
                            .type(d.getType())
                            .assetNumber(d.getAssetNumber())
                            .build())
                    .collect(Collectors.toList());
        }
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
                .devices(aparelhos)
                .professionalResponsibleId(patient.getProfessionalResponsibleId())
                .professionalResponsibleName(professionalName)
                .observations(patient.getObservations())
                .build();
    }

    private String resolveProfessionalName(Long id) {
        if (id == null) {
            return null;
        }
        return professionalRepository.findById(id).map(Professional::getName).orElse(null);
    }
}
