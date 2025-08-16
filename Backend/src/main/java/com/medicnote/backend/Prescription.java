package com.medicnote.backend;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "prescriptions")
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotBlank(message = "Diagnosis is required")
    @Column(nullable = false)
    private String diagnosis;
    
    @NotNull(message = "Prescription date is required")
    @Column(name = "prescription_date", nullable = false)
    private LocalDate prescriptionDate;
    
    @Column(name = "valid_until")
    private LocalDate validUntil;
    
    @Column(name = "doctor_notes", columnDefinition = "TEXT")
    private String doctorNotes;
    
    @Lob
    @Column(name = "medications_json", columnDefinition = "TEXT")
    private String medicationsJson;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public LocalDate getPrescriptionDate() { return prescriptionDate; }
    public void setPrescriptionDate(LocalDate prescriptionDate) { this.prescriptionDate = prescriptionDate; }
    public LocalDate getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }
    public String getDoctorNotes() { return doctorNotes; }
    public void setDoctorNotes(String doctorNotes) { this.doctorNotes = doctorNotes; }
    public String getMedicationsJson() { return medicationsJson; }
    public void setMedicationsJson(String medicationsJson) { this.medicationsJson = medicationsJson; }
} 