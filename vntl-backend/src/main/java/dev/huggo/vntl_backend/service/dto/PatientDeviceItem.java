package dev.huggo.vntl_backend.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PatientDeviceItem {

    @JsonProperty("id")
    Long id;

    @JsonProperty("tipo")
    String type;

    @JsonProperty("numeroPatrimonio")
    String assetNumber;
}
