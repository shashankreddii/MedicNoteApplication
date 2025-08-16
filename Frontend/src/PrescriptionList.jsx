import React, { useEffect, useState } from 'react';

const PrescriptionList = ({ onBack }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/prescriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch prescriptions');
      
      const data = await response.json();
      setPrescriptions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Refresh prescriptions when component comes into focus
  useEffect(() => {
    const handleFocus = () => {
      fetchPrescriptions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Parse medications JSON for display
  const parseMedications = (medicationsJson) => {
    try {
      const medications = JSON.parse(medicationsJson);
      // Handle both array of strings and array of objects
      if (Array.isArray(medications)) {
        return medications.map(med => {
          if (typeof med === 'string') {
            return med; // Return the string as is
          } else if (med && typeof med === 'object') {
            return `${med.name || ''} ${med.dosage || ''}`.trim();
          }
          return '';
        }).filter(med => med).join(', ');
      }
      return medicationsJson || 'No medications';
    } catch (e) {
      return medicationsJson || 'No medications';
    }
  };

  // Get prescription status
  const getPrescriptionStatus = (validUntil) => {
    if (!validUntil) return 'active';
    const today = new Date();
    const validDate = new Date(validUntil);
    if (validDate < today) return 'expired';
    if (validDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) return 'expiring';
    return 'active';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'expiring': return '#f59e0b';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Filter and sort prescriptions
  const filteredPrescriptions = prescriptions
    .filter(p => {
      const matchesSearch = 
        (p.patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.doctorNotes || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || getPrescriptionStatus(p.validUntil) === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.prescriptionDate || 0);
          bValue = new Date(b.prescriptionDate || 0);
          break;
        case 'patient':
          aValue = (a.patient?.name || '').toLowerCase();
          bValue = (b.patient?.name || '').toLowerCase();
          break;
        case 'diagnosis':
          aValue = (a.diagnosis || '').toLowerCase();
          bValue = (b.diagnosis || '').toLowerCase();
          break;
        default:
          aValue = new Date(a.prescriptionDate || 0);
          bValue = new Date(b.prescriptionDate || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleDownloadPDF = (prescription) => {
    // This would integrate with your PDF generation logic
    console.log('Downloading PDF for prescription:', prescription.id);
  };

  const handleViewDetails = (prescription) => {
    // This would show prescription details in a modal or navigate to details page
    console.log('Viewing details for prescription:', prescription.id);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '1.2rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          Loading prescriptions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#ef4444',
        fontSize: '1.1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '2rem',
      color: 'var(--text-primary)'
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        background: 'var(--card-bg)',
        borderRadius: 12,
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
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
            <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '2rem' }}>
              📋 Prescriptions ({filteredPrescriptions.length})
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={fetchPrescriptions}
              disabled={loading}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                opacity: loading ? 0.7 : 1
              }}
            >
              🔄 {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
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
              💊 New Prescription
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: '1rem',
          marginBottom: '2rem',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search prescriptions by patient, diagnosis, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)'
            }}>
              🔍
            </span>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="patient-asc">Patient (A-Z)</option>
            <option value="patient-desc">Patient (Z-A)</option>
            <option value="diagnosis-asc">Diagnosis (A-Z)</option>
            <option value="diagnosis-desc">Diagnosis (Z-A)</option>
          </select>
        </div>

        {/* Prescriptions Table */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'var(--card-bg)'
          }}>
            <thead>
              <tr style={{
                background: 'var(--bg-tertiary)',
                borderBottom: '2px solid var(--border-color)'
              }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Patient
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Diagnosis
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Prescribed Date
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Valid Until
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Status
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Medications
                </th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '1.1rem'
                  }}>
                    <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>📋</div>
                    No prescriptions found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((prescription, index) => {
                  const status = getPrescriptionStatus(prescription.validUntil);
                  const statusColor = getStatusColor(status);
                  
                  return (
                    <tr key={prescription.id} style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.closest('tr').style.background = 'var(--bg-secondary)'}
                    onMouseOut={(e) => e.target.closest('tr').style.background = 'var(--card-bg)'}
                    >
                      <td style={{
                        padding: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)'
                      }}>
                        <div>
                          <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                            {prescription.patient?.name || 'Unknown Patient'}
                          </div>
                          {prescription.patient && (
                            <div style={{
                              fontSize: '0.85rem',
                              color: 'var(--text-secondary)'
                            }}>
                              ID: {prescription.patient.id} • {prescription.patient.age} years
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        color: 'var(--text-primary)',
                        maxWidth: '200px'
                      }}>
                        <div style={{
                          fontSize: '0.9rem',
                          fontWeight: 500
                        }}>
                          {prescription.diagnosis || 'No diagnosis'}
                        </div>
                        {prescription.doctorNotes && (
                          <div style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            marginTop: '0.25rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {prescription.doctorNotes}
                          </div>
                        )}
                      </td>
                      <td style={{
                        padding: '1rem',
                        color: 'var(--text-primary)'
                      }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                          {prescription.prescriptionDate ? new Date(prescription.prescriptionDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        color: 'var(--text-primary)'
                      }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                          {prescription.validUntil ? new Date(prescription.validUntil).toLocaleDateString() : 'No expiry'}
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem'
                      }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: `${statusColor}20`,
                          color: statusColor,
                          border: `1px solid ${statusColor}40`
                        }}>
                          {status}
                        </span>
                      </td>
                      <td style={{
                        padding: '1rem',
                        maxWidth: '250px'
                      }}>
                        <div style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          lineHeight: '1.4'
                        }}>
                          {parseMedications(prescription.medicationsJson)}
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          justifyContent: 'center'
                        }}>
                          <button
                            onClick={() => handleViewDetails(prescription)}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 500
                            }}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(prescription)}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 500
                            }}
                            title="Download PDF"
                          >
                            📄
                          </button>
                          <button
                            style={{
                              background: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 500
                            }}
                            title="Edit Prescription"
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderRadius: 8,
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <div>
            Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              Active: {prescriptions.filter(p => getPrescriptionStatus(p.validUntil) === 'active').length}
            </div>
            <div>
              Expiring: {prescriptions.filter(p => getPrescriptionStatus(p.validUntil) === 'expiring').length}
            </div>
            <div>
              Expired: {prescriptions.filter(p => getPrescriptionStatus(p.validUntil) === 'expired').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionList; 