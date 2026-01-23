package dev.huggo.vntl_backend.service;

import dev.huggo.vntl_backend.domain.Professional;
import dev.huggo.vntl_backend.repository.PatientRepository;
import dev.huggo.vntl_backend.repository.ProfessionalRepository;
import dev.huggo.vntl_backend.service.dto.ProfessionalRequest;
import dev.huggo.vntl_backend.service.dto.ProfessionalResponse;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfessionalServiceImpl implements ProfessionalService {

    private final ProfessionalRepository professionalRepository;
    private final PatientRepository patientRepository;

    @Override
    @Transactional
    public ProfessionalResponse create(ProfessionalRequest request) {
        Professional professional = new Professional();
        apply(request, professional);
        try {
            Professional saved = professionalRepository.save(professional);
            log.info("Created professional id={}", saved.getId());
            return toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("CPF already exists");
        }
    }

    @Override
    @Transactional
    public ProfessionalResponse update(Long id, ProfessionalRequest request) {
        Professional professional = professionalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Professional not found"));

        professionalRepository.findByCpf(request.getCpf())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> { throw new IllegalArgumentException("CPF already exists"); });

        apply(request, professional);
        Professional saved = professionalRepository.save(professional);
        log.info("Updated professional id={}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfessionalResponse getById(Long id) {
        Professional professional = professionalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Professional not found"));
        return toResponse(professional);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfessionalResponse> listAll() {
        return professionalRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Professional professional = professionalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Professional not found"));

        // Unassign patients linked to this professional
        patientRepository.findByProfessionalResponsibleId(id)
                .forEach(p -> p.setProfessionalResponsibleId(null));

        professionalRepository.delete(professional);
        log.info("Deleted professional id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> listPatientIds(Long professionalId) {
        return patientRepository.findByProfessionalResponsibleId(professionalId).stream()
                .map(p -> p.getId())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void assignPatient(Long professionalId, Long patientId) {
        professionalRepository.findById(professionalId)
                .orElseThrow(() -> new IllegalArgumentException("Professional not found"));

        var patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        patient.setProfessionalResponsibleId(professionalId);
    }

    @Override
    @Transactional
    public void unassignPatient(Long professionalId, Long patientId) {
        var patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        if (professionalId.equals(patient.getProfessionalResponsibleId())) {
            patient.setProfessionalResponsibleId(null);
        }
    }

    private void apply(ProfessionalRequest request, Professional professional) {
        professional.setName(request.getName());
        professional.setCpf(request.getCpf());
        professional.setPhone(request.getPhone());
        professional.setSecondaryPhone(request.getSecondaryPhone());
        professional.setEmail(request.getEmail());
        professional.setActive(request.getActive());
        professional.setObservations(request.getObservations());
    }

    private ProfessionalResponse toResponse(Professional professional) {
        var patients = patientRepository.findByProfessionalResponsibleId(professional.getId());
        return ProfessionalResponse.builder()
                .id(professional.getId())
                .name(professional.getName())
                .cpf(professional.getCpf())
                .phone(professional.getPhone())
                .secondaryPhone(professional.getSecondaryPhone())
                .email(professional.getEmail())
                .patientIds(patients.stream().map(p -> p.getId()).toList())
                .patientsCount(patients.size())
                .createdAt(professional.getCreatedAt())
                .active(professional.getActive())
                .observations(professional.getObservations())
                .build();
    }
}
