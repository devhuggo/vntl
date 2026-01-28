package dev.huggo.vntl_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import dev.huggo.vntl_backend.service.dto.ViaCepResponse;

@Service
public class CepServiceImpl implements CepService {

    private final WebClient webClient;

    public CepServiceImpl(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("https://viacep.com.br")
                .build();
    }

    public ViaCepResponse buscarEnderecoPorCep(String cep) {
        
        if (!cep.matches("\\d{8}")) {
            throw new IllegalArgumentException("CEP inválido");
        }

        return webClient.get()
                .uri("/ws/{cep}/json/", cep)
                .retrieve()
                .bodyToMono(ViaCepResponse.class)
                .block();
    }

}
