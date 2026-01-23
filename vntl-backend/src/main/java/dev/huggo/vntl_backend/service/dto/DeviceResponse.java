package dev.huggo.vntl_backend.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DeviceResponse {
    @JsonProperty("id")
    Long id;

    @JsonProperty("numeroPatrimonio")
    String assetNumber;

    @JsonProperty("tipo")
    String type;

    @JsonProperty("marca")
    String brand;

    @JsonProperty("modelo")
    String model;

    @JsonProperty("numeroSerie")
    String serialNumber;

    @JsonProperty("dataCompra")
    LocalDate purchaseDate;

    @JsonProperty("status")
    String status;

    @JsonProperty("pacienteId")
    Long patientId;

    @JsonProperty("pacienteNome")
    String patientName;

    @JsonProperty("observacoes")
    String observations;
}
