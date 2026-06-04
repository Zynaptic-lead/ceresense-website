import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import { authApi } from '../../services/api'

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const navigate = useNavigate()

  // Listen for screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    if (!formData.email.trim()) { setError('Please enter your email'); setLoading(false); return }
    if (!formData.password.trim()) { setError('Please enter your password'); setLoading(false); return }
    
    try {
      const response = await authApi.login({ email: formData.email.trim(), password: formData.password })
      const { user, accessToken } = response.data.data
      if (!accessToken) throw new Error('No access token')
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      setSuccess('Login successful!')
      setTimeout(() => navigate('/admin/dashboard', { replace: true }), 800)
    } catch (err) {
      if (err.response?.status === 401) setError('Invalid email or password.')
      else if (err.message === 'Network Error') setError('Cannot connect to server.')
      else setError(err.response?.data?.message || 'Login failed.')
    } finally { setLoading(false) }
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
      padding: '12px',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'auto',
      boxSizing: 'border-box',
    }}>
      {/* Watermark */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-15deg)',
        fontSize: isMobile ? '40px' : 'clamp(60px, 12vw, 140px)',
        fontWeight: 900,
        color: 'rgba(59,130,246,0.04)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
        letterSpacing: '6px',
        zIndex: 0,
      }}>CERESENSE</div>

      {/* Main Card */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%',
        maxWidth: isMobile ? '420px' : '900px',
        background: 'white',
        borderRadius: isMobile ? '16px' : '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        position: 'relative',
        zIndex: 1,
      }}>
        
        {/* LEFT - Branding (hidden on mobile) */}
        {!isMobile && (
          <div style={{
            flex: '0 0 40%',
            background: 'linear-gradient(160deg, #1e3a5f, #152238, #0d1b2a)',
            padding: '40px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '50px', height: '50px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <Shield size={28} color="white" />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px', color: '#f8fafc' }}>CERESENSE</h1>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '24px', lineHeight: 1.5 }}>
                Admin Dashboard — Manage your content, users, and monitor your website.
              </p>
              {[
                { icon: '📊', title: 'Analytics', desc: 'Website statistics' },
                { icon: '📝', title: 'Content', desc: 'Manage blog posts' },
                { icon: '🖼️', title: 'Gallery', desc: 'Organize images' },
                { icon: '👥', title: 'Users', desc: 'Manage admins' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{
                    width: '28px', height: '28px', background: 'rgba(59,130,246,0.2)',
                    borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', flexShrink: 0,
                  }}>{item.icon}</div>
                  <div>
                    <h4 style={{ fontSize: '11px', fontWeight: 600, marginBottom: '1px', color: '#e2e8f0' }}>{item.title}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '10px', margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RIGHT - Login Form */}
        <div style={{
          flex: isMobile ? '1' : '0 0 60%',
          padding: isMobile ? '30px 20px' : '40px 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'white',
        }}>
          <div style={{ width: '100%', maxWidth: '380px' }}>
            {/* Mobile Logo */}
            {isMobile && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  borderRadius: '12px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '8px',
                }}>
                  <Shield size={26} color="white" />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>CERESENSE</h2>
              </div>
            )}

            {/* Admin Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#eff6ff', color: '#3b82f6',
              padding: '4px 10px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 600, marginBottom: '14px',
            }}>
              <Shield size={12} /> Admin Access
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Welcome Back 👋</h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>Sign in to your dashboard</p>

            {/* Alerts */}
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}
            {success && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={14} /> {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Email */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="email" placeholder="admin@ceresense.com.ng" value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)} disabled={loading} required
                    style={{
                      width: '100%', padding: '10px 12px 10px 34px', border: '2px solid #e2e8f0',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      background: loading ? '#f8fafc' : 'white', color: '#1e293b',
                    }} />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Enter password"
                    value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={loading} required
                    style={{
                      width: '100%', padding: '10px 40px 10px 34px', border: '2px solid #e2e8f0',
                      borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                      background: loading ? '#f8fafc' : 'white', color: '#1e293b',
                    }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '11px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(59,130,246,0.35)',
              }}>
                {loading ? (
                  <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Signing in...</>
                ) : (
                  <><LogIn size={16} /> Sign In</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default AdminLogin