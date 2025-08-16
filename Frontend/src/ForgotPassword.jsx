import { useState } from 'react'

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, you'd send this to your backend
      console.log('Password reset requested for:', email)
      
      setIsSubmitted(true)
    } catch (error) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendEmail = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('Reset email sent again!')
    } catch (error) {
      setError('Failed to resend email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="success-header">
            <div className="success-icon">✓</div>
            <h2>Check Your Email</h2>
          </div>
          
          <div className="success-content">
            <p>
              We've sent a password reset link to:
            </p>
            <p className="email-display">{email}</p>
            
            <div className="instructions">
              <h3>What to do next:</h3>
              <ol>
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the "Reset Password" link in the email</li>
                <li>Create a new password</li>
                <li>Sign in with your new password</li>
              </ol>
            </div>
            
            <div className="help-section">
              <p>Didn't receive the email?</p>
              <button 
                onClick={handleResendEmail}
                className="resend-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Resend Email'}
              </button>
            </div>
          </div>
          
          <div className="form-actions">
            <button onClick={onBack} className="back-to-login-btn">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <button onClick={onBack} className="back-btn">
            ← Back to Login
          </button>
          <h2>Forgot Password</h2>
        </div>

        <div className="forgot-password-content">
          <p>
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button 
              type="submit" 
              className="reset-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>

        <div className="help-links">
          <p>Remember your password?</p>
          <button onClick={onBack} className="link-btn">
            Sign in here
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword 