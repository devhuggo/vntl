package dev.huggo.vntl_backend.repository;

import dev.huggo.vntl_backend.domain.Professional;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessionalRepository extends JpaRepository<Professional, Long> {
    Optional<Professional> findByCpf(String cpf);
}
