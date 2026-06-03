import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, Image, Users, Eye, TrendingUp, Plus, 
  ArrowRight, Calendar, Clock, Activity
} from 'lucide-react'
import { blogApi, galleryApi } from '../../services/api'

const API_BASE = 'https://ceresense-ojfl.onrender.com'

const getFullImageUrl = (path) => {
  if (!path) return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300"
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBlogs: 0, totalImages: 0, totalUsers: 1, totalViews: 0
  })
  const [recentPosts, setRecentPosts] = useState([])
  const [recentImages, setRecentImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [blogRes, galleryRes] = await Promise.all([
        blogApi.getAll().catch(() => ({ data: { data: [] } })),
        galleryApi.getAll().catch(() => ({ data: { data: [] } }))
      ])

      const blogs = blogRes.data?.data || blogRes.data || []
      const gallery = galleryRes.data?.data || galleryRes.data || []

      const totalViews = [...blogs, ...gallery].reduce((sum, item) => sum + (item.views || 0), 0)

      setStats({
        totalBlogs: blogs.length,
        totalImages: gallery.length,
        totalUsers: 1,
        totalViews
      })

      setRecentPosts(blogs.slice(0, 5))
      setRecentImages(gallery.slice(0, 4))
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return dateString }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ color: '#64748b' }}>Loading dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div>
      {/* Welcome */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '32px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>Welcome back, Admin! 👋</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Here's what's happening with your website today.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/admin/blog" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}><Plus size={18} /> New Post</Link>
          <Link to="/admin/gallery" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'white', color: '#1e293b', border: '2px solid #e2e8f0', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}><Plus size={18} /> Upload Image</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { icon: <FileText size={22} />, value: stats.totalBlogs, label: 'Blog Posts', color: '#3b82f6', link: '/admin/blog' },
          { icon: <Image size={22} />, value: stats.totalImages, label: 'Gallery Images', color: '#10b981', link: '/admin/gallery' },
          { icon: <Users size={22} />, value: stats.totalUsers, label: 'Admin Users', color: '#8b5cf6', link: '/admin/users' },
          { icon: <Eye size={22} />, value: stats.totalViews.toLocaleString(), label: 'Total Views', color: '#f59e0b' }
        ].map((stat, i) => (
          stat.link ? (
            <Link to={stat.link} key={i} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ width: '48px', height: '48px', background: stat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '16px' }}>{stat.icon}</div>
                <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{stat.value}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>{stat.label}</p>
              </div>
            </Link>
          ) : (
            <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '48px', height: '48px', background: stat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '16px' }}>{stat.icon}</div>
              <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{stat.value}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>{stat.label}</p>
            </div>
          )
        ))}
      </div>

      {/* Recent Posts & Images */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 600 }}><FileText size={20} color="#3b82f6" /> Recent Posts</h3>
            <Link to="/admin/blog" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ padding: '16px 24px' }}>
            {recentPosts.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No posts yet</p>
            ) : (
              recentPosts.map(post => (
                <div key={post._id || post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>{post.title}</h4>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: post.status === 'published' ? '#f0fdf4' : '#fefce8', color: post.status === 'published' ? '#16a34a' : '#ca8a04' }}>{post.status}</span>
                      <span>{post.category}</span>
                      <span>📅 {formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', color: '#64748b' }}><Eye size={14} /> {post.views || 0}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 600 }}><Image size={20} color="#10b981" /> Recent Images</h3>
            <Link to="/admin/gallery" style={{ color: '#667eea', fontSize: '13px', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
            {recentImages.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', gridColumn: '1/-1' }}>No images yet</p>
            ) : (
              recentImages.map(image => (
                <div key={image._id || image.id} style={{ borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: '10px', background: '#f1f5f9' }}>
                    <img src={getFullImageUrl(image.imageUrl)} alt={image.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300" }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: 'white', fontSize: '11px' }}>{image.title}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard