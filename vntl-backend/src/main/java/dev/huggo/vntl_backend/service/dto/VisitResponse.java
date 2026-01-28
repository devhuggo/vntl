package dev.huggo.vntl_backend.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class VisitResponse {

    @JsonProperty("id")
    Long id;

    @JsonProperty("pacienteId")
    Long patientId;

    @JsonProperty("pacienteNome")
    String patientName;

    @JsonProperty("profissionalId")
    Long professionalId;

    @JsonProperty("profissionalNome")
    String professionalName;

    @JsonProperty("aparelhoId")
    Long deviceId;

    @JsonProperty("aparelhoNumeroPatrimonio")
    String deviceAssetNumber;

    @JsonProperty("dataVisita")
    LocalDate visitDate;

    @JsonProperty("dataHoraConcluida")
    LocalDateTime dateTimeConcluida;

    @JsonProperty("status")
    String status;

    @JsonProperty("observacoes")
    String observations;

    @JsonProperty("tipoVisita")
    String visitType;

    @JsonProperty("proximaVisita")
    LocalDate nextVisit;

    @JsonProperty("criadoEm")
    LocalDateTime createdAt;

    @JsonProperty("atualizadoEm")
    LocalDateTime updatedAt;
}

