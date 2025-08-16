package com.medicnote.backend;

import org.springframework.data.jpa.repository.JpaRepository;
 
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
} 