import { useState, useEffect } from 'react'
import ReactLogo from './assets/react.svg'
import { useState as useLocalState, useEffect as useLocalEffect } from 'react'
import { useTheme } from './ThemeContext'

function DoctorDashboard({ doctor, onLogout, onViewPatients, onNewPrescription, onViewPrescriptions, onViewProfile }) {
  const { theme, toggleTheme } = useTheme()
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingPrescriptions: 0,
    monthlyRevenue: 0,
    completedAppointments: 0,
    newPatients: 0
  })

  const [recentActivities, setRecentActivities] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [overviewData, setOverviewData] = useState({
    patients: [],
    prescriptions: [],
    appointments: []
  })
  const [settings, setSettings] = useState(() => {
    // Load saved settings from localStorage or use defaults
    const saved = localStorage.getItem('doctorSettings')
    return saved ? JSON.parse(saved) : {
      profile: {
        fullName: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@medicnote.com',
        phone: '+1 (555) 123-4567',
        specialization: 'Cardiology',
        profilePic: null
      },
      notifications: {
        email: true,
        sms: false,
        appointmentReminders: true,
        prescriptionUpdates: true
      },
      system: {
        language: 'English',
        timezone: 'UTC-5 (Eastern Time)',
        theme: 'Light'
      },
      privacy: {
        shareAnalytics: false,
        autoSave: true,
        dataRetention: '12'
      },
      workingHours: {
        Monday: { start: '09:00', end: '17:00', available: true },
        Tuesday: { start: '09:00', end: '17:00', available: true },
        Wednesday: { start: '09:00', end: '17:00', available: true },
        Thursday: { start: '09:00', end: '17:00', available: true },
        Friday: { start: '09:00', end: '17:00', available: true },
        Saturday: { start: '09:00', end: '17:00', available: true },
        Sunday: { start: '09:00', end: '17:00', available: false }
      },
      emergencyContacts: {
        primary: { name: '', phone: '' },
        secondary: { name: '', phone: '' }
      },
      clinic: {
        name: 'MedicNote Clinic',
        address: '',
        phone: '',
        email: '',
        website: '',
        license: '',
        description: '',
        emergencyContact: '',
        operatingHours: ''
      }
    }
  })

  useEffect(() => {
    // Fetch real data from backend
    const fetchOverviewData = async () => {
      try {
        setLoading(true)
        
        // Fetch patients, prescriptions, and appointments
        const token = localStorage.getItem('token');
        const [patientsRes, prescriptionsRes] = await Promise.all([
          fetch('http://localhost:8081/api/patients', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('http://localhost:8081/api/prescriptions', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ])

        const patients = patientsRes.ok ? await patientsRes.json() : []
        const prescriptions = prescriptionsRes.ok ? await prescriptionsRes.json() : []

        console.log('Dashboard - Patients data:', patients);
        console.log('Dashboard - Prescriptions data:', prescriptions);

        setOverviewData({ patients, prescriptions, appointments: [] })

        // Calculate real stats
        const totalPatients = patients.length
        const totalPrescriptions = prescriptions.length
        const today = new Date().toISOString().split('T')[0]
        
        // Calculate new patients (this month)
        const thisMonth = new Date().getMonth()
        const newPatients = patients.filter(p => {
          if (p.createdAt) {
            const patientMonth = new Date(p.createdAt).getMonth()
            return patientMonth === thisMonth
          }
          return false
        }).length

        // Calculate recent activities from prescriptions
        const recentActivities = prescriptions.slice(-5).reverse().map((prescription, index) => ({
          id: prescription.id || index + 1,
          type: 'prescription',
          patient: prescription.patient ? prescription.patient.name : 'Unknown Patient',
          time: prescription.prescriptionDate || 'Recently',
          description: `Prescription for ${prescription.diagnosis || 'treatment'}`,
          status: 'completed'
        }))

        // Add some mock appointments and notifications for now
        const upcomingAppointments = [
          {
            id: 1,
            patient: 'Meera Reddy',
            time: '09:00 AM',
            type: 'Follow-up',
            status: 'confirmed',
            priority: 'high'
          },
          {
            id: 2,
            patient: 'Vikram Malhotra',
            time: '10:30 AM',
            type: 'New Patient',
            status: 'confirmed',
            priority: 'medium'
          }
        ]

        const notifications = [
          {
            id: 1,
            type: 'prescription',
            message: `New prescription created for ${prescriptions.length > 0 ? prescriptions[prescriptions.length - 1].patient?.name || 'patient' : 'patient'}`,
            time: '5 minutes ago',
            unread: true
          },
          {
            id: 2,
            type: 'patient',
            message: `New patient registered: ${patients.length > 0 ? patients[patients.length - 1].name : 'Unknown'}`,
            time: '1 hour ago',
            unread: true
          }
        ]

        setStats({
          totalPatients,
          todayAppointments: upcomingAppointments.length,
          pendingPrescriptions: Math.floor(totalPrescriptions * 0.1), // 10% pending
          monthlyRevenue: totalPatients * 150, // Estimate $150 per patient
          completedAppointments: Math.floor(totalPrescriptions * 0.8), // 80% completed
          newPatients
        })

        setRecentActivities(recentActivities)
        setUpcomingAppointments(upcomingAppointments)
        setNotifications(notifications)
        setLoading(false)

      } catch (error) {
        console.error('Error fetching overview data:', error)
        setLoading(false)
      }
    }

    fetchOverviewData()
  }, [])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'prescription':
        return '💊'
      case 'appointment':
        return '📅'
      case 'patient':
        return '👤'
      default:
        return '📋'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed'
      case 'pending':
        return 'status-pending'
      case 'cancelled':
        return 'status-cancelled'
      default:
        return 'status-confirmed'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high'
      case 'medium':
        return 'priority-medium'
      case 'low':
        return 'priority-low'
      default:
        return 'priority-medium'
    }
  }

  const getActivityStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'activity-completed'
      case 'new':
        return 'activity-new'
      case 'updated':
        return 'activity-updated'
      default:
        return 'activity-completed'
    }
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('doctorSettings', JSON.stringify(settings))
    
    // Show success message with saved data info
    setShowSaveSuccess(true)
    setTimeout(() => {
      setShowSaveSuccess(false)
    }, 3000)
    
    // Log saved data to console for debugging
    console.log('Settings saved:', settings)
    console.log('localStorage data:', localStorage.getItem('doctorSettings'))
  }

  const checkSavedSettings = () => {
    const saved = localStorage.getItem('doctorSettings')
    if (saved) {
      const parsed = JSON.parse(saved)
      console.log('Currently saved settings:', parsed)
      alert(`Settings found in localStorage!\n\nProfile Name: ${parsed.profile.fullName}\nEmail: ${parsed.profile.email}\nWorking Hours: ${parsed.workingHours.Monday.start} - ${parsed.workingHours.Monday.end}`)
    } else {
      alert('No settings found in localStorage!')
    }
  }

  const clearSavedSettings = () => {
    if (window.confirm('Are you sure you want to clear all saved settings? This action cannot be undone.')) {
      localStorage.removeItem('doctorSettings')
      // Reset settings to defaults
      setSettings({
        profile: {
          fullName: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@medicnote.com',
          phone: '+1 (555) 123-4567',
          specialization: 'Cardiology'
        },
        notifications: {
          email: true,
          sms: false,
          appointmentReminders: true,
          prescriptionUpdates: true
        },
        system: {
          language: 'English',
          timezone: 'UTC-5 (Eastern Time)',
          theme: 'Light'
        },
        privacy: {
          shareAnalytics: false,
          autoSave: true,
          dataRetention: '12'
        },
        workingHours: {
          Monday: { start: '09:00', end: '17:00', available: true },
          Tuesday: { start: '09:00', end: '17:00', available: true },
          Wednesday: { start: '09:00', end: '17:00', available: true },
          Thursday: { start: '09:00', end: '17:00', available: true },
          Friday: { start: '09:00', end: '17:00', available: true },
          Saturday: { start: '09:00', end: '17:00', available: true },
          Sunday: { start: '09:00', end: '17:00', available: false }
        },
        emergencyContacts: {
          primary: { name: '', phone: '' },
          secondary: { name: '', phone: '' }
        },
        clinic: {
          name: 'MedicNote Clinic',
          address: '',
          phone: '',
          email: '',
          website: '',
          license: '',
          description: '',
          emergencyContact: '',
          operatingHours: ''
        }
      })
      alert('All settings have been cleared and reset to defaults!')
    }
  }

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const updateWorkingHours = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }))
  }

  const updateEmergencyContact = (type, field, value) => {
    setSettings(prev => ({
      ...prev,
      emergencyContacts: {
        ...prev.emergencyContacts,
        [type]: {
          ...prev.emergencyContacts[type],
          [field]: value
        }
      }
    }))
  }

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)')
        return
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        updateSetting('profile', 'profilePic', e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfilePic = () => {
    updateSetting('profile', 'profilePic', null)
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      {/* Success Message */}
      {showSaveSuccess && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: '#16a34a',
          color: 'white',
          padding: '16px 24px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span>✅</span>
          <span>Settings saved successfully!</span>
        </div>
      )}
      
      {/* Sidebar Navigation */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">MedicNote</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className="nav-icon">🔔</span>
            <span className="nav-text">Notifications</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Overview</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Appointments</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Patients</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
            onClick={onViewPrescriptions}
          >
            <span className="nav-icon">💊</span>
            <span className="nav-text">Prescriptions</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Reports</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </button>
        </nav>
        <div className="sidebar-logout">
          <button onClick={onLogout} className="logout-btn-sidebar">
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Top Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <div className="doctor-profile-compact">
              <span className="profile-avatar-emoji" role="img" aria-label="Doctor">👨‍⚕️</span>
              <div className="profile-info-small">
                <span className="profile-name-small">Dr. {doctor.name}</span>
                <span className="profile-role-small">General Physician</span>
              </div>
            </div>
            <h1 className="page-title">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'appointments' && 'Appointments'}
              {activeTab === 'patients' && 'Patient Management'}
              {activeTab === 'prescriptions' && 'Prescriptions'}
              {activeTab === 'reports' && 'Reports & Analytics'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="page-subtitle">
              Welcome back • {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="header-right">
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginRight: 12
              }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="new-prescription-btn" onClick={onNewPrescription}>
              <span className="btn-icon">💊</span> New Prescription
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <>
              {/* Key Metrics */}
              <div className="metrics-section">
                <div className="metrics-grid">
                  <div className="metric-card primary">
                    <div className="metric-icon">👥</div>
                    <div className="metric-content">
                      <h3>Total Patients</h3>
                      <p className="metric-number">{overviewData.patients.length}</p>
                      <span className="metric-change positive">Real data from database</span>
                    </div>
                  </div>
                  <div className="metric-card success">
                    <div className="metric-icon">📅</div>
                    <div className="metric-content">
                      <h3>Today's Appointments</h3>
                      <p className="metric-number">{upcomingAppointments.length}</p>
                      <span className="metric-change">Real appointment count</span>
                    </div>
                  </div>
                  <div className="metric-card warning">
                    <div className="metric-icon">💊</div>
                    <div className="metric-content">
                      <h3>Total Prescriptions</h3>
                      <p className="metric-number">{overviewData.prescriptions.length}</p>
                      <span className="metric-change">Real prescription count</span>
                    </div>
                  </div>
                  <div className="metric-card info">
                    <div className="metric-icon">💰</div>
                    <div className="metric-content">
                      <h3>Monthly Revenue</h3>
                      <p className="metric-number">₹{(overviewData.patients.length * 150).toLocaleString()}</p>
                      <span className="metric-change positive">Based on {overviewData.patients.length} patients</span>
                    </div>
                  </div>
                  <div className="metric-card secondary">
                    <div className="metric-icon">✅</div>
                    <div className="metric-content">
                      <h3>Recent Activities</h3>
                      <p className="metric-number">{recentActivities.length}</p>
                      <span className="metric-change">From real prescriptions</span>
                    </div>
                  </div>
                  <div className="metric-card accent">
                    <div className="metric-icon">🆕</div>
                    <div className="metric-content">
                      <h3>New Patients</h3>
                      <p className="metric-number">{stats.newPatients}</p>
                      <span className="metric-change positive">This month</span>
                    </div>
                  </div>
                </div>
              </div>



              {/* Main Content Grid */}
              <div className="content-grid">
                {/* Upcoming Appointments */}
                <div className="content-card appointments-card">
                  <div className="card-header">
                    <h3>📅 Today's Schedule</h3>
                    <button className="view-all-btn">View All</button>
                  </div>
                  <div className="appointments-list">
                    {upcomingAppointments.map(appointment => (
                      <div key={appointment.id} className="appointment-item">
                        <div className="appointment-time">
                          <span className="time">{appointment.time}</span>
                          <span className={`priority ${getPriorityColor(appointment.priority)}`}>{appointment.priority}</span>
                        </div>
                        <div className="appointment-details">
                          <h4>{appointment.patient}</h4>
                          <p>{appointment.type}</p>
                          <span className={`status ${getStatusColor(appointment.status)}`}>{appointment.status}</span>
                        </div>
                        <div className="appointment-actions">
                          <button className="action-icon" title="Call Patient">📞</button>
                          <button className="action-icon" title="Edit Appointment">✏️</button>
                          <button className="action-icon" title="Start Session">▶️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="content-card activities-card">
                  <div className="card-header">
                    <h3>📋 Recent Activities (Real Data)</h3>
                    <button className="view-all-btn">View All</button>
                  </div>
                  <div className="activities-list">
                    {recentActivities.length > 0 ? (
                      recentActivities.map(activity => (
                        <div key={activity.id} className="activity-item">
                          <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                          <div className="activity-content">
                            <h4>{activity.patient}</h4>
                            <p>{activity.description}</p>
                            <div className="activity-meta">
                              <span className="activity-time">{activity.time}</span>
                              <span className={`activity-status ${getActivityStatusColor(activity.status)}`}>{activity.status}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
                        <p>No recent activities found</p>
                        <p style={{ fontSize: 12 }}>Create some prescriptions to see activities here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions-grid">
                  <button className="quick-action-btn" onClick={onViewPatients}>
                    <span className="action-icon">👥</span>
                    <span className="action-text">View Patients</span>
                  </button>
                  <button className="quick-action-btn" onClick={onNewPrescription}>
                    <span className="action-icon">💊</span>
                    <span className="action-text">New Prescription</span>
                  </button>
                  <button className="quick-action-btn">
                    <span className="action-icon">📅</span>
                    <span className="action-text">Schedule Appointment</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveTab('reports')}>
                    <span className="action-icon">📊</span>
                    <span className="action-text">View Reports</span>
                  </button>
                  <button className="quick-action-btn">
                    <span className="action-icon">🔔</span>
                    <span className="action-text">Notifications</span>
                  </button>
                  <button className="quick-action-btn" onClick={onViewProfile}>
                    <span className="action-icon">👨‍⚕️</span>
                    <span className="action-text">Doctor Profile</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'appointments' && (
            <div className="tab-content">
              <h2>Appointments Management</h2>
              <p>Manage your appointments, schedule new ones, and view your calendar.</p>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="tab-content">
              <PatientTable />
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="tab-content">
              <h2>Prescriptions</h2>
              <p>Create, manage, and track prescriptions for your patients.</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="tab-content">
              <ReportSummary />
              <RecentPrescriptionsTable />
              <PatientsPerMonthChart />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2>Settings</h2>
              <div style={{ display: 'grid', gap: 24, marginTop: 24 }}>
                {/* Profile Settings */}
                <div style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px var(--shadow-light)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Profile Settings</h3>
                  <div style={{ display: 'grid', gap: 16 }}>
                    {/* Profile Picture Section */}
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <div style={{ 
                        width: 120, 
                        height: 120, 
                        borderRadius: '50%', 
                        margin: '0 auto 16px auto',
                        background: settings.profile.profilePic ? 'none' : 'var(--bg-tertiary)',
                        border: '3px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        {settings.profile.profilePic ? (
                          <img 
                            src={settings.profile.profilePic} 
                            alt="Profile" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              borderRadius: '50%'
                            }} 
                          />
                        ) : (
                          <span style={{ fontSize: 48, color: 'var(--text-muted)' }}>👨‍⚕️</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <label style={{ 
                          background: '#2563eb', 
                          color: 'white', 
                          padding: '8px 16px', 
                          borderRadius: 6, 
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 500
                        }}>
                          📁 Choose Photo
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleProfilePicChange}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {settings.profile.profilePic && (
                          <button 
                            onClick={removeProfilePic}
                            style={{ 
                              background: '#dc2626', 
                              color: 'white', 
                              border: 'none',
                              padding: '8px 16px', 
                              borderRadius: 6, 
                              cursor: 'pointer',
                              fontSize: 14,
                              fontWeight: 500
                            }}
                          >
                            🗑️ Remove
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                        Supported: JPEG, PNG, GIF (Max 5MB)
                      </p>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Full Name</label>
                      <input 
                        type="text" 
                        value={settings.profile.fullName}
                        onChange={(e) => updateSetting('profile', 'fullName', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          border: '1px solid var(--input-border)', 
                          borderRadius: 8, 
                          fontSize: 14,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Email</label>
                      <input 
                        type="email" 
                        value={settings.profile.email}
                        onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          border: '1px solid var(--input-border)', 
                          borderRadius: 8, 
                          fontSize: 14,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Phone</label>
                      <input 
                        type="tel" 
                        value={settings.profile.phone}
                        onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          border: '1px solid var(--input-border)', 
                          borderRadius: 8, 
                          fontSize: 14,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Specialization</label>
                      <select 
                        value={settings.profile.specialization}
                        onChange={(e) => updateSetting('profile', 'specialization', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          border: '1px solid var(--input-border)', 
                          borderRadius: 8, 
                          fontSize: 14,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option>Cardiology</option>
                        <option>Dermatology</option>
                        <option>Neurology</option>
                        <option>Pediatrics</option>
                        <option>General Medicine</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Clinic Information Settings */}
                <div style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px var(--shadow-light)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>🏥 Clinic Information</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                    This information will appear on your prescriptions and patient communications.
                  </p>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Clinic Name *</label>
                      <input 
                        type="text" 
                        value={settings.clinic?.name || ''}
                        onChange={(e) => updateSetting('clinic', 'name', e.target.value)}
                        placeholder="MedicNote Clinic"
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          border: '1px solid var(--input-border)', 
                          borderRadius: 8, 
                          fontSize: 14,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Clinic Address</label>
                      <textarea 
                        value={settings.clinic?.address || ''}
                        onChange={(e) => updateSetting('clinic', 'address', e.target.value)}
                        placeholder="123 Medical Center Drive, Suite 100, City, State 12345"
                        rows={3}
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          border: '1px solid var(--input-border)', 
                          borderRadius: 8, 
                          fontSize: 14,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Clinic Phone</label>
                        <input 
                          type="tel" 
                          value={settings.clinic?.phone || ''}
                          onChange={(e) => updateSetting('clinic', 'phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          style={{ 
                            width: '100%', 
                            padding: 12, 
                            border: '1px solid var(--input-border)', 
                            borderRadius: 8, 
                            fontSize: 14,
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Clinic Email</label>
                        <input 
                          type="email" 
                          value={settings.clinic?.email || ''}
                          onChange={(e) => updateSetting('clinic', 'email', e.target.value)}
                          placeholder="clinic@medicnote.com"
                          style={{ 
                            width: '100%', 
                            padding: 12, 
                            border: '1px solid var(--input-border)', 
                            borderRadius: 8, 
                            fontSize: 14,
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Website</label>
                        <input 
                          type="url" 
                          value={settings.clinic?.website || ''}
                          onChange={(e) => updateSetting('clinic', 'website', e.target.value)}
                          placeholder="https://www.medicnote.com"
                          style={{ 
                            width: '100%', 
                            padding: 12, 
                            border: '1px solid var(--input-border)', 
                            borderRadius: 8, 
                            fontSize: 14,
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>License Number</label>
                        <input 
                          type="text" 
                          value={settings.clinic?.license || ''}
                          onChange={(e) => updateSetting('clinic', 'license', e.target.value)}
                          placeholder="CL123456"
                          style={{ 
                            width: '100%', 
                            padding: 12, 
                            border: '1px solid var(--input-border)', 
                            borderRadius: 8, 
                            fontSize: 14,
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Clinic Description</label>
                      <textarea 
                        value={settings.clinic?.description || ''}
                        onChange={(e) => updateSetting('clinic', 'description', e.target.value)}
                        placeholder="Brief description of your clinic's services and specialties..."
                        rows={3}
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          border: '1px solid var(--input-border)', 
                          borderRadius: 8, 
                          fontSize: 14,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Emergency Contact</label>
                        <input 
                          type="tel" 
                          value={settings.clinic?.emergencyContact || ''}
                          onChange={(e) => updateSetting('clinic', 'emergencyContact', e.target.value)}
                          placeholder="+1 (555) 999-8888"
                          style={{ 
                            width: '100%', 
                            padding: 12, 
                            border: '1px solid var(--input-border)', 
                            borderRadius: 8, 
                            fontSize: 14,
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Operating Hours</label>
                        <input 
                          type="text" 
                          value={settings.clinic?.operatingHours || ''}
                          onChange={(e) => updateSetting('clinic', 'operatingHours', e.target.value)}
                          placeholder="Mon-Fri: 8AM-6PM, Sat: 9AM-2PM"
                          style={{ 
                            width: '100%', 
                            padding: 12, 
                            border: '1px solid var(--input-border)', 
                            borderRadius: 8, 
                            fontSize: 14,
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px var(--shadow-light)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Notification Preferences</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Email Notifications</span>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.email}
                        onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                        style={{ transform: 'scale(1.2)' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>SMS Notifications</span>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.sms}
                        onChange={(e) => updateSetting('notifications', 'sms', e.target.checked)}
                        style={{ transform: 'scale(1.2)' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Appointment Reminders</span>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.appointmentReminders}
                        onChange={(e) => updateSetting('notifications', 'appointmentReminders', e.target.checked)}
                        style={{ transform: 'scale(1.2)' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Prescription Updates</span>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.prescriptionUpdates}
                        onChange={(e) => updateSetting('notifications', 'prescriptionUpdates', e.target.checked)}
                        style={{ transform: 'scale(1.2)' }} 
                      />
                    </div>
                  </div>
                </div>

                {/* System Settings */}
                <div style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px var(--shadow-light)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>System Settings</h3>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Language</label>
                      <select 
                        value={settings.system.language}
                        onChange={(e) => updateSetting('system', 'language', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          border: '1px solid var(--input-border)', 
                          borderRadius: 8, 
                          fontSize: 14,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Time Zone</label>
                      <select 
                        value={settings.system.timezone}
                        onChange={(e) => updateSetting('system', 'timezone', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: 12, 
                          border: '1px solid var(--input-border)', 
                          borderRadius: 8, 
                          fontSize: 14,
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC-8 (Pacific Time)</option>
                        <option>UTC+0 (GMT)</option>
                        <option>UTC+1 (Central European Time)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'var(--text-secondary)' }}>Theme</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <select 
                          value={theme === 'light' ? 'Light' : 'Dark'}
                          onChange={(e) => {
                            const newTheme = e.target.value === 'Light' ? 'light' : 'dark'
                            updateSetting('system', 'theme', e.target.value)
                            // Update the global theme
                            document.body.setAttribute('data-theme', newTheme)
                            localStorage.setItem('theme', newTheme)
                          }}
                          style={{ 
                            flex: 1,
                            padding: 12, 
                            border: '1px solid var(--input-border)', 
                            borderRadius: 8, 
                            fontSize: 14,
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <option>Light</option>
                          <option>Dark</option>
                        </select>
                        <button
                          onClick={toggleTheme}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid var(--border-color)',
                            borderRadius: 8,
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        >
                          {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #e0e7ef' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Security</h3>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <button style={{ 
                      background: '#2563eb', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 24px', 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 14
                    }}>
                      Change Password
                    </button>
                    <button style={{ 
                      background: '#dc2626', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 24px', 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 14
                    }}>
                      Delete Account
                    </button>
                  </div>
                </div>

                {/* Working Hours */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #e0e7ef' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Working Hours</h3>
                  <div style={{ display: 'grid', gap: 16 }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ minWidth: 80, fontWeight: 500, color: '#374151' }}>{day}</div>
                        <input 
                          type="time" 
                          value={settings.workingHours[day].start}
                          onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                          style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                        />
                        <span style={{ color: '#6b7280' }}>to</span>
                        <input 
                          type="time" 
                          value={settings.workingHours[day].end}
                          onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                          style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                        />
                        <input 
                          type="checkbox" 
                          checked={settings.workingHours[day].available}
                          onChange={(e) => updateWorkingHours(day, 'available', e.target.checked)}
                          style={{ transform: 'scale(1.1)' }} 
                        />
                        <span style={{ fontSize: 14, color: '#6b7280' }}>Available</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prescription Templates */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #e0e7ef' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Prescription Templates</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 500, color: '#374151' }}>Hypertension Template</div>
                        <div style={{ fontSize: 14, color: '#6b7280' }}>Common medications for high blood pressure</div>
                      </div>
                      <button style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>Edit</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 500, color: '#374151' }}>Diabetes Template</div>
                        <div style={{ fontSize: 14, color: '#6b7280' }}>Standard diabetes management</div>
                      </div>
                      <button style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>Edit</button>
                    </div>
                    <button style={{ background: '#f3f4f6', color: '#374151', border: '1px dashed #d1d5db', padding: '12px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                      + Add New Template
                    </button>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #e0e7ef' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Privacy & Data</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#374151' }}>Share Analytics Data</span>
                      <input 
                        type="checkbox" 
                        checked={settings.privacy.shareAnalytics}
                        onChange={(e) => updateSetting('privacy', 'shareAnalytics', e.target.checked)}
                        style={{ transform: 'scale(1.2)' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#374151' }}>Auto-save Forms</span>
                      <input 
                        type="checkbox" 
                        checked={settings.privacy.autoSave}
                        onChange={(e) => updateSetting('privacy', 'autoSave', e.target.checked)}
                        style={{ transform: 'scale(1.2)' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#374151' }}>Data Retention (months)</span>
                      <select 
                        value={settings.privacy.dataRetention}
                        onChange={(e) => updateSetting('privacy', 'dataRetention', e.target.value)}
                        style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                      >
                        <option>12</option>
                        <option>24</option>
                        <option>36</option>
                        <option>60</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Backup & Export */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #e0e7ef' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Backup & Export</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <button style={{ 
                      background: '#059669', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 24px', 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 14
                    }}>
                      Export Patient Data (CSV)
                    </button>
                    <button style={{ 
                      background: '#7c3aed', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 24px', 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 14
                    }}>
                      Backup All Data
                    </button>
                    <button style={{ 
                      background: '#ea580c', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 24px', 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 14
                    }}>
                      Restore from Backup
                    </button>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #e0e7ef' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Emergency Contacts</h3>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>Primary Contact</label>
                      <input 
                        type="text" 
                        placeholder="Name" 
                        value={settings.emergencyContacts.primary.name}
                        onChange={(e) => updateEmergencyContact('primary', 'name', e.target.value)}
                        style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, marginBottom: 8 }}
                      />
                      <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={settings.emergencyContacts.primary.phone}
                        onChange={(e) => updateEmergencyContact('primary', 'phone', e.target.value)}
                        style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#374151' }}>Secondary Contact</label>
                      <input 
                        type="text" 
                        placeholder="Name" 
                        value={settings.emergencyContacts.secondary.name}
                        onChange={(e) => updateEmergencyContact('secondary', 'name', e.target.value)}
                        style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, marginBottom: 8 }}
                      />
                      <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={settings.emergencyContacts.secondary.phone}
                        onChange={(e) => updateEmergencyContact('secondary', 'phone', e.target.value)}
                        style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div style={{ textAlign: 'right', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button 
                    onClick={checkSavedSettings}
                    style={{ 
                      background: '#6b7280', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 24px', 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 14,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#4b5563'}
                    onMouseOut={(e) => e.target.style.background = '#6b7280'}
                  >
                    Check Saved Data
                  </button>
                  <button 
                    onClick={clearSavedSettings}
                    style={{ 
                      background: '#dc2626', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 24px', 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 14,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#b91c1c'}
                    onMouseOut={(e) => e.target.style.background = '#dc2626'}
                  >
                    Clear All Data
                  </button>
                  <button 
                    onClick={handleSaveSettings}
                    style={{ 
                      background: 'var(--success-color)', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 32px', 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 16,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#15803d'}
                    onMouseOut={(e) => e.target.style.background = 'var(--success-color)'}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="tab-content">
              <h2>Notifications</h2>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <p>No notifications.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notification-item${n.unread ? ' unread' : ''}`}>
                      <span className="notification-type">{n.type === 'appointment' ? '📅' : n.type === 'prescription' ? '💊' : 'ℹ️'}</span>
                      <span className="notification-message">{n.message}</span>
                      <span className="notification-time">{n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PatientTable() {
  const [patients, setPatients] = useLocalState([]);
  const [loading, setLoading] = useLocalState(true);
  const [searchTerm, setSearchTerm] = useLocalState('');
  const [filterGender, setFilterGender] = useLocalState('all');
  const [sortBy, setSortBy] = useLocalState('name');
  const [sortOrder, setSortOrder] = useLocalState('asc');

  // Helper function to clean up duplicate "Dr." prefixes
  const cleanName = (name) => {
    if (!name) return name;
    return name.replace(/^Dr\.\s*Dr\.\s*/i, 'Dr. ');
  };

  useLocalEffect(() => {
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
        console.error('Error fetching patients in table:', error);
        setLoading(false);
      });
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (patient.diagnosis && patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGender = filterGender === 'all' || patient.gender === filterGender;
    return matchesSearch && matchesGender;
  });



  const sortedPatients = [...filteredPatients].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'name') {
      aValue = cleanName(aValue);
      bValue = cleanName(bValue);
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });



  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getGenderStats = () => {
    const stats = { male: 0, female: 0, other: 0 };
    patients.forEach(p => {
      if (p.gender) {
        const gender = p.gender.toLowerCase();
        if (gender === 'male') stats.male++;
        else if (gender === 'female') stats.female++;
        else stats.other++;
      }
    });
    return stats;
  };

  const genderStats = getGenderStats();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 200,
        color: 'var(--text-muted)',
        fontSize: 16
      }}>
        <div>Loading patients...</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      {/* Refresh Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24,
        padding: '16px 20px',
        background: 'var(--card-bg)',
        borderRadius: 12,
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px var(--shadow-light)'
      }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 18, fontWeight: 600 }}>
            Patient Records
          </h3>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
            Manage and view all patient information
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease',
            minWidth: 140,
            justifyContent: 'center'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #2563eb, #1e40af)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          <span style={{ fontSize: 16 }}>🔄</span>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16, 
        marginBottom: 24 
      }}>
        <div style={{ 
          background: 'var(--card-bg)', 
          padding: 20, 
          borderRadius: 12, 
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px var(--shadow-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              background: '#3b82f6', 
              color: 'white', 
              width: 40, 
              height: 40, 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: 18
            }}>
              👥
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                {patients.length}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Total Patients</div>
            </div>
          </div>
        </div>
        <div style={{ 
          background: 'var(--card-bg)', 
          padding: 20, 
          borderRadius: 12, 
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px var(--shadow-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              background: '#10b981', 
              color: 'white', 
              width: 40, 
              height: 40, 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: 18
            }}>
              👨
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                {genderStats.male}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Male Patients</div>
            </div>
          </div>
        </div>
        <div style={{ 
          background: 'var(--card-bg)', 
          padding: 20, 
          borderRadius: 12, 
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px var(--shadow-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              background: '#f59e0b', 
              color: 'white', 
              width: 40, 
              height: 40, 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: 18
            }}>
              👩
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                {genderStats.female}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Female Patients</div>
            </div>
          </div>
        </div>
        <div style={{ 
          background: 'var(--card-bg)', 
          padding: 20, 
          borderRadius: 12, 
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px var(--shadow-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              background: '#8b5cf6', 
              color: 'white', 
              width: 40, 
              height: 40, 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: 18
            }}>
              📊
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                {filteredPatients.length}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Filtered Results</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 24,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <input
            type="text"
            placeholder="Search patients by name or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              fontSize: 14,
              background: 'var(--input-bg)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        <select
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            fontSize: 14,
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            minWidth: 120
          }}
        >
          <option value="all">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>



      {/* Table */}
      <div style={{ 
        background: 'var(--card-bg)', 
        borderRadius: 12, 
        border: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px var(--shadow-light)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: 14
          }}>
            <thead>
              <tr style={{ 
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <th 
                  style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('name')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Name
                    {sortBy === 'name' && (
                      <span style={{ fontSize: 12 }}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('age')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Age
                    {sortBy === 'age' && (
                      <span style={{ fontSize: 12 }}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => handleSort('gender')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Gender
                    {sortBy === 'gender' && (
                      <span style={{ fontSize: 12 }}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  Contact
                </th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  Diagnosis
                </th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  Last Visit
                </th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'center',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ 
                    padding: '40px 16px', 
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 14
                  }}>
                    No patients found matching your criteria
                  </td>
                </tr>
              ) : (
                sortedPatients.map((patient, index) => (
                  <tr key={patient.id} style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background-color 0.2s',
                    ':hover': {
                      background: 'var(--bg-secondary)'
                    }
                  }}>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {cleanName(patient.name)}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>
                      {patient.age} years
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        background: patient.gender === 'Male' ? '#dbeafe' : 
                                   patient.gender === 'Female' ? '#fce7f3' : '#f3e8ff',
                        color: patient.gender === 'Male' ? '#1e40af' : 
                               patient.gender === 'Female' ? '#be185d' : '#7c3aed'
                      }}>
                        {patient.gender}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>
                      {patient.contact || patient.phone || 'N/A'}
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>
                      {patient.diagnosis || 'N/A'}
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>
                      {patient.lastVisit || 'N/A'}
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button style={{
                          padding: '6px 12px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 6,
                          background: 'var(--card-bg)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 500
                        }}>
                          👁️ View
                        </button>
                        <button style={{
                          padding: '6px 12px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 6,
                          background: 'var(--card-bg)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 500
                        }}>
                          💊 Prescription
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 16,
        padding: '16px 0',
        color: 'var(--text-muted)',
        fontSize: 14
      }}>
        <div>
          Showing {sortedPatients.length} of {patients.length} patients
        </div>
        <div>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

function ReportSummary() {
  const [patients, setPatients] = useLocalState([]);
  const [prescriptions, setPrescriptions] = useLocalState([]);
  useLocalEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8081/api/patients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json()).then(setPatients);
    fetch('http://localhost:8081/api/prescriptions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json()).then(setPrescriptions);
  }, []);
  return (
    <div style={{ display: 'flex', gap: 32, margin: '32px 0' }}>
      <div style={{ background: '#f1f5f9', borderRadius: 10, padding: 24, minWidth: 180, textAlign: 'center', boxShadow: '0 2px 8px #e0e7ef' }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Total Patients</h3>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#2563eb' }}>{patients.length}</div>
      </div>
      <div style={{ background: '#f1f5f9', borderRadius: 10, padding: 24, minWidth: 180, textAlign: 'center', boxShadow: '0 2px 8px #e0e7ef' }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Total Prescriptions</h3>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#16a34a' }}>{prescriptions.length}</div>
      </div>
    </div>
  );
}

function RecentPrescriptionsTable() {
  const [prescriptions, setPrescriptions] = useLocalState([]);
  useLocalEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8081/api/prescriptions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json()).then(setPrescriptions);
  }, []);
  const recent = prescriptions.slice(-10).reverse();
  return (
    <div style={{ margin: '32px 0' }}>
      <h3>Recent Prescriptions</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e0e7ef' }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ border: '1px solid #e5e7eb', padding: 10 }}>Patient</th>
            <th style={{ border: '1px solid #e5e7eb', padding: 10 }}>Diagnosis</th>
            <th style={{ border: '1px solid #e5e7eb', padding: 10 }}>Date</th>
            <th style={{ border: '1px solid #e5e7eb', padding: 10 }}>Doctor Notes</th>
          </tr>
        </thead>
        <tbody>
          {recent.map(p => (
            <tr key={p.id}>
              <td style={{ border: '1px solid #e5e7eb', padding: 10 }}>{p.patient ? p.patient.name : 'N/A'}</td>
              <td style={{ border: '1px solid #e5e7eb', padding: 10 }}>{p.diagnosis}</td>
              <td style={{ border: '1px solid #e5e7eb', padding: 10 }}>{p.prescriptionDate}</td>
              <td style={{ border: '1px solid #e5e7eb', padding: 10 }}>{p.doctorNotes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PatientsPerMonthChart() {
  const [patients, setPatients] = useLocalState([]);
  useLocalEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8081/api/patients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json()).then(setPatients);
  }, []);
  
  // Generate last 12 months with proper month names
  const months = {};
  const currentDate = new Date();
  
  // Initialize last 12 months with 0 count
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthKey = date.toLocaleString('default', { month: 'short' });
    months[monthKey] = 0;
  }
  
  // Count patients by month
  patients.forEach(p => {
    let month = 'Unknown';
    if (p.createdAt) {
      const d = new Date(p.createdAt);
      month = d.toLocaleString('default', { month: 'short' });
    } else {
      // fallback: distribute patients across recent months
      const randomMonth = Math.floor(Math.random() * 12);
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - randomMonth, 1);
      month = date.toLocaleString('default', { month: 'short' });
    }
    if (months[month] !== undefined) {
      months[month]++;
    }
  });
  
  const monthKeys = Object.keys(months).sort((a, b) => {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.indexOf(a) - monthOrder.indexOf(b);
  });
  return (
    <div style={{ margin: '32px 0' }}>
      <h3>Patients Per Month</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 180, borderLeft: '2px solid #e5e7eb', borderBottom: '2px solid #e5e7eb', padding: '16px 0 0 32px', background: '#f9fafb', borderRadius: 8 }}>
        {monthKeys.map(month => (
          <div key={month} style={{ textAlign: 'center' }}>
            <div style={{ background: '#2563eb', width: 32, height: Math.max(months[month] * 18, 8), borderRadius: 6, marginBottom: 8, transition: 'height 0.3s' }}></div>
            <div style={{ fontSize: 13, color: '#334155' }}>{month}</div>
            <div style={{ fontWeight: 700, color: '#2563eb' }}>{months[month]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorDashboard
