package dev.huggo.vntl_backend.service;

import dev.huggo.vntl_backend.service.dto.ViaCepResponse;

public interface CepService {

    public ViaCepResponse buscarEnderecoPorCep(String cep);

}
