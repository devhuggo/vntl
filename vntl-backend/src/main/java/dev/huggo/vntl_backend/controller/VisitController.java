package dev.huggo.vntl_backend.controller;

import dev.huggo.vntl_backend.service.VisitService;
import dev.huggo.vntl_backend.service.dto.VisitRequest;
import dev.huggo.vntl_backend.service.dto.VisitResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<VisitResponse> create(@Valid @RequestBody VisitRequest request) {
        VisitResponse response = visitService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<VisitResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody VisitRequest request) {
        return ResponseEntity.ok(visitService.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VisitResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(visitService.getById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        visitService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Busca genérica de visitas com filtros variados
     */
    @GetMapping
    public ResponseEntity<List<VisitResponse>> search(
            @RequestParam(value = "pacienteId", required = false) Long patientId,
            @RequestParam(value = "profissionalId", required = false) Long professionalId,
            @RequestParam(value = "aparelhoId", required = false) Long deviceId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "tipoVisita", required = false) String visitType,
            @RequestParam(value = "inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(value = "fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(value = "dataVisitaDe", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataVisitaDe,
            @RequestParam(value = "dataVisitaAte", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataVisitaAte) {

        return ResponseEntity.ok(visitService.search(
                patientId,
                professionalId,
                deviceId,
                status,
                visitType,
                start,
                end,
                dataVisitaDe,
                dataVisitaAte));
    }

    /**
     * Agenda / calendário por data
     */
    @GetMapping("/by-date")
    public ResponseEntity<List<VisitResponse>> listByDate(
            @RequestParam("data")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(visitService.listByDate(date));
    }

    @GetMapping("/by-range")
    public ResponseEntity<List<VisitResponse>> listByDateRange(
            @RequestParam("inicio")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("fim")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(visitService.listByDateRange(startDate, endDate));
    }

    @GetMapping("/professional/{professionalId}/agenda")
    public ResponseEntity<List<VisitResponse>> professionalAgenda(
            @PathVariable Long professionalId,
            @RequestParam("inicio")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("fim")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(visitService.listByProfessionalSchedule(professionalId, startDate, endDate));
    }

    /**
     * Histórico de visitas
     */
    @GetMapping("/history/patient/{patientId}")
    public ResponseEntity<List<VisitResponse>> historyByPatient(
            @PathVariable Long patientId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "tipoVisita", required = false) String visitType,
            @RequestParam(value = "inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(visitService.historyByPatient(patientId, status, visitType, startDate, endDate));
    }

    @GetMapping("/history/device/{deviceId}")
    public ResponseEntity<List<VisitResponse>> historyByDevice(
            @PathVariable Long deviceId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "tipoVisita", required = false) String visitType,
            @RequestParam(value = "inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(visitService.historyByDevice(deviceId, status, visitType, startDate, endDate));
    }

    @GetMapping("/history/professional/{professionalId}")
    public ResponseEntity<List<VisitResponse>> historyByProfessional(
            @PathVariable Long professionalId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "tipoVisita", required = false) String visitType,
            @RequestParam(value = "inicio", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "fim", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(visitService.historyByProfessional(professionalId, status, visitType, startDate, endDate));
    }

    /**
     * Próximas visitas
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<VisitResponse>> upcoming(
            @RequestParam(value = "pacienteId", required = false) Long patientId,
            @RequestParam(value = "profissionalId", required = false) Long professionalId) {
        return ResponseEntity.ok(visitService.upcomingVisits(patientId, professionalId));
    }

    /**
     * Remarcação / troca de profissional
     */
    @PostMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<VisitResponse> reschedule(
            @PathVariable Long id,
            @RequestBody RescheduleRequest body) {
        return ResponseEntity.ok(visitService.reschedule(id, body.dataHoraAgendada(), body.profissionalId()));
    }

    /**
     * Cancelamento
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<VisitResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(visitService.cancel(id));
    }

    /**
     * Finalização da visita
     */
    @PostMapping("/{id}/finalize")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public ResponseEntity<VisitResponse> finalizeVisit(
            @PathVariable Long id,
            @RequestBody FinalizeRequest body) {
        return ResponseEntity.ok(visitService.finalizeVisit(id, body.observacoes(), body.criarProximaVisita()));
    }

    public record RescheduleRequest(
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime dataHoraAgendada,
            Long profissionalId) {}

    public record FinalizeRequest(
            String observacoes,
            boolean criarProximaVisita) {}
}

