package du.tum.student.enterpriseassetmanager.repository;

import du.tum.student.enterpriseassetmanager.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
