package dev.huggo.vntl_backend.service;

import dev.huggo.vntl_backend.service.dto.VisitRequest;
import dev.huggo.vntl_backend.service.dto.VisitResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface VisitService {

    VisitResponse create(VisitRequest request);

    VisitResponse update(Long id, VisitRequest request);

    VisitResponse getById(Long id);

    void delete(Long id);

    List<VisitResponse> search(
            Long patientId,
            Long professionalId,
            Long deviceId,
            String status,
            String visitType,
            LocalDateTime start,
            LocalDateTime end,
            LocalDate dataVisitaDe,
            LocalDate dataVisitaAte);

    List<VisitResponse> listByDate(LocalDate date);

    List<VisitResponse> listByDateRange(LocalDate startDate, LocalDate endDate);

    List<VisitResponse> listByProfessionalSchedule(Long professionalId, LocalDate startDate, LocalDate endDate);

    List<VisitResponse> historyByPatient(Long patientId, String status, String visitType, LocalDate startDate, LocalDate endDate);

    List<VisitResponse> historyByDevice(Long deviceId, String status, String visitType, LocalDate startDate, LocalDate endDate);

    List<VisitResponse> historyByProfessional(Long professionalId, String status, String visitType, LocalDate startDate, LocalDate endDate);

    List<VisitResponse> upcomingVisits(Long patientId, Long professionalId);

    VisitResponse reschedule(Long id, LocalDateTime newDateTime, Long newProfessionalId);

    VisitResponse cancel(Long id);

    VisitResponse finalizeVisit(Long id, String observations, boolean createNextVisit);
}

