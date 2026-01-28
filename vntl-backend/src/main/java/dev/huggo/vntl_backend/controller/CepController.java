package dev.huggo.vntl_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.huggo.vntl_backend.service.CepService;
import dev.huggo.vntl_backend.service.dto.ViaCepResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ceps")
@RequiredArgsConstructor
public class CepController {

    private final CepService cepService;

    @GetMapping("/{cep}")
    public ResponseEntity<?> getAddress(@PathVariable String cep) {

        ViaCepResponse response = cepService.buscarEnderecoPorCep(cep);

        if (response == null || Boolean.TRUE.equals(response.getErro())) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }

}
