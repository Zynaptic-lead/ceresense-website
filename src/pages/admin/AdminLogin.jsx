import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import { authApi } from '../../services/api'

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    if (!formData.email.trim()) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }
    
    if (!formData.password.trim()) {
      setError('Please enter your password')
      setLoading(false)
      return
    }
    
    try {
      const response = await authApi.login({
        email: formData.email.trim(),
        password: formData.password
      })
      
      const { user, accessToken } = response.data.data
      
      if (!accessToken) {
        throw new Error('No access token received from server')
      }
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      setSuccess('Login successful! Redirecting to dashboard...')
      
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true })
      }, 800)
      
    } catch (err) {
      console.error('Login error:', err)
      
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.')
      } else if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors
        const firstError = validationErrors ? Object.values(validationErrors)[0]?.[0] : null
        setError(firstError || 'Please check your input and try again.')
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Please make sure the backend is running.')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Login failed. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = () => {
    setFormData({
      email: 'admin@ceresense.com.ng',
      password: 'password123'
    })
    setError('')
    setSuccess('')
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f5f9',
      padding: '20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* ============ WATERMARK ============ */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-15deg)',
        fontSize: 'clamp(60px, 12vw, 140px)',
        fontWeight: 900,
        color: 'rgba(59, 130, 246, 0.04)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
        letterSpacing: '8px',
        zIndex: 0,
        width: '100%',
        textAlign: 'center'
      }}>
        CERESENSE
      </div>

      {/* Secondary watermark */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        right: '5%',
        fontSize: 'clamp(30px, 6vw, 70px)',
        fontWeight: 900,
        color: 'rgba(37, 99, 235, 0.03)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
        letterSpacing: '5px',
        zIndex: 0
      }}>
        CERESENSE
      </div>

      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        right: '-80px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(59, 130, 246, 0.06)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-60px',
        left: '-60px',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'rgba(37, 99, 235, 0.05)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '10%',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'rgba(59, 130, 246, 0.04)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* ============ MAIN CARD ============ */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1000px',
        minHeight: '560px',
        background: 'white',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* ============ LEFT SIDE - BRANDING ============ */}
        <div style={{
          flex: '0 0 42%',
          background: 'linear-gradient(160deg, #1e3a5f 0%, #152238 50%, #0d1b2a 100%)',
          padding: '50px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'rgba(59,130,246,0.08)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-30px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(37,99,235,0.06)',
          }} />
          <div style={{
            position: 'absolute',
            top: '30%',
            right: '15%',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(59,130,246,0.1)',
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '28px',
              boxShadow: '0 8px 24px rgba(59,130,246,0.35)'
            }}>
              <Shield size={32} color="white" />
            </div>
            
            {/* Title */}
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              marginBottom: '10px',
              letterSpacing: '-0.5px',
              color: '#f8fafc'
            }}>
              CERESENSE
            </h1>
            <p style={{
              color: '#94a3b8',
              fontSize: '14px',
              marginBottom: '36px',
              lineHeight: '1.6'
            }}>
              Admin Dashboard — Manage your content, users, and monitor your website performance.
            </p>
            
            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: '📊', title: 'Analytics Overview', desc: 'Real-time website statistics' },
                { icon: '📝', title: 'Content Management', desc: 'Create and manage blog posts' },
                { icon: '🖼️', title: 'Media Gallery', desc: 'Upload and organize images' },
                { icon: '👥', title: 'User Management', desc: 'Add and manage admin users' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    fontSize: '16px',
                    width: '34px',
                    height: '34px',
                    background: 'rgba(59,130,246,0.15)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px', color: '#e2e8f0' }}>
                      {item.title}
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============ RIGHT SIDE - LOGIN FORM ============ */}
        <div style={{
          flex: '0 0 58%',
          padding: '50px 44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff'
        }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#eff6ff',
                color: '#3b82f6',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px'
              }}>
                <Shield size={14} /> Admin Access
              </div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '6px',
                letterSpacing: '-0.3px'
              }}>
                Welcome Back 👋
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                margin: 0
              }}>
                Sign in to access your admin dashboard
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '18px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'slideIn 0.25s ease'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span style={{ lineHeight: '1.4' }}>{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '18px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'slideIn 0.25s ease'
              }}>
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Email Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none'
                  }} />
                  <input
                    type="email"
                    placeholder="admin@ceresense.com.ng"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={loading}
                    required
                    autoComplete="off"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: loading ? '#f8fafc' : 'white',
                      color: '#1e293b'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none'
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={loading}
                    required
                    autoComplete="off"
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 42px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: loading ? '#f8fafc' : 'white',
                      color: '#1e293b'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                      e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      color: '#94a3b8',
                      padding: '6px',
                      borderRadius: '6px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.target.style.background = '#f1f5f9'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: loading
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  boxShadow: loading
                    ? 'none'
                    : '0 4px 16px rgba(59,130,246,0.35)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-1px)'
                    e.target.style.boxShadow = '0 6px 20px rgba(59,130,246,0.5)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 4px 16px rgba(59,130,246,0.35)'
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '2.5px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Login */}
            <div style={{
              marginTop: '20px',
              paddingTop: '18px',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center'
            }}>
              
            </div>

            
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

export default AdminLogin