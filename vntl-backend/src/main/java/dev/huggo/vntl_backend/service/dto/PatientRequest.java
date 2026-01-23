package dev.huggo.vntl_backend.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PatientRequest {

    @NotBlank
    @JsonProperty("nome")
    private String name;

    @NotBlank
    @JsonProperty("cpf")
    private String cpf;

    @JsonProperty("dataNascimento")
    private LocalDate birthDate;

    @JsonProperty("telefone")
    private String phone;

    @JsonProperty("telefoneSecundario")
    private String secondaryPhone;

    @JsonProperty("email")
    private String email;

    @JsonProperty("enderecoLogradouro")
    private String addressStreet;

    @JsonProperty("enderecoNumero")
    private String addressNumber;

    @JsonProperty("enderecoComplemento")
    private String addressComplement;

    @JsonProperty("enderecoBairro")
    private String addressNeighborhood;

    @JsonProperty("enderecoCidade")
    private String addressCity;

    @JsonProperty("enderecoEstado")
    private String addressState;

    @JsonProperty("enderecoCep")
    private String addressZipCode;

    @NotNull
    @JsonProperty("tipoContrato")
    private String contractType;

    @NotNull
    @JsonProperty("status")
    private String status;

    @JsonProperty("dataProximaVisita")
    private LocalDate nextVisitDate;

    @JsonProperty("aparelhoId")
    private Long deviceId;

    @JsonProperty("profissionalResponsavelId")
    private Long professionalResponsibleId;

    @JsonProperty("observacoes")
    private String observations;
}
