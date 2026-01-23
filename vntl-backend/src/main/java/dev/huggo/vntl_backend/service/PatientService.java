package dev.huggo.vntl_backend.service;

import dev.huggo.vntl_backend.service.dto.PatientRequest;
import dev.huggo.vntl_backend.service.dto.PatientResponse;
import java.time.LocalDate;
import java.util.List;

public interface PatientService {
    PatientResponse create(PatientRequest request);
    PatientResponse update(Long id, PatientRequest request);
    PatientResponse getById(Long id);
    List<PatientResponse> listAll(String status);
    void delete(Long id);
    PatientResponse updateLastVisit(Long id, LocalDate lastVisitDate);
}
