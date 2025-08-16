import { useState, useEffect } from 'react'

function PatientList({ onBack, onSelectPatient, onViewDetails, refreshPatients = 0 }) {
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // Helper function to clean up duplicate "Dr." prefixes
  const cleanName = (name) => {
    if (!name) return name
    // Remove duplicate "Dr." prefixes
    return name.replace(/^Dr\.\s*Dr\.\s*/i, 'Dr. ')
  }

  const fetchPatients = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    fetch('http://localhost:8081/api/patients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch patients');
        return res.json();
      })
      .then(data => {
        setPatients(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching patients:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, [refreshPatients]); // Refetch when refreshPatients changes

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.diagnosis && patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handlePatientSelect = (patient) => {
    onSelectPatient(patient)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading patients...</div>
      </div>
    )
  }

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Dashboard
        </button>
        <h2>Patient List</h2>
        <button onClick={fetchPatients} className="refresh-btn" style={{ marginLeft: 'auto' }}>
          🔄 Refresh
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search patients by name or diagnosis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="patient-list">
        {filteredPatients.length === 0 ? (
          <div className="no-patients">
            <p>No patients found matching your search.</p>
          </div>
        ) : (
          filteredPatients.map(patient => (
            <div 
              key={patient.id} 
              className="patient-card"
              onClick={() => handlePatientSelect(patient)}
            >
              <div className="patient-info">
                <h3>{cleanName(patient.name)}</h3>
                <p className="patient-details">
                  {patient.age} years • {patient.gender} • {patient.contact || patient.phone || 'No contact'}
                </p>
                <p className="patient-diagnosis">
                  <strong>Diagnosis:</strong> {patient.diagnosis || 'No diagnosis'}
                </p>
                <p className="patient-last-visit">
                  <strong>Last Visit:</strong> {patient.lastVisit || 'No visit recorded'}
                </p>
              </div>
              <div className="patient-actions">
                <button className="view-btn" onClick={e => { e.stopPropagation(); onViewDetails && onViewDetails(patient); }}>View Details</button>
                <button className="prescription-btn">New Prescription</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="patient-list-footer">
        <p>Total Patients: {filteredPatients.length}</p>
      </div>
    </div>
  )
}

export default PatientList


