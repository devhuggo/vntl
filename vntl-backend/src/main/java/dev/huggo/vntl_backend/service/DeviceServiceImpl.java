package dev.huggo.vntl_backend.service;

import dev.huggo.vntl_backend.domain.Device;
import dev.huggo.vntl_backend.domain.DeviceStatus;
import dev.huggo.vntl_backend.repository.DeviceRepository;
import dev.huggo.vntl_backend.repository.PatientRepository;
import dev.huggo.vntl_backend.service.dto.DeviceRequest;
import dev.huggo.vntl_backend.service.dto.DeviceResponse;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeviceServiceImpl implements DeviceService {

    private final DeviceRepository deviceRepository;
    private final PatientRepository patientRepository;

    @Override
    @Transactional
    public DeviceResponse create(DeviceRequest request) {
        Device device = new Device();
        applyRequest(request, device);
        try {
            Device saved = deviceRepository.save(device);
            log.info("Created device id={}", saved.getId());
            return toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Asset number already exists");
        }
    }

    @Override
    @Transactional
    public DeviceResponse update(Long id, DeviceRequest request) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Device not found"));

        deviceRepository.findByAssetNumber(request.getAssetNumber())
                .filter(d -> !d.getId().equals(id))
                .ifPresent(d -> { throw new IllegalArgumentException("Asset number already exists"); });

        applyRequest(request, device);
        Device saved = deviceRepository.save(device);
        log.info("Updated device id={}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DeviceResponse getById(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Device not found"));
        return toResponse(device);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceResponse> listAll(String status) {
        List<Device> devices;
        if (status == null || status.isBlank()) {
            devices = deviceRepository.findAll();
        } else {
            DeviceStatus parsed = DeviceStatus.valueOf(status.toUpperCase(Locale.ROOT));
            devices = deviceRepository.findByStatus(parsed);
        }
        return devices.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Device not found"));
        deviceRepository.delete(device);
        log.info("Deleted device id={}", id);
    }

    private void applyRequest(DeviceRequest request, Device device) {
        device.setAssetNumber(request.getAssetNumber());
        device.setType(request.getType());
        device.setBrand(request.getBrand());
        device.setModel(request.getModel());
        device.setSerialNumber(request.getSerialNumber());
        device.setPurchaseDate(request.getPurchaseDate());
        device.setStatus(DeviceStatus.valueOf(request.getStatus()));
        device.setObservations(request.getObservations());
    }

    private DeviceResponse toResponse(Device device) {
        var patient = patientRepository.findByDeviceId(device.getId());
        return DeviceResponse.builder()
                .id(device.getId())
                .assetNumber(device.getAssetNumber())
                .type(device.getType())
                .brand(device.getBrand())
                .model(device.getModel())
                .serialNumber(device.getSerialNumber())
                .purchaseDate(device.getPurchaseDate())
                .status(device.getStatus().name())
                .patientId(patient.map(p -> p.getId()).orElse(null))
                .patientName(patient.map(p -> p.getName()).orElse(null))
                .observations(device.getObservations())
                .build();
    }
}
