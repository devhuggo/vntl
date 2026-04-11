package dev.huggo.vntl_backend.repository;

import dev.huggo.vntl_backend.domain.Device;
import dev.huggo.vntl_backend.domain.DeviceStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    Optional<Device> findByAssetNumber(String assetNumber);
    List<Device> findByStatus(DeviceStatus status);

    @Query(
            """
            SELECT d FROM Device d
            WHERE (:purchaseFrom IS NULL OR d.purchaseDate >= :purchaseFrom)
              AND (:purchaseTo IS NULL OR d.purchaseDate <= :purchaseTo)
              AND (:exchangeFrom IS NULL OR (d.lastExchangeDate IS NOT NULL AND d.lastExchangeDate >= :exchangeFrom))
              AND (:exchangeTo IS NULL OR (d.lastExchangeDate IS NOT NULL AND d.lastExchangeDate <= :exchangeTo))
            ORDER BY d.id
            """)
    List<Device> findWithDateFilters(
            @Param("purchaseFrom") LocalDate purchaseFrom,
            @Param("purchaseTo") LocalDate purchaseTo,
            @Param("exchangeFrom") LocalDate exchangeFrom,
            @Param("exchangeTo") LocalDate exchangeTo);
}
