package com.medicnote.backend.dto;

public class PrescriptionRequest {
    private Long patientId;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String patientContact;
    private String diagnosis;
    private String prescriptionDate;
    private String validUntil;
    private String doctorNotes;
    private String medicationsJson;

    // Getters and setters
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public Integer getPatientAge() { return patientAge; }
    public void setPatientAge(Integer patientAge) { this.patientAge = patientAge; }
    public String getPatientGender() { return patientGender; }
    public void setPatientGender(String patientGender) { this.patientGender = patientGender; }
    public String getPatientContact() { return patientContact; }
    public void setPatientContact(String patientContact) { this.patientContact = patientContact; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getPrescriptionDate() { return prescriptionDate; }
    public void setPrescriptionDate(String prescriptionDate) { this.prescriptionDate = prescriptionDate; }
    public String getValidUntil() { return validUntil; }
    public void setValidUntil(String validUntil) { this.validUntil = validUntil; }
    public String getDoctorNotes() { return doctorNotes; }
    public void setDoctorNotes(String doctorNotes) { this.doctorNotes = doctorNotes; }
    public String getMedicationsJson() { return medicationsJson; }
    public void setMedicationsJson(String medicationsJson) { this.medicationsJson = medicationsJson; }

    @Override
    public String toString() {
        return "PrescriptionRequest{" +
                "patientId=" + patientId +
                ", patientName='" + patientName + '\'' +
                ", patientAge=" + patientAge +
                ", patientGender='" + patientGender + '\'' +
                ", patientContact='" + patientContact + '\'' +
                ", diagnosis='" + diagnosis + '\'' +
                ", prescriptionDate='" + prescriptionDate + '\'' +
                ", validUntil='" + validUntil + '\'' +
                ", doctorNotes='" + doctorNotes + '\'' +
                ", medicationsJson='" + medicationsJson + '\'' +
                '}';
    }
} 