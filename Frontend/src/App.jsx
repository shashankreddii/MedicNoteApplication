import { useState, useEffect } from 'react'
import './App.css'
import DoctorLogin from './DoctorLogin'
import DoctorSignup from './DoctorSignup'
import ForgotPassword from './ForgotPassword'
import DoctorDashboard from './DoctorDashboard'
import PatientList from './PatientList'
import PrescriptionForm from './PrescriptionForm'
import PrescriptionList from './PrescriptionList'
import DoctorProfile from './DoctorProfile'
import PatientDetails from './PatientDetails'
import { ThemeProvider } from './ThemeContext'

function App() {
  const [currentView, setCurrentView] = useState('login')
  const [currentDoctor, setCurrentDoctor] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [refreshPatients, setRefreshPatients] = useState(0)

  // On mount, check for stored user
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setCurrentDoctor(JSON.parse(storedUser))
      setCurrentView('dashboard')
    }
  }, [])

  const handleLogin = (doctorData) => {
    setCurrentDoctor(doctorData)
    setCurrentView('dashboard')
    localStorage.setItem('user', JSON.stringify(doctorData))
  }

  const handleLogout = () => {
    setCurrentDoctor(null)
    setCurrentView('login')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const handleSignupClick = () => {
    setCurrentView('signup')
  }

  const handleForgotPasswordClick = () => {
    setCurrentView('forgot-password')
  }

  const handleBackToLogin = () => {
    setCurrentView('login')
  }

  const handleSignupSuccess = () => {
    setCurrentView('login')
    alert('Registration successful! You can now log in with your credentials.')
  }

  const handleEditPatient = async (updatedPatient) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/patients/${updatedPatient.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedPatient)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedPatientData = await response.json();
      setSelectedPatient(updatedPatientData);
      // Trigger refresh of patient list
      setRefreshPatients(prev => prev + 1);
      return updatedPatientData;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  };

  const handleDeletePatient = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:8081/api/patients/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setSelectedPatient(null);
    setCurrentView('patients');
    // Trigger refresh of patient list
    setRefreshPatients(prev => prev + 1);
  };

  const handleBackFromPatientDetails = () => {
    setSelectedPatient(null);
    // Trigger refresh of patient list when going back
    setRefreshPatients(prev => prev + 1);
  };

  const handleSavePrescription = async (prescriptionData) => {
    try {
      const token = localStorage.getItem('token');
      // Convert medications array to JSON string
      const medicationsJson = JSON.stringify(prescriptionData.medications);
      const prescriptionRequest = {
        patientName: prescriptionData.patientName,
        patientAge: prescriptionData.patientAge,
        patientGender: prescriptionData.patientGender,
        patientContact: prescriptionData.patientContact,
        diagnosis: prescriptionData.diagnosis,
        prescriptionDate: prescriptionData.prescriptionDate,
        validUntil: prescriptionData.validUntil,
        doctorNotes: prescriptionData.doctorNotes,
        medicationsJson: medicationsJson
      };
      const response = await fetch('http://localhost:8081/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionRequest)
      });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (e) {}
        throw new Error(errorMsg);
      }
      const savedPrescription = await response.json();
      console.log('Prescription saved successfully:', savedPrescription);
      alert('Prescription saved successfully!');
      setCurrentView('prescriptions');
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert(error.message || 'Error saving prescription. Please try again.');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <DoctorLogin 
            onLogin={handleLogin}
            onSignup={handleSignupClick}
            onForgotPassword={handleForgotPasswordClick}
          />
        )
      case 'signup':
        return (
          <DoctorSignup 
            onBack={handleBackToLogin}
            onSignupSuccess={handleSignupSuccess}
          />
        )
      case 'forgot-password':
        return (
          <ForgotPassword 
            onBack={handleBackToLogin}
          />
        )
      case 'dashboard':
        return (
          <DoctorDashboard 
            doctor={currentDoctor}
            onLogout={handleLogout}
            onViewPatients={() => setCurrentView('patients')}
            onNewPrescription={() => setCurrentView('prescription')}
            onViewPrescriptions={() => setCurrentView('prescriptions')}
            onViewProfile={() => setCurrentView('profile')}
          />
        )
      case 'patients':
        return (
          selectedPatient ? (
            <PatientDetails patient={selectedPatient} onBack={handleBackFromPatientDetails} onEdit={handleEditPatient} onDelete={handleDeletePatient} />
          ) : (
            <PatientList 
              onBack={() => setCurrentView('dashboard')}
              onSelectPatient={(patient) => {
                setCurrentView('prescription')
                // You can pass selected patient data here
              }}
              onViewDetails={setSelectedPatient}
              refreshPatients={refreshPatients}
            />
          )
        )
      case 'prescription':
        return (
          <PrescriptionForm 
            patient={selectedPatient}
            onBack={() => setCurrentView('patients')}
            onSave={handleSavePrescription}
          />
        )
      case 'prescriptions':
        return <PrescriptionList onBack={() => setCurrentView('dashboard')} />
      case 'profile':
        return <DoctorProfile onBack={() => setCurrentView('dashboard')} />
      default:
        return (
          <DoctorLogin 
            onLogin={handleLogin}
            onSignup={handleSignupClick}
            onForgotPassword={handleForgotPasswordClick}
          />
        )
    }
  }

  return (
    <ThemeProvider>
      <div className="App">
        <header className="App-header">
          <h1>MedicNote</h1>
          {currentDoctor && (
            <div className="user-info">
              <span>{currentDoctor.name.startsWith('Dr.') ? currentDoctor.name : `Dr. ${currentDoctor.name}`}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
          )}
        </header>
        <main className="App-main">
          {renderCurrentView()}
        </main>
        </div>
    </ThemeProvider>
  )
}

export default App
