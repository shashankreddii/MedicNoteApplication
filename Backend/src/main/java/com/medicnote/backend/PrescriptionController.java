package com.medicnote.backend;

import com.medicnote.backend.dto.PrescriptionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.transaction.Transactional;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class PrescriptionController {
    private static final Logger logger = LoggerFactory.getLogger(PrescriptionController.class);
    
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    @Autowired
    private PatientRepository patientRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<?> createPrescription(@RequestBody PrescriptionRequest request) {
        try {
            logger.info("Creating prescription for patient: {}", request.getPatientName());
            logger.info("Request data: {}", request);
            
            Patient patient;
            if (request.getPatientId() != null) {
                logger.info("Using existing patient with ID: {}", request.getPatientId());
                patient = patientRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient not found with id: " + request.getPatientId()));
            } else {
                logger.info("Creating new patient: {}", request.getPatientName());
                patient = new Patient();
                patient.setName(request.getPatientName());
                patient.setAge(request.getPatientAge() != null ? request.getPatientAge() : 0);
                patient.setGender(request.getPatientGender());
                patient.setContact(request.getPatientContact());
                patient = patientRepository.save(patient);
                logger.info("New patient created with ID: {}", patient.getId());
            }
            
            logger.info("Creating prescription with diagnosis: {}", request.getDiagnosis());
            Prescription prescription = new Prescription();
            prescription.setDiagnosis(request.getDiagnosis());
            prescription.setPrescriptionDate(LocalDate.parse(request.getPrescriptionDate()));
            prescription.setValidUntil(LocalDate.parse(request.getValidUntil()));
            prescription.setDoctorNotes(request.getDoctorNotes());
            prescription.setMedicationsJson(request.getMedicationsJson());
            prescription.setPatient(patient);
            
            Prescription savedPrescription = prescriptionRepository.save(prescription);
            logger.info("Prescription saved successfully with ID: {}", savedPrescription.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPrescription);
        } catch (RuntimeException e) {
            logger.error("Error creating prescription: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(java.util.Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating prescription: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Collections.singletonMap("error", "Internal server error"));
        }
    }

    @GetMapping
    public ResponseEntity<java.util.List<Prescription>> getAllPrescriptions() {
        try {
            java.util.List<Prescription> prescriptions = prescriptionRepository.findAll();
            return ResponseEntity.ok(prescriptions);
        } catch (Exception e) {
            logger.error("Error fetching prescriptions: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 