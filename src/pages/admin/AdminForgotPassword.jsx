import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
      }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <Send size={48} style={{ color: '#667eea', marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '12px' }}>Check Your Email</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              We've sent a password reset link to {email}
            </p>
            <Link to="/admin/login" style={{ color: '#667eea', textDecoration: 'none' }}>
              <ArrowLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Forgot Password?</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Enter your email to receive a reset link</p>
            
            <form onSubmit={handleSubmit}>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
              >
                <Send size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                Send Reset Link
              </button>
            </form>
            
            <div style={{ textAlign: 'center' }}>
              <Link to="/admin/login" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
                <ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminForgotPassword
