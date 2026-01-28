package dev.huggo.vntl_backend.controller;

import dev.huggo.vntl_backend.config.JwtService;
import dev.huggo.vntl_backend.domain.User;
import dev.huggo.vntl_backend.service.dto.LoginRequest;
import dev.huggo.vntl_backend.service.dto.LoginResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        User user = (User) authentication.getPrincipal();
        String token = jwtService.generateToken(user);
        
        LoginResponse response = new LoginResponse(token, request.getUsername(), request.getUsername(), "ROLE_ADMIN");
        return ResponseEntity.ok(response);
    }

}
