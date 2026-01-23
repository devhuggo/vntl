package dev.huggo.vntl_backend.service.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
