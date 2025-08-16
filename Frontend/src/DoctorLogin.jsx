import { useState } from 'react'

function DoctorLogin({ onLogin, onSignup, onForgotPassword }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const apiUrl = 'http://localhost:8081'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Call onLogin with user data
        onLogin(data.user)
      } else {
        setErrors({ general: data.message || 'Login failed' })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: error.message.includes('Network') ? 'Server is unavailable. Please try again later.' : 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>👨‍⚕️ Doctor Login</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <div className="login-links">
          <button onClick={onSignup} className="link-btn signup-btn">
            Create Account
          </button>
          <button onClick={onForgotPassword} className="link-btn forgot-btn">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  )
}

export default DoctorLogin
