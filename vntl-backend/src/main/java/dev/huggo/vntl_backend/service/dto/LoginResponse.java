package dev.huggo.vntl_backend.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
    private String nome;
    private String role;
    /** ID do profissional vinculado ao usuário (MVP: um profissional por conta). */
    private Long professionalId;
}
