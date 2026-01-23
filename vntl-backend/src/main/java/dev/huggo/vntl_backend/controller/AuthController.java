package dev.huggo.vntl_backend.controller;

import dev.huggo.vntl_backend.service.dto.LoginRequest;
import dev.huggo.vntl_backend.service.dto.LoginResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Simplified login: accept any credentials and return a dummy token.
        String token = "token-" + request.getUsername();
        LoginResponse response = new LoginResponse(token, request.getUsername(), request.getUsername(), "ADMIN");
        return ResponseEntity.ok(response);
    }
}
