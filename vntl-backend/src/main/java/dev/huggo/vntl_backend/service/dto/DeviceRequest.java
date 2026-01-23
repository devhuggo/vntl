package dev.huggo.vntl_backend.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;

@Data
public class DeviceRequest {

    @NotBlank
    @JsonProperty("numeroPatrimonio")
    private String assetNumber;

    @NotBlank
    @JsonProperty("tipo")
    private String type;

    @JsonProperty("marca")
    private String brand;

    @JsonProperty("modelo")
    private String model;

    @JsonProperty("numeroSerie")
    private String serialNumber;

    @NotNull
    @JsonProperty("dataCompra")
    private LocalDate purchaseDate;

    @NotBlank
    @JsonProperty("status")
    private String status;

    @JsonProperty("observacoes")
    private String observations;
}
