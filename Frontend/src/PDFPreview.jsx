import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

function PDFPreview({ prescriptionData, onClose, onDownload }) {
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [doctorProfile, setDoctorProfile] = useState({})

  useEffect(() => {
    generatePreview()
  }, [prescriptionData])

  useEffect(() => {
    // Load doctor profile from localStorage
    const doctorSettings = JSON.parse(localStorage.getItem('doctorSettings') || '{}')
    const profileInfo = doctorSettings.profile || {}
    const clinicInfo = doctorSettings.clinic || {}
    
    setDoctorProfile({
      name: profileInfo.fullName || '',
      license: clinicInfo.license || '',
      phone: profileInfo.phone || '',
      email: profileInfo.email || '',
      specialization: profileInfo.specialization || '',
      clinicName: clinicInfo.name || 'MedicNote Clinic',
      clinicAddress: clinicInfo.address || '',
      clinicPhone: clinicInfo.phone || '',
      clinicEmail: clinicInfo.email || ''
    })
  }, [])

  const generatePreview = async () => {
    setLoading(true)
    const doc = new jsPDF()
    
    // Get doctor profile and clinic settings from localStorage
    const doctorSettings = JSON.parse(localStorage.getItem('doctorSettings') || '{}')
    const clinicInfo = doctorSettings.clinic || {}
    
    // Generate QR code data
    const qrData = JSON.stringify({
      prescriptionId: Date.now(),
      patientName: prescriptionData.patientName,
      doctorName: doctorProfile.name,
      date: prescriptionData.prescriptionDate,
      clinic: clinicInfo.name || doctorProfile.clinicName,
      medications: prescriptionData.medications.length
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
    doc.text(`🏥 ${clinicInfo.name || doctorProfile.clinicName || 'MEDICNOTE CLINIC'}`, 105, 12, { align: 'center' })
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
    doc.text(`Dr. ${doctorProfile.name || '[Your Name]'}`, 20, y)
    y += 6
    doc.text(`Medical License: ${doctorProfile.license || '[License Number]'}`, 20, y)
    y += 6
    doc.text(`Contact: ${doctorProfile.phone || '[Phone]'} | Email: ${doctorProfile.email || '[Email]'}`, 20, y)
    if (doctorProfile.specialization) {
      y += 6
      doc.text(`Specialization: ${doctorProfile.specialization}`, 20, y)
    }
    y += 10
    
    // Patient information section
    doc.setFont('helvetica', 'bold')
    doc.text('Patient Information:', 14, y)
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${prescriptionData.patientName || 'N/A'}`, 20, y)
    y += 6
    doc.text(`Age: ${prescriptionData.patientAge || 'N/A'} years | Gender: ${prescriptionData.patientGender || 'N/A'}`, 20, y)
    y += 6
    doc.text(`Contact: ${prescriptionData.patientContact || 'N/A'}`, 20, y)
    y += 10
    
    // Medical details section
    doc.setFont('helvetica', 'bold')
    doc.text('Medical Details:', 14, y)
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.text(`Diagnosis: ${prescriptionData.diagnosis || 'N/A'}`, 20, y)
    y += 6
    doc.text(`Prescription Date: ${prescriptionData.prescriptionDate || 'N/A'}`, 20, y)
    y += 6
    doc.text(`Valid Until: ${prescriptionData.validUntil || 'N/A'}`, 20, y)
    y += 10
    
    // Doctor's notes section
    if (prescriptionData.doctorNotes) {
      doc.setFont('helvetica', 'bold')
      doc.text('Doctor\'s Notes:', 14, y)
      y += 8
      doc.setFont('helvetica', 'normal')
      
      // Handle long notes with word wrapping
      const maxWidth = 170
      const words = prescriptionData.doctorNotes.split(' ')
      let line = ''
      for (let word of words) {
        const testLine = line + word + ' '
        const testWidth = doc.getTextWidth(testLine)
        if (testWidth > maxWidth && line !== '') {
          doc.text(line, 20, y)
          y += 6
          line = word + ' '
        } else {
          line = testLine
        }
      }
      doc.text(line, 20, y)
      y += 10
    }
    
    // Medications section
    doc.setFont('helvetica', 'bold')
    doc.text('Prescribed Medications:', 14, y)
    y += 8
    
    if (prescriptionData.medications.length === 0) {
      doc.setFont('helvetica', 'normal')
      doc.text('No medications prescribed', 20, y)
      y += 8
    } else {
      prescriptionData.medications.forEach((med, idx) => {
        doc.setFont('helvetica', 'bold')
        doc.text(`${idx + 1}. ${med.name}`, 20, y)
        y += 6
        doc.setFont('helvetica', 'normal')
        
        const details = [
          `Dosage: ${med.dosage}`,
          `Route: ${med.route}`,
          `Frequency: ${med.frequency}`,
          med.duration && `Duration: ${med.duration}`,
          med.quantity && `Quantity: ${med.quantity}`,
          med.instructions && `Instructions: ${med.instructions}`
        ].filter(Boolean)
        
        details.forEach(detail => {
          doc.text(`   ${detail}`, 25, y)
          y += 5
        })
        y += 3
      })
    }
    
    y += 10
    
    // Instructions section
    doc.setFont('helvetica', 'bold')
    doc.text('Important Instructions:', 14, y)
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const instructions = [
      '• Take medications exactly as prescribed',
      '• Do not stop taking medications without consulting your doctor',
      '• Store medications in a cool, dry place',
      '• Keep this prescription for your records',
      '• Contact your doctor if you experience any side effects'
    ]
    
    instructions.forEach(instruction => {
      doc.text(instruction, 20, y)
      y += 5
    })
    
    // Footer with signature area
    y = 250
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Doctor\'s Signature:', 14, y)
    doc.line(14, y + 2, 80, y + 2)
    y += 15
    doc.text('Date:', 14, y)
    doc.line(14, y + 2, 80, y + 2)
    
    // Clinic information in footer
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`${clinicInfo.name || doctorProfile.clinicName || 'MedicNote Clinic'} | Professional Medical Services`, 105, 280, { align: 'center' })
    if (clinicInfo.address || doctorProfile.clinicAddress) {
      doc.text(clinicInfo.address || doctorProfile.clinicAddress, 105, 285, { align: 'center' })
      doc.text(`Phone: ${clinicInfo.phone || doctorProfile.clinicPhone || ''} | Email: ${clinicInfo.email || doctorProfile.clinicEmail || ''}`, 105, 290, { align: 'center' })
      doc.text('This prescription is valid only when signed by a licensed physician', 105, 295, { align: 'center' })
    } else {
      doc.text('This prescription is valid only when signed by a licensed physician', 105, 285, { align: 'center' })
    }
    
    // Add QR code for digital verification
    if (qrCodeDataURL) {
      doc.addImage(qrCodeDataURL, 'PNG', 150, 240, 40, 40)
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(6)
      doc.text('Digital Verification', 170, 285, { align: 'center' })
    } else {
      // Fallback QR code placeholder
      doc.setFillColor(200, 200, 200)
      doc.rect(150, 240, 40, 40, 'F')
      doc.setTextColor(100, 100, 100)
      doc.setFontSize(6)
      doc.text('QR Code', 170, 260, { align: 'center' })
      doc.text('(Digital', 170, 265, { align: 'center' })
      doc.text('Verification)', 170, 270, { align: 'center' })
    }
    
    // Generate preview URL
    const pdfBlob = doc.output('blob')
    const url = URL.createObjectURL(pdfBlob)
    setPreviewUrl(url)
    setLoading(false)
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    }
    onClose()
  }

  return (
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
        padding: '2rem',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Prescription Preview</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            ×
          </button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div>Generating preview...</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <iframe
              src={previewUrl}
              style={{
                width: '100%',
                height: '60vh',
                border: '1px solid var(--border-color)',
                borderRadius: 8
              }}
              title="PDF Preview"
            />
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleDownload}
                style={{
                  background: 'var(--accent-color)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Download PDF
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFPreview 