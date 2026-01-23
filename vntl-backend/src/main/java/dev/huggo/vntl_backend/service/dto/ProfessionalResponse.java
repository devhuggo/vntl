package dev.huggo.vntl_backend.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ProfessionalResponse {

    @JsonProperty("id")
    Long id;

    @JsonProperty("nome")
    String name;

    @JsonProperty("cpf")
    String cpf;

    @JsonProperty("telefone")
    String phone;

    @JsonProperty("telefoneSecundario")
    String secondaryPhone;

    @JsonProperty("email")
    String email;

    @JsonProperty("pacientesIds")
    List<Long> patientIds;

    @JsonProperty("pacientesCount")
    Integer patientsCount;

    @JsonProperty("dataRegistro")
    LocalDateTime createdAt;

    @JsonProperty("ativo")
    Boolean active;

    @JsonProperty("observacoes")
    String observations;
}
