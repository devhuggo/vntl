package dev.huggo.vntl_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import dev.huggo.vntl_backend.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
}
