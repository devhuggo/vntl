package dev.huggo.vntl_backend.controller;

import dev.huggo.vntl_backend.service.ProfessionalService;
import dev.huggo.vntl_backend.service.dto.ProfessionalRequest;
import dev.huggo.vntl_backend.service.dto.ProfessionalResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/professionals")
@RequiredArgsConstructor
public class ProfessionalController {

    private final ProfessionalService professionalService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ProfessionalResponse> create(@Valid @RequestBody ProfessionalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(professionalService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ProfessionalResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProfessionalRequest request) {
        return ResponseEntity.ok(professionalService.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfessionalResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(professionalService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<ProfessionalResponse>> listAll() {
        return ResponseEntity.ok(professionalService.listAll());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        professionalService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/patients")
    public ResponseEntity<List<Long>> getPatients(@PathVariable Long id) {
        return ResponseEntity.ok(professionalService.listPatientIds(id));
    }

    @PostMapping("/{id}/patients")
    public ResponseEntity<Void> assignPatient(@PathVariable Long id, @RequestBody AssignPatientRequest body) {
        professionalService.assignPatient(id, body.patientId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{professionalId}/patients/{patientId}")
    public ResponseEntity<Void> unassignPatient(
            @PathVariable Long professionalId,
            @PathVariable Long patientId) {
        professionalService.unassignPatient(professionalId, patientId);
        return ResponseEntity.noContent().build();
    }

    public record AssignPatientRequest(Long patientId) {}
}
