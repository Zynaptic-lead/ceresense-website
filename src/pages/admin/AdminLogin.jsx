import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react'
import { authApi } from '../../services/api'

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await authApi.login(formData)
      const { user, accessToken } = response.data.data
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
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
        display: 'flex',
        width: '100%',
        maxWidth: '1000px',
        minHeight: '550px',
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
      }}>
        {/* Branding */}
        <div style={{
          flex: '0 0 45%',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          padding: '60px 40px',
          display: 'flex',
          alignItems: 'center',
          color: 'white'
        }}>
          <div>
            <img src="/logo.png" alt="CERESENSE" style={{ width: '80px', marginBottom: '30px', filter: 'brightness(0) invert(1)' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>CERESENSE Admin</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '40px' }}>
              Manage your website content, gallery, and blog posts.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { icon: '📊', title: 'Dashboard Analytics', desc: 'Track website performance' },
                { icon: '📝', title: 'Content Management', desc: 'Create and manage posts' },
                { icon: '🔒', title: 'Secure Access', desc: 'Protected admin area' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '24px', width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{item.title}</h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: '0 0 55%', padding: '60px 50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Welcome Back</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Sign in to your admin dashboard</p>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="email" placeholder="admin@ceresense.com.ng" value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} required
                    style={{ width: '100%', padding: '12px 14px 12px 42px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})} required
                    style={{ width: '100%', padding: '12px 40px 12px 42px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
              </button>
            </form>

            
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin