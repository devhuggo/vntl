package dev.huggo.vntl_backend.service;

import dev.huggo.vntl_backend.service.dto.DeviceRequest;
import dev.huggo.vntl_backend.service.dto.DeviceResponse;
import java.time.LocalDate;
import java.util.List;

public interface DeviceService {
    DeviceResponse create(DeviceRequest request);
    DeviceResponse update(Long id, DeviceRequest request);
    DeviceResponse getById(Long id);

    List<DeviceResponse> listAll(
            LocalDate purchaseFrom,
            LocalDate purchaseTo,
            LocalDate lastExchangeFrom,
            LocalDate lastExchangeTo);

    void delete(Long id);
}
