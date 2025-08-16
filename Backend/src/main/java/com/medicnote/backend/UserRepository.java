package com.medicnote.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by email
     * @param email the email to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if user exists by email
     * @param email the email to check
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Find user by email and active status
     * @param email the email to search for
     * @param isActive the active status
     * @return Optional containing the user if found
     */
    Optional<User> findByEmailAndIsActiveTrue(String email);
    
    /**
     * Find user by license number
     * @param licenseNumber the license number to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByLicenseNumber(String licenseNumber);
}


