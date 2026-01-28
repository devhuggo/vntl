package dev.huggo.vntl_backend.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;

@Data
public class VisitRequest {

    @NotNull
    @JsonProperty("pacienteId")
    private Long patientId;

    @NotNull
    @JsonProperty("profissionalId")
    private Long professionalId;

    @JsonProperty("aparelhoId")
    private Long deviceId;

    @NotNull
    @JsonProperty("dataVisita")
    private LocalDate visitDate;

    @NotNull
    @JsonProperty("status")
    private String status;

    @JsonProperty("observacoes")
    private String observations;

    @NotNull
    @JsonProperty("tipoVisita")
    private String visitType;

    @JsonProperty("proximaVisita")
    private LocalDate nextVisit;
}

