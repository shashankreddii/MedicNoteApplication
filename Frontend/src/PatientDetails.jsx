import { useState, useEffect } from 'react'

function PatientDetails({ patient, onBack, onEdit, onDelete }) {
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ ...patient })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // Helper function to clean up duplicate "Dr." prefixes
  const cleanName = (name) => {
    if (!name) return name
    // Remove duplicate "Dr." prefixes
    return name.replace(/^Dr\.\s*Dr\.\s*/i, 'Dr. ')
  }

  useEffect(() => {
    // Normalize patient data to ensure contact field is present
    const normalizedPatient = {
      ...patient,
      contact: patient.contact || patient.phone || ''
    }
    setForm(normalizedPatient)
  }, [patient])

  if (!patient) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEdit = () => {
    setEditMode(true)
    setMessage('')
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      if (onEdit) {
        // Normalize the data to ensure compatibility with backend
        const normalizedData = {
          ...form,
          contact: form.contact || form.phone || '', // Ensure contact field is present
          phone: undefined // Remove phone field to avoid confusion
        }
        
        await onEdit(normalizedData)
        setMessage('Patient updated successfully!')
        setMessageType('success')
        setEditMode(false)
      }
    } catch (error) {
      console.error('Error updating patient:', error)
      setMessage('Failed to update patient. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setForm({ ...patient })
    setMessage('')
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      if (onDelete) onDelete(patient.id)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '2rem',
      color: '#333'
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 12,
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={onBack}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginRight: '1rem',
              fontSize: '14px'
            }}
          >
            ← Back to Patients
          </button>
          <h1 style={{ margin: 0, color: '#333' }}>Patient Details</h1>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1rem',
            background: messageType === 'success' ? '#d4edda' : '#f8d7da',
            color: messageType === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        {/* Patient Information */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#007bff', marginBottom: '1rem', fontSize: '1.5rem' }}>
            Basic Information
          </h2>
          
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>
                Full Name *
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="name"
                  value={form.name || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  required
                />
              ) : (
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', color: '#333' }}>
                  {cleanName(patient.name)}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>
                Age
              </label>
              {editMode ? (
                <input
                  type="number"
                  name="age"
                  value={form.age || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  min="0"
                  max="150"
                />
              ) : (
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', color: '#333' }}>
                  {patient.age || 'Not specified'}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>
                Gender
              </label>
              {editMode ? (
                <select
                  name="gender"
                  value={form.gender || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', color: '#333' }}>
                  {patient.gender || 'Not specified'}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>
                Contact Number
              </label>
              {editMode ? (
                <input
                  type="tel"
                  name="contact"
                  value={form.contact || form.phone || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="+1 (555) 123-4567"
                />
              ) : (
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', color: '#333' }}>
                  {patient.contact || patient.phone || 'Not provided'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#007bff', marginBottom: '1rem', fontSize: '1.5rem' }}>
            Medical Information
          </h2>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>
                Diagnosis
              </label>
              {editMode ? (
                <textarea
                  name="diagnosis"
                  value={form.diagnosis || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Enter patient diagnosis..."
                />
              ) : (
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', color: '#333', minHeight: '60px' }}>
                  {patient.diagnosis || 'No diagnosis recorded'}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>
                Last Visit
              </label>
              {editMode ? (
                <input
                  type="date"
                  name="lastVisit"
                  value={form.lastVisit || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              ) : (
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', color: '#333' }}>
                  {patient.lastVisit || 'No visit recorded'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#007bff', marginBottom: '1rem', fontSize: '1.5rem' }}>
            Additional Information
          </h2>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666' }}>
                Notes
              </label>
              {editMode ? (
                <textarea
                  name="notes"
                  value={form.notes || ''}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="Additional notes about the patient..."
                />
              ) : (
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '8px', color: '#333', minHeight: '80px' }}>
                  {patient.notes || 'No additional notes'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '1rem', 
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #ddd'
        }}>
          {editMode ? (
            <>
              <button 
                onClick={handleCancel}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: '#6c757d',
                  color: 'white'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: '#007bff',
                  color: 'white',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleEdit}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: '#007bff',
                  color: 'white'
                }}
              >
                Edit Patient
              </button>
              <button 
                onClick={handleDelete}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: '#dc3545',
                  color: 'white'
                }}
              >
                Delete Patient
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientDetails 