package dev.huggo.vntl_backend.service;

import dev.huggo.vntl_backend.service.dto.ProfessionalRequest;
import dev.huggo.vntl_backend.service.dto.ProfessionalResponse;
import java.util.List;

public interface ProfessionalService {
    ProfessionalResponse create(ProfessionalRequest request);
    ProfessionalResponse update(Long id, ProfessionalRequest request);
    ProfessionalResponse getById(Long id);
    List<ProfessionalResponse> listAll();
    void delete(Long id);
    List<Long> listPatientIds(Long professionalId);
    void assignPatient(Long professionalId, Long patientId);
    void unassignPatient(Long professionalId, Long patientId);
}
