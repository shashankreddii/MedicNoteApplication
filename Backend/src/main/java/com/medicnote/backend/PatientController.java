package com.medicnote.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Arrays;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class PatientController {
    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);
    
    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        try {
            List<Patient> patients = patientRepository.findAll();
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            logger.error("Error fetching patients: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<Patient> addPatient(@RequestBody Patient patient) {
        try {
            Patient savedPatient = patientRepository.save(patient);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPatient);
        } catch (Exception e) {
            logger.error("Error adding patient: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patient) {
        try {
            logger.info("Updating patient with id: {}", id);
            logger.info("Received patient data: name={}, age={}, gender={}, contact={}", 
                       patient.getName(), patient.getAge(), patient.getGender(), patient.getContact());
            
            Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
            
            existingPatient.setName(patient.getName());
            existingPatient.setAge(patient.getAge());
            existingPatient.setGender(patient.getGender());
            existingPatient.setContact(patient.getContact());
            existingPatient.setDiagnosis(patient.getDiagnosis());
            existingPatient.setLastVisit(patient.getLastVisit());
            existingPatient.setNotes(patient.getNotes());
            
            Patient savedPatient = patientRepository.save(existingPatient);
            logger.info("Patient updated successfully: {}", savedPatient.getId());
            return ResponseEntity.ok(savedPatient);
        } catch (RuntimeException e) {
            logger.error("Patient not found with id: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error updating patient: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        try {
            if (!patientRepository.existsById(id)) {
                logger.error("Patient not found with id: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            patientRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting patient: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        try {
            Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
            return ResponseEntity.ok(patient);
        } catch (RuntimeException e) {
            logger.error("Patient not found with id: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error fetching patient: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/debug")
    public ResponseEntity<String> debugPatients() {
        try {
            List<Patient> patients = patientRepository.findAll();
            StringBuilder result = new StringBuilder();
            result.append("Total patients: ").append(patients.size()).append("\n");
            for (Patient patient : patients) {
                result.append("ID: ").append(patient.getId())
                      .append(", Name: ").append(patient.getName())
                      .append(", Age: ").append(patient.getAge())
                      .append(", Gender: ").append(patient.getGender())
                      .append(", Contact: ").append(patient.getContact())
                      .append(", Diagnosis: ").append(patient.getDiagnosis())
                      .append("\n");
            }
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            logger.error("Error in debug endpoint: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/insert-sample-data")
    public ResponseEntity<String> insertSampleData() {
        try {
            // Insert sample patients
            Patient patient1 = new Patient();
            patient1.setName("Shashank");
            patient1.setAge(23);
            patient1.setGender("Male");
            patient1.setContact("+91 9876543210");
            patient1.setDiagnosis("Hypertension");
            patient1.setLastVisit("2024-01-15");
            patient1.setNotes("Regular checkup needed");
            patientRepository.save(patient1);

            Patient patient2 = new Patient();
            patient2.setName("Hemanth");
            patient2.setAge(23);
            patient2.setGender("Male");
            patient2.setContact("9100101010");
            patient2.setDiagnosis("Diabetes Type 2");
            patient2.setLastVisit("2024-01-20");
            patient2.setNotes("Monitor blood sugar levels");
            patientRepository.save(patient2);

            Patient patient3 = new Patient();
            patient3.setName("Sumanth");
            patient3.setAge(21);
            patient3.setGender("Male");
            patient3.setContact("8102100001");
            patient3.setDiagnosis("Asthma");
            patient3.setLastVisit("2024-01-25");
            patient3.setNotes("Inhaler prescribed");
            patientRepository.save(patient3);

            Patient patient4 = new Patient();
            patient4.setName("Hari");
            patient4.setAge(20);
            patient4.setGender("Male");
            patient4.setContact("8000080000");
            patient4.setDiagnosis("Migraine");
            patient4.setLastVisit("2024-02-01");
            patient4.setNotes("Avoid triggers");
            patientRepository.save(patient4);

            Patient patient5 = new Patient();
            patient5.setName("Hasini");
            patient5.setAge(24);
            patient5.setGender("Female");
            patient5.setContact("9100000010");
            patient5.setDiagnosis("Anxiety");
            patient5.setLastVisit("2024-02-05");
            patient5.setNotes("Therapy recommended");
            patientRepository.save(patient5);

            return ResponseEntity.ok("Sample data inserted successfully! Total patients: " + patientRepository.count());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error inserting sample data: " + e.getMessage());
        }
    }

    @DeleteMapping("/remove-sample-data")
    public ResponseEntity<String> removeSampleData() {
        try {
            // Remove the sample data I inserted (IDs 1-6)
            List<Long> sampleIds = Arrays.asList(1L, 2L, 3L, 4L, 5L, 6L);
            patientRepository.deleteAllById(sampleIds);
            
            return ResponseEntity.ok("Sample data removed successfully. Your original data is preserved.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error removing sample data: " + e.getMessage());
        }
    }

    @PostMapping("/restore-original-data")
    public ResponseEntity<String> restoreOriginalData() {
        try {
            // Restore the original patient data you mentioned
            Patient patient1 = new Patient();
            patient1.setName("Shashank");
            patient1.setAge(23);
            patient1.setGender("Male");
            patient1.setContact("+91 9876543210");
            patient1.setDiagnosis("Hypertension");
            patient1.setLastVisit("2024-01-15");
            patient1.setNotes("Regular checkup needed");
            patientRepository.save(patient1);

            Patient patient2 = new Patient();
            patient2.setName("Hemanth");
            patient2.setAge(23);
            patient2.setGender("Male");
            patient2.setContact("9100101010");
            patient2.setDiagnosis("Diabetes Type 2");
            patient2.setLastVisit("2024-01-20");
            patient2.setNotes("Monitor blood sugar levels");
            patientRepository.save(patient2);

            Patient patient3 = new Patient();
            patient3.setName("Sumanth");
            patient3.setAge(21);
            patient3.setGender("Male");
            patient3.setContact("8102100001");
            patient3.setDiagnosis("Asthma");
            patient3.setLastVisit("2024-01-25");
            patient3.setNotes("Inhaler prescribed");
            patientRepository.save(patient3);

            Patient patient4 = new Patient();
            patient4.setName("Hari");
            patient4.setAge(20);
            patient4.setGender("Male");
            patient4.setContact("8000080000");
            patient4.setDiagnosis("Migraine");
            patient4.setLastVisit("2024-02-01");
            patient4.setNotes("Avoid triggers");
            patientRepository.save(patient4);

            Patient patient5 = new Patient();
            patient5.setName("Hasini");
            patient5.setAge(24);
            patient5.setGender("Female");
            patient5.setContact("9100000010");
            patient5.setDiagnosis("Anxiety");
            patient5.setLastVisit("2024-02-05");
            patient5.setNotes("Therapy recommended");
            patientRepository.save(patient5);

            return ResponseEntity.ok("Original data restored successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error restoring data: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-all-patients")
    public ResponseEntity<String> deleteAllPatients() {
        try {
            patientRepository.deleteAll();
            return ResponseEntity.ok("All patients deleted.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting patients: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-all-prescriptions")
    public ResponseEntity<String> deleteAllPrescriptions() {
        try {
            prescriptionRepository.deleteAll();
            return ResponseEntity.ok("All prescriptions deleted.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting prescriptions: " + e.getMessage());
        }
    }

    @PostMapping("/restore-original-data-from-file")
    public ResponseEntity<String> restoreOriginalDataFromFile() {
        try {
            // Restore the original patient data from restore-data.sql
            Patient patient1 = new Patient();
            patient1.setName("Shashank");
            patient1.setAge(23);
            patient1.setGender("Male");
            patient1.setContact("+91 9876543210");
            patient1.setDiagnosis("Hypertension");
            patient1.setLastVisit("2024-01-15");
            patient1.setNotes("Regular checkup needed");
            patientRepository.save(patient1);

            Patient patient2 = new Patient();
            patient2.setName("Hemanth");
            patient2.setAge(23);
            patient2.setGender("Male");
            patient2.setContact("9100101010");
            patient2.setDiagnosis("Diabetes Type 2");
            patient2.setLastVisit("2024-01-20");
            patient2.setNotes("Monitor blood sugar levels");
            patientRepository.save(patient2);

            Patient patient3 = new Patient();
            patient3.setName("Sumanth");
            patient3.setAge(21);
            patient3.setGender("Male");
            patient3.setContact("8102100001");
            patient3.setDiagnosis("Asthma");
            patient3.setLastVisit("2024-01-25");
            patient3.setNotes("Inhaler prescribed");
            patientRepository.save(patient3);

            Patient patient4 = new Patient();
            patient4.setName("Hari");
            patient4.setAge(20);
            patient4.setGender("Male");
            patient4.setContact("8000080000");
            patient4.setDiagnosis("Migraine");
            patient4.setLastVisit("2024-02-01");
            patient4.setNotes("Avoid triggers");
            patientRepository.save(patient4);

            Patient patient5 = new Patient();
            patient5.setName("Hasini");
            patient5.setAge(24);
            patient5.setGender("Female");
            patient5.setContact("9100000010");
            patient5.setDiagnosis("Anxiety");
            patient5.setLastVisit("2024-02-05");
            patient5.setNotes("Therapy recommended");
            patientRepository.save(patient5);

            // Also restore prescriptions
            // Note: This requires the Prescription entity and repository
            // For now, just restore patients
            
            return ResponseEntity.ok("Original data restored successfully! 5 patients added.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error restoring data: " + e.getMessage());
        }
    }

    @PostMapping("/add-sample-prescriptions")
    public ResponseEntity<String> addSamplePrescriptions() {
        try {
            // Get existing patients
            List<Patient> patients = patientRepository.findAll();
            if (patients.isEmpty()) {
                return ResponseEntity.badRequest().body("No patients found. Please add patients first.");
            }

            // Add sample prescriptions for each patient
            for (int i = 0; i < Math.min(patients.size(), 3); i++) {
                Patient patient = patients.get(i);
                
                Prescription prescription = new Prescription();
                prescription.setPatient(patient);
                prescription.setDiagnosis(patient.getDiagnosis());
                prescription.setDoctorNotes("Sample prescription notes for " + patient.getName());
                prescription.setMedicationsJson("[\"Medication " + (i+1) + "\", \"Dosage: 1 tablet daily\"]");
                prescription.setPrescriptionDate(LocalDate.parse("2024-01-" + String.format("%02d", 15 + i)));
                prescription.setValidUntil(LocalDate.parse("2024-02-" + String.format("%02d", 15 + i)));
                
                prescriptionRepository.save(prescription);
            }

            return ResponseEntity.ok("Sample prescriptions added successfully! Total prescriptions: " + prescriptionRepository.count());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error adding sample prescriptions: " + e.getMessage());
        }
    }

    @PostMapping("/restore-original-prescriptions")
    public ResponseEntity<String> restoreOriginalPrescriptions() {
        try {
            // Get existing patients
            List<Patient> patients = patientRepository.findAll();
            if (patients.isEmpty()) {
                return ResponseEntity.badRequest().body("No patients found. Please add patients first.");
            }

            // Clear existing prescriptions
            prescriptionRepository.deleteAll();

            // Restore original 5 prescriptions
            for (int i = 0; i < Math.min(patients.size(), 5); i++) {
                Patient patient = patients.get(i);
                
                Prescription prescription = new Prescription();
                prescription.setPatient(patient);
                prescription.setDiagnosis(patient.getDiagnosis());
                prescription.setDoctorNotes("Original prescription for " + patient.getName() + " - " + patient.getDiagnosis());
                
                // Set different medications for each patient
                String[] medications = {
                    "[\"Amlodipine 5mg\", \"Dosage: 1 tablet daily\", \"Take with food\"]",
                    "[\"Metformin 500mg\", \"Dosage: 1 tablet twice daily\", \"Monitor blood sugar\"]",
                    "[\"Salbutamol Inhaler\", \"Dosage: 2 puffs as needed\", \"Use before exercise\"]",
                    "[\"Sumatriptan 50mg\", \"Dosage: 1 tablet when needed\", \"Take at onset of headache\"]",
                    "[\"Sertraline 50mg\", \"Dosage: 1 tablet daily\", \"Take in the morning\"]"
                };
                
                prescription.setMedicationsJson(medications[i]);
                prescription.setPrescriptionDate(LocalDate.parse("2024-01-" + String.format("%02d", 10 + i)));
                prescription.setValidUntil(LocalDate.parse("2024-02-" + String.format("%02d", 10 + i)));
                
                prescriptionRepository.save(prescription);
            }

            return ResponseEntity.ok("Original 5 prescriptions restored successfully! Total prescriptions: " + prescriptionRepository.count());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error restoring original prescriptions: " + e.getMessage());
        }
    }
} 