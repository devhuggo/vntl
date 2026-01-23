package dev.huggo.vntl_backend.repository;

import dev.huggo.vntl_backend.domain.Device;
import dev.huggo.vntl_backend.domain.DeviceStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    Optional<Device> findByAssetNumber(String assetNumber);
    List<Device> findByStatus(DeviceStatus status);
}
