import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import PDFPreview from './PDFPreview'

const routeOptions = ['Oral', 'Injection', 'Topical', 'Inhalation', 'Sublingual', 'Rectal', 'Other']
const frequencyOptions = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every 6 hours',
  'Every 8 hours',
  'As needed',
  'Other',
]

function PrescriptionForm({ patient, onBack, onSave }) {
  const [patientName, setPatientName] = useState(patient?.name || '')
  const [patientAge, setPatientAge] = useState(patient?.age || '')
  const [patientGender, setPatientGender] = useState(patient?.gender || '')
  const [patientContact, setPatientContact] = useState(patient?.contact || patient?.phone || '')
  const [diagnosis, setDiagnosis] = useState('')
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().split('T')[0])
  const [validUntil, setValidUntil] = useState('')
  const [doctorNotes, setDoctorNotes] = useState('')
  const [medications, setMedications] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  // Prescription templates
  const prescriptionTemplates = {
    'cold-flu': {
      name: 'Cold & Flu',
      diagnosis: 'Upper Respiratory Tract Infection',
      medications: [
        { name: 'Paracetamol', dosage: '500mg', frequency: '1 tablet every 6 hours', duration: '5 days', instructions: 'Take with food' },
        { name: 'Vitamin C', dosage: '1000mg', frequency: '1 tablet daily', duration: '7 days', instructions: 'Take in the morning' }
      ],
      notes: 'Rest well, drink plenty of fluids, avoid cold foods and beverages.'
    },
    'hypertension': {
      name: 'Hypertension',
      diagnosis: 'Essential Hypertension',
      medications: [
        { name: 'Amlodipine', dosage: '5mg', frequency: '1 tablet daily', duration: '30 days', instructions: 'Take in the morning' },
        { name: 'Lisinopril', dosage: '10mg', frequency: '1 tablet daily', duration: '30 days', instructions: 'Take on empty stomach' }
      ],
      notes: 'Monitor blood pressure regularly, reduce salt intake, exercise regularly.'
    },
    'diabetes': {
      name: 'Diabetes Type 2',
      diagnosis: 'Type 2 Diabetes Mellitus',
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: '1 tablet twice daily', duration: '30 days', instructions: 'Take with meals' },
        { name: 'Glimepiride', dosage: '1mg', frequency: '1 tablet daily', duration: '30 days', instructions: 'Take 30 minutes before breakfast' }
      ],
      notes: 'Monitor blood sugar levels, follow diabetic diet, regular exercise.'
    },
    'pain-management': {
      name: 'Pain Management',
      diagnosis: 'Chronic Pain Syndrome',
      medications: [
        { name: 'Ibuprofen', dosage: '400mg', frequency: '1 tablet every 8 hours', duration: '7 days', instructions: 'Take with food' },
        { name: 'Acetaminophen', dosage: '500mg', frequency: '1 tablet every 6 hours', duration: '7 days', instructions: 'Do not exceed 4g daily' }
      ],
      notes: 'Apply heat/cold therapy, gentle exercises, avoid heavy lifting.'
    },
    'antibiotics': {
      name: 'Bacterial Infection',
      diagnosis: 'Bacterial Infection',
      medications: [
        { name: 'Amoxicillin', dosage: '500mg', frequency: '1 capsule three times daily', duration: '7 days', instructions: 'Take on empty stomach' },
        { name: 'Probiotics', dosage: '1 capsule', frequency: '1 capsule daily', duration: '7 days', instructions: 'Take 2 hours after antibiotics' }
      ],
      notes: 'Complete the full course, take probiotics to maintain gut health.'
    }
  }

  const applyTemplate = (templateKey) => {
    const template = prescriptionTemplates[templateKey]
    if (template) {
      setDiagnosis(template.diagnosis)
      setMedications(template.medications)
      setDoctorNotes(template.notes)
      setShowTemplates(false)
    }
  }

  const addMedication = () => {
    setMedications([...medications, {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }])
  }

  const updateMedication = (index, field, value) => {
    const updatedMedications = [...medications]
    updatedMedications[index][field] = value
    setMedications(updatedMedications)
  }

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const prescriptionData = {
      patientName,
      patientAge,
      patientGender,
      patientContact,
      diagnosis,
      prescriptionDate,
      validUntil,
      medications,
      doctorNotes
    }
    onSave(prescriptionData)
  }

  const handleDownloadPDF = async () => {
    const doc = new jsPDF()
    
    // Get doctor settings from localStorage
    const doctorSettings = JSON.parse(localStorage.getItem('doctorSettings') || '{}')
    const profileInfo = doctorSettings.profile || {}
    const clinicInfo = doctorSettings.clinic || {}
    
    // Generate QR code data
    const qrData = JSON.stringify({
      prescriptionId: Date.now(),
      patientName: patientName,
      doctorName: profileInfo.fullName,
      date: prescriptionDate,
      clinic: clinicInfo.name,
      medications: medications.length
    })
    
    let qrCodeDataURL = ''
    try {
      qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 40,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
    } catch (err) {
      console.error('QR Code generation failed:', err)
    }
    
    // Set up professional styling
    doc.setFont('helvetica')
    
    // Header with clinic branding
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 0, 210, 25, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(`🏥 ${clinicInfo.name || 'MEDICNOTE CLINIC'}`, 105, 12, { align: 'center' })
    doc.setFontSize(10)
    doc.text('Professional Medical Care & Prescriptions', 105, 20, { align: 'center' })
    
    // Reset text color for content
    doc.setTextColor(0, 0, 0)
    
    let y = 35
    
    // Prescription title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('PRESCRIPTION', 105, y, { align: 'center' })
    y += 15
    
    // Doctor information section
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Prescribing Doctor:', 14, y)
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.text(`${profileInfo.fullName || 'Dr. [Your Name]'}`, 20, y)
    y += 6
    doc.text(`Medical License: ${clinicInfo.license || '[License Number]'}`, 20, y)
    y += 6
    doc.text(`Contact: ${profileInfo.phone || '[Phone]'} | Email: ${profileInfo.email || '[Email]'}`, 20, y)
    if (profileInfo.specialization) {
      y += 6
      doc.text(`Specialization: ${profileInfo.specialization}`, 20, y)
    }
    y += 10
    
    // Patient information section
    doc.setFont('helvetica', 'bold')
    doc.text('Patient Information:', 14, y)
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${patientName}`, 20, y)
    y += 6
    doc.text(`Age: ${patientAge} years | Gender: ${patientGender}`, 20, y)
    y += 6
    doc.text(`Contact: ${patientContact}`, 20, y)
    y += 10
    
    // Medical details section
    doc.setFont('helvetica', 'bold')
    doc.text('Medical Details:', 14, y)
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.text(`Diagnosis: ${diagnosis}`, 20, y)
    y += 6
    doc.text(`Prescription Date: ${prescriptionDate}`, 20, y)
    y += 6
    doc.text(`Valid Until: ${validUntil}`, 20, y)
    y += 10
    
    // Doctor's notes section
    if (doctorNotes) {
      doc.setFont('helvetica', 'bold')
      doc.text('Doctor\'s Notes:', 14, y)
      y += 8
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const notesLines = doc.splitTextToSize(doctorNotes, 170)
      doc.text(notesLines, 20, y)
      y += notesLines.length * 5 + 10
    }
    
    // Medications section
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Medications:', 14, y)
    y += 10
    
    medications.forEach((med, index) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(`${index + 1}. ${med.name} ${med.dosage}`, 20, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`   Frequency: ${med.frequency}`, 25, y)
      y += 5
      doc.text(`   Duration: ${med.duration}`, 25, y)
      y += 5
      if (med.instructions) {
        doc.text(`   Instructions: ${med.instructions}`, 25, y)
        y += 5
      }
      y += 5
    })
    
    // QR Code for digital verification
    if (qrCodeDataURL) {
      doc.addImage(qrCodeDataURL, 'PNG', 160, 35, 40, 40)
      doc.setFontSize(8)
      doc.text('Digital Verification', 160, 80)
    }
    
    // Footer
    y = 270
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`${clinicInfo.name || 'MedicNote Clinic'} | Professional Medical Services`, 105, y, { align: 'center' })
    if (clinicInfo.address || profileInfo.clinicAddress) {
      doc.text(clinicInfo.address || profileInfo.clinicAddress, 105, y + 5, { align: 'center' })
      doc.text(`Phone: ${clinicInfo.phone || profileInfo.clinicPhone || ''} | Email: ${clinicInfo.email || profileInfo.clinicEmail || ''}`, 105, y + 10, { align: 'center' })
      doc.text('This prescription is valid only when signed by a licensed physician', 105, y + 15, { align: 'center' })
    } else {
      doc.text('This prescription is valid only when signed by a licensed physician', 105, y + 5, { align: 'center' })
    }
    
    // Save the PDF
    doc.save(`prescription_${patientName}_${prescriptionDate}.pdf`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '2rem',
      color: 'var(--text-primary)'
    }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        background: 'var(--card-bg)',
        borderRadius: 12,
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header with Back and Template buttons */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '2rem',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={onBack}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                cursor: 'pointer',
                marginRight: '1rem',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              ← Back to Dashboard
            </button>
            <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2rem' }}>New Prescription</h1>
          </div>
          
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            📋 Use Template
          </button>
        </div>

        {/* Template Selection Modal */}
        {showTemplates && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'var(--card-bg)',
              borderRadius: 12,
              padding: '2rem',
              maxWidth: 600,
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Select Prescription Template</h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {Object.entries(prescriptionTemplates).map(([key, template]) => (
                  <div
                    key={key}
                    onClick={() => applyTemplate(key)}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: 'var(--bg-secondary)'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'var(--bg-tertiary)'}
                    onMouseOut={(e) => e.target.style.background = 'var(--bg-secondary)'}
                  >
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>{template.name}</h3>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <strong>Diagnosis:</strong> {template.diagnosis}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <strong>Medications:</strong> {template.medications.length} items
                    </p>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button
                  onClick={() => setShowTemplates(false)}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
          {/* Left Column - Patient & Medical Info */}
          <div>
            <h2 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>Patient Information</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Contact Number</label>
                <input
                  type="tel"
                  value={patientContact}
                  onChange={(e) => setPatientContact(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            <h2 style={{ color: 'var(--accent-color)', marginTop: '2rem', marginBottom: '1rem' }}>Medical Details</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Diagnosis</label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Prescription Date</label>
                  <input
                    type="date"
                    value={prescriptionDate}
                    onChange={(e) => setPrescriptionDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Valid Until</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Medications */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ color: 'var(--accent-color)', margin: 0 }}>Medications</h2>
              <button
                onClick={addMedication}
                style={{
                  background: 'var(--accent-color)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Add Medication
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflow: 'auto' }}>
              {medications.map((med, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    padding: '1rem',
                    background: 'var(--bg-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Medication {index + 1}</h4>
                    <button
                      onClick={() => removeMedication(index)}
                      style={{
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px', fontWeight: 500 }}>Medication Name</label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder="e.g., Paracetamol"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: 4,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px', fontWeight: 500 }}>Dosage</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: 4,
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px', fontWeight: 500 }}>Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: 4,
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px', fontWeight: 500 }}>Frequency</label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        placeholder="e.g., 1 tablet every 6 hours"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: 4,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '14px', fontWeight: 500 }}>Special Instructions</label>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        placeholder="e.g., Take with food"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: 4,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Doctor's Notes</label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={4}
                placeholder="Additional instructions, lifestyle recommendations, follow-up instructions..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 6,
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center', 
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '2px solid var(--border-color)'
        }}>
          <button
            onClick={() => setShowPreview(true)}
            style={{
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              minWidth: '150px'
            }}
          >
            👁️ Preview PDF
          </button>
          <button
            onClick={handleDownloadPDF}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              minWidth: '150px'
            }}
          >
            📄 Download PDF
          </button>
          <button
            onClick={handleSave}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              minWidth: '150px'
            }}
          >
            💾 Save Prescription
          </button>
        </div>

        {/* PDF Preview Modal */}
        {showPreview && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'var(--card-bg)',
              borderRadius: 12,
              padding: '1rem',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>PDF Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                >
                  ×
                </button>
              </div>
              <PDFPreview
                prescriptionData={{
                  patientName,
                  patientAge,
                  patientGender,
                  patientContact,
                  diagnosis,
                  prescriptionDate,
                  validUntil,
                  medications,
                  doctorNotes
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PrescriptionForm
