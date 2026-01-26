package dev.huggo.vntl_backend.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PatientResponse {

    @JsonProperty("id")
    Long id;

    @JsonProperty("nome")
    String name;

    @JsonProperty("cpf")
    String cpf;

    @JsonProperty("dataNascimento")
    LocalDate birthDate;

    @JsonProperty("telefone")
    String phone;

    @JsonProperty("telefoneSecundario")
    String secondaryPhone;

    @JsonProperty("email")
    String email;

    @JsonProperty("enderecoLogradouro")
    String addressStreet;

    @JsonProperty("enderecoNumero")
    String addressNumber;

    @JsonProperty("enderecoComplemento")
    String addressComplement;

    @JsonProperty("enderecoBairro")
    String addressNeighborhood;

    @JsonProperty("enderecoCidade")
    String addressCity;

    @JsonProperty("enderecoEstado")
    String addressState;

    @JsonProperty("enderecoCep")
    String addressZipCode;

    @JsonProperty("tipoContrato")
    String contractType;

    @JsonProperty("status")
    String status;

    @JsonProperty("dataRegistro")
    LocalDate registrationDate;

    @JsonProperty("dataUltimaVisita")
    LocalDate lastVisitDate;

    @JsonProperty("dataProximaVisita")
    LocalDate nextVisitDate;

    @JsonProperty("aparelhoId")
    Long deviceId;

    @JsonProperty("aparelhoTipo")
    String deviceType;

    @JsonProperty("aparelhoNumeroPatrimonio")
    String deviceAssetNumber;

    @JsonProperty("profissionalResponsavelId")
    Long professionalResponsibleId;

    @JsonProperty("profissionalResponsavelNome")
    String professionalResponsibleName;

    @JsonProperty("observacoes")
    String observations;
}
