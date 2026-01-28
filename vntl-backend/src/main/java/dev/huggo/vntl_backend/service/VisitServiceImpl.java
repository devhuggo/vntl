package dev.huggo.vntl_backend.service;

import dev.huggo.vntl_backend.domain.Patient;
import dev.huggo.vntl_backend.domain.PatientStatus;
import dev.huggo.vntl_backend.domain.Visit;
import dev.huggo.vntl_backend.domain.VisitStatus;
import dev.huggo.vntl_backend.domain.VisitType;
import dev.huggo.vntl_backend.repository.DeviceRepository;
import dev.huggo.vntl_backend.repository.PatientRepository;
import dev.huggo.vntl_backend.repository.ProfessionalRepository;
import dev.huggo.vntl_backend.repository.VisitRepository;
import dev.huggo.vntl_backend.service.dto.VisitRequest;
import dev.huggo.vntl_backend.service.dto.VisitResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisitServiceImpl implements VisitService {

    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final ProfessionalRepository professionalRepository;
    private final DeviceRepository deviceRepository;

    private static final EnumSet<VisitStatus> ACTIVE_STATUSES =
            EnumSet.of(VisitStatus.AGENDADA, VisitStatus.CONFIRMADA, VisitStatus.REMARCADA);

    @Override
    @Transactional
    public VisitResponse create(VisitRequest request) {
        validateRequestAndReferences(request);
        validateScheduleNotInPast(request.getVisitDate());
        ensureNoScheduleConflict(null, request.getProfessionalId(), request.getVisitDate());

        Visit visit = new Visit();
        applyRequestToEntity(request, visit);

        if (visit.getStatus() == null) {
            visit.setStatus(VisitStatus.AGENDADA);
        }

        Visit saved = visitRepository.save(visit);
        log.info("Created visit id={}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public VisitResponse update(Long id, VisitRequest request) {
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found"));

        validateRequestAndReferences(request);
        validateScheduleNotInPast(request.getVisitDate());
        ensureNoScheduleConflict(id, request.getProfessionalId(), request.getVisitDate());

        applyRequestToEntity(request, visit);
        Visit saved = visitRepository.save(visit);
        log.info("Updated visit id={}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public VisitResponse getById(Long id) {
        return visitRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found"));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!visitRepository.existsById(id)) {
            throw new IllegalArgumentException("Visit not found");
        }
        visitRepository.deleteById(id);
        log.info("Deleted visit id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitResponse> search(
            Long patientId,
            Long professionalId,
            Long deviceId,
            String status,
            String visitType,
            LocalDateTime start,
            LocalDateTime end) {

        VisitStatus statusEnum = parseStatus(status).orElse(null);
        VisitType typeEnum = parseType(visitType).orElse(null);

        List<Visit> visits = visitRepository.search(
                patientId,
                professionalId,
                deviceId,
                statusEnum,
                typeEnum
        );

        LocalDateTime startDateTime = start;
        LocalDateTime endDateTime = end;

        return visits.stream()
                .filter(v -> {
                    if (startDateTime != null && v.getVisitDate().atStartOfDay().isBefore(startDateTime)) {
                        return false;
                    }
                    if (endDateTime != null && v.getVisitDate().atTime(LocalTime.MAX).isAfter(endDateTime)) {
                        return false;
                    }
                    return true;
                })
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitResponse> listByDate(LocalDate date) {
        return visitRepository.findByVisitDateBetween(date, date)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitResponse> listByDateRange(LocalDate startDate, LocalDate endDate) {
        return visitRepository.findByVisitDateBetween(startDate, endDate)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitResponse> listByProfessionalSchedule(Long professionalId, LocalDate startDate, LocalDate endDate) {
        return visitRepository.findByProfessionalIdAndVisitDateBetween(professionalId, startDate, endDate)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitResponse> historyByPatient(Long patientId, String status, String visitType, LocalDate startDate, LocalDate endDate) {
        List<Visit> visits = visitRepository.findByPatientId(patientId);
        return filterHistory(visits, status, visitType, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitResponse> historyByDevice(Long deviceId, String status, String visitType, LocalDate startDate, LocalDate endDate) {
        List<Visit> visits = visitRepository.findByDeviceId(deviceId);
        return filterHistory(visits, status, visitType, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitResponse> historyByProfessional(Long professionalId, String status, String visitType, LocalDate startDate, LocalDate endDate) {
        List<Visit> visits = visitRepository.findByProfessionalId(professionalId);
        return filterHistory(visits, status, visitType, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitResponse> upcomingVisits(Long patientId, Long professionalId) {
        LocalDate today = LocalDate.now();
        List<Visit> visits;

        if (patientId != null) {
            visits = visitRepository.findByPatientId(patientId);
        } else if (professionalId != null) {
            visits = visitRepository.findByProfessionalId(professionalId);
        } else {
            visits = visitRepository.findByStatus(VisitStatus.AGENDADA);
        }

        return visits.stream()
                .filter(v -> v.getStatus() == VisitStatus.AGENDADA)
                .filter(v -> v.getVisitDate() != null && !v.getVisitDate().isBefore(today))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VisitResponse reschedule(Long id, LocalDateTime newDateTime, Long newProfessionalId) {
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found"));

        if (visit.getStatus() == VisitStatus.CANCELADA) {
            throw new IllegalStateException("Cannot reschedule a cancelled visit");
        }

        validateScheduleNotInPast(newDateTime.toLocalDate());

        Long professionalId = newProfessionalId != null ? newProfessionalId : visit.getProfessionalId();
        if (newProfessionalId != null) {
            // valida existência do novo profissional
            professionalRepository.findById(newProfessionalId)
                    .orElseThrow(() -> new IllegalArgumentException("Professional not found"));
        }

        ensureNoScheduleConflict(id, professionalId, newDateTime.toLocalDate());

        visit.setProfessionalId(professionalId);
        visit.setVisitDate(newDateTime.toLocalDate());
        visit.setStatus(VisitStatus.REMARCADA);

        Visit saved = visitRepository.save(visit);
        log.info("Rescheduled visit id={}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public VisitResponse cancel(Long id) {
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found"));

        if (visit.getStatus() == VisitStatus.REALIZADA) {
            throw new IllegalStateException("Cannot cancel a completed visit");
        }

        visit.setStatus(VisitStatus.CANCELADA);
        Visit saved = visitRepository.save(visit);
        log.info("Cancelled visit id={}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public VisitResponse finalizeVisit(Long id, String observations, boolean createNextVisit) {
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Visit not found"));

        if (visit.getStatus() == VisitStatus.CANCELADA) {
            throw new IllegalStateException("Cancelled visit cannot be finalized");
        }

        if (visit.getVisitDate().isAfter(LocalDate.now())) {
            throw new IllegalStateException("Visit scheduled in the future cannot be finalized yet");
        }

        visit.setStatus(VisitStatus.REALIZADA);
        visit.setDateTimeConcluida(LocalDateTime.now());

        if (observations != null && !observations.isBlank()) {
            visit.setObservations(observations);
        }

        Visit saved = visitRepository.save(visit);

        // Atualiza informações do paciente (última visita e próxima visita)
        patientRepository.findById(visit.getPatientId())
                .ifPresent(patient -> {
                    patient.setLastVisitDate(LocalDate.now());
                    if (createNextVisit) {
                        LocalDate nextDate = LocalDate.now().plusDays(30);
                        patient.setNextVisitDate(nextDate);
                    }
                    patientRepository.save(patient);
                });

        // Cria automaticamente uma nova visita futura, se solicitado
        if (createNextVisit) {
            Visit nextVisit = new Visit();
            nextVisit.setPatientId(visit.getPatientId());
            nextVisit.setProfessionalId(visit.getProfessionalId());
            nextVisit.setDeviceId(visit.getDeviceId());

            LocalDate nextDate = visit.getVisitDate().plusDays(30);
            validateScheduleNotInPast(nextDate);
            ensureNoScheduleConflict(null, nextVisit.getProfessionalId(), nextDate);

            nextVisit.setVisitDate(nextDate);
            nextVisit.setStatus(VisitStatus.AGENDADA);
            nextVisit.setVisitType(visit.getVisitType());
            nextVisit.setObservations("Visita automática gerada a partir da visita " + visit.getId());

            visitRepository.save(nextVisit);
            log.info("Created automatic next visit for patientId={} from visit id={}", visit.getPatientId(), visit.getId());
        }

        log.info("Finalized visit id={}", saved.getId());
        return toResponse(saved);
    }

    private void validateRequestAndReferences(VisitRequest request) {
        // Paciente deve existir e estar ativo/aguardando
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        if (patient.getStatus() == PatientStatus.INATIVO || patient.getStatus() == PatientStatus.ALTA) {
            throw new IllegalStateException("Cannot schedule visit for inactive/discharged patient");
        }

        // Profissional deve existir
        professionalRepository.findById(request.getProfessionalId())
                .orElseThrow(() -> new IllegalArgumentException("Professional not found"));

        // Aparelho (opcional) deve existir
        if (request.getDeviceId() != null) {
            deviceRepository.findById(request.getDeviceId())
                    .orElseThrow(() -> new IllegalArgumentException("Device not found"));
        }
    }

    private void validateScheduleNotInPast(LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Visit cannot be scheduled in the past");
        }
    }

    private void ensureNoScheduleConflict(Long currentVisitId, Long professionalId, LocalDate visitDate) {
        List<VisitStatus> activeStatuses = ACTIVE_STATUSES.stream().toList();

        boolean conflict = visitRepository.existsByProfessionalIdAndStatusInAndVisitDate(
                professionalId,
                activeStatuses,
                visitDate);

        if (conflict) {
            // Permite salvar quando o único conflito é a própria visita sendo atualizada
            if (currentVisitId != null) {
                Optional<Visit> sameSlot = visitRepository.findByProfessionalId(professionalId).stream()
                        .filter(v -> v.getVisitDate().equals(visitDate))
                        .filter(v -> ACTIVE_STATUSES.contains(v.getStatus()))
                        .findFirst();

                if (sameSlot.isPresent() && sameSlot.get().getId().equals(currentVisitId)) {
                    return;
                }
            }

            throw new IllegalStateException("Professional already has a visit scheduled at this time");
        }
    }

    private void applyRequestToEntity(VisitRequest request, Visit visit) {
        visit.setPatientId(request.getPatientId());
        visit.setProfessionalId(request.getProfessionalId());
        visit.setDeviceId(request.getDeviceId());
        visit.setVisitDate(request.getVisitDate());
        visit.setStatus(parseStatus(request.getStatus())
                .orElseThrow(() -> new IllegalArgumentException("Invalid visit status")));
        visit.setVisitType(parseType(request.getVisitType())
                .orElseThrow(() -> new IllegalArgumentException("Invalid visit type")));
        visit.setObservations(request.getObservations());
        visit.setNextVisit(request.getNextVisit());
    }

    private List<VisitResponse> filterHistory(
            List<Visit> visits,
            String status,
            String visitType,
            LocalDate startDate,
            LocalDate endDate) {

        VisitStatus statusEnum = parseStatus(status).orElse(null);
        VisitType typeEnum = parseType(visitType).orElse(null);

        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        return visits.stream()
                // Apenas visitas REALIZADAS entram no histórico fechado
                .filter(v -> v.getStatus() == VisitStatus.REALIZADA)
                .filter(v -> statusEnum == null || v.getStatus() == statusEnum)
                .filter(v -> typeEnum == null || v.getVisitType() == typeEnum)
                .filter(v -> {
                    LocalDateTime visitDateTime = v.getVisitDate().atStartOfDay();
                    if (start != null && visitDateTime.isBefore(start)) {
                        return false;
                    }
                    if (end != null && visitDateTime.isAfter(end)) {
                        return false;
                    }
                    return true;
                })
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private Optional<VisitStatus> parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return Optional.empty();
        }
        try {
            return Optional.of(VisitStatus.valueOf(status.toUpperCase(Locale.ROOT)));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    private Optional<VisitType> parseType(String type) {
        if (type == null || type.isBlank()) {
            return Optional.empty();
        }
        try {
            return Optional.of(VisitType.valueOf(type.toUpperCase(Locale.ROOT)));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    private VisitResponse toResponse(Visit visit) {
        String patientName = null;
        String professionalName = null;
        String deviceAssetNumber = null;

        if (visit.getPatientId() != null) {
            patientName = patientRepository.findById(visit.getPatientId())
                    .map(Patient::getName)
                    .orElse(null);
        }

        if (visit.getProfessionalId() != null) {
            professionalName = professionalRepository.findById(visit.getProfessionalId())
                    .map(p -> p.getName())
                    .orElse(null);
        }

        if (visit.getDeviceId() != null) {
            deviceAssetNumber = deviceRepository.findById(visit.getDeviceId())
                    .map(d -> d.getAssetNumber())
                    .orElse(null);
        }

        return VisitResponse.builder()
                .id(visit.getId())
                .patientId(visit.getPatientId())
                .patientName(patientName)
                .professionalId(visit.getProfessionalId())
                .professionalName(professionalName)
                .deviceId(visit.getDeviceId())
                .deviceAssetNumber(deviceAssetNumber)
                .visitDate(visit.getVisitDate())
                .dateTimeConcluida(visit.getDateTimeConcluida())
                .status(visit.getStatus() != null ? visit.getStatus().name() : null)
                .observations(visit.getObservations())
                .visitType(visit.getVisitType() != null ? visit.getVisitType().name() : null)
                .nextVisit(visit.getNextVisit())
                .createdAt(visit.getCreatedAt())
                .updatedAt(visit.getUpdatedAt())
                .build();
    }
}

