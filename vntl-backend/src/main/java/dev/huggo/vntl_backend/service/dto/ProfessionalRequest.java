package dev.huggo.vntl_backend.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProfessionalRequest {

    @NotBlank
    @JsonProperty("nome")
    private String name;

    @NotBlank
    @JsonProperty("cpf")
    private String cpf;

    @JsonProperty("telefone")
    private String phone;

    @JsonProperty("telefoneSecundario")
    private String secondaryPhone;

    @JsonProperty("email")
    private String email;

    @NotNull
    @JsonProperty("ativo")
    private Boolean active;

    @JsonProperty("observacoes")
    private String observations;
}
