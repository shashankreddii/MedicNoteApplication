import { useState, useEffect } from 'react'

function DoctorProfile({ onBack }) {
  const [doctorInfo, setDoctorInfo] = useState({
    name: '',
    license: '',
    phone: '',
    email: '',
    specialization: '',
    clinicName: 'MedicNote Clinic',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: ''
  })

  useEffect(() => {
    // Load from the same localStorage key as DoctorDashboard
    const savedSettings = localStorage.getItem('doctorSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      // Map the settings data to our format
      setDoctorInfo({
        name: settings.profile?.fullName || '',
        license: settings.clinic?.license || '',
        phone: settings.profile?.phone || '',
        email: settings.profile?.email || '',
        specialization: settings.profile?.specialization || '',
        clinicName: settings.clinic?.name || 'MedicNote Clinic',
        clinicAddress: settings.clinic?.address || '',
        clinicPhone: settings.clinic?.phone || '',
        clinicEmail: settings.clinic?.email || ''
      })
    }
  }, [])

  const handleSave = () => {
    // Save to the same localStorage key as DoctorDashboard
    const existingSettings = JSON.parse(localStorage.getItem('doctorSettings') || '{}')
    
    const updatedSettings = {
      ...existingSettings,
      profile: {
        ...existingSettings.profile,
        fullName: doctorInfo.name,
        phone: doctorInfo.phone,
        email: doctorInfo.email,
        specialization: doctorInfo.specialization
      },
      clinic: {
        ...existingSettings.clinic,
        name: doctorInfo.clinicName,
        address: doctorInfo.clinicAddress,
        phone: doctorInfo.clinicPhone,
        email: doctorInfo.clinicEmail,
        license: doctorInfo.license
      }
    }
    
    localStorage.setItem('doctorSettings', JSON.stringify(updatedSettings))
    alert('Doctor profile saved successfully!')
  }

  const handleChange = (field, value) => {
    setDoctorInfo(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '2rem',
      color: 'var(--text-primary)'
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        background: 'var(--card-bg)',
        borderRadius: 12,
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          {onBack && (
            <button 
              onClick={onBack}
              style={{
                background: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 6,
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              ← Back
            </button>
          )}
          <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Doctor Profile</h1>
        </div>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Personal Information */}
          <div>
            <h2 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>Personal Information</h2>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                <input
                  type="text"
                  value={doctorInfo.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Dr. John Doe"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Medical License Number</label>
                <input
                  type="text"
                  value={doctorInfo.license}
                  onChange={(e) => handleChange('license', e.target.value)}
                  placeholder="MD123456"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number</label>
                <input
                  type="tel"
                  value={doctorInfo.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                <input
                  type="email"
                  value={doctorInfo.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="doctor@medicnote.com"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Specialization</label>
                <input
                  type="text"
                  value={doctorInfo.specialization}
                  onChange={(e) => handleChange('specialization', e.target.value)}
                  placeholder="Cardiology, Internal Medicine, etc."
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

          {/* Clinic Information */}
          <div>
            <h2 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>Clinic Information</h2>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Clinic Name</label>
                <input
                  type="text"
                  value={doctorInfo.clinicName}
                  onChange={(e) => handleChange('clinicName', e.target.value)}
                  placeholder="MedicNote Clinic"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Clinic Address</label>
                <input
                  type="text"
                  value={doctorInfo.clinicAddress}
                  onChange={(e) => handleChange('clinicAddress', e.target.value)}
                  placeholder="123 Medical Center Dr, City, State"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Clinic Phone</label>
                <input
                  type="tel"
                  value={doctorInfo.clinicPhone}
                  onChange={(e) => handleChange('clinicPhone', e.target.value)}
                  placeholder="+1 (555) 987-6543"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Clinic Email</label>
                <input
                  type="email"
                  value={doctorInfo.clinicEmail}
                  onChange={(e) => handleChange('clinicEmail', e.target.value)}
                  placeholder="clinic@medicnote.com"
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

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button
              onClick={handleSave}
              style={{
                background: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600
              }}
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile 