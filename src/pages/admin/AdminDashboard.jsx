import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, Image, Users, Eye, Plus, 
  ArrowRight, Calendar, Sparkles,
  AlertCircle, RefreshCw, ChevronRight,
  PenTool, Camera, Shield
} from 'lucide-react'
import { blogApi, galleryApi, usersApi } from '../../services/api'

// ============================================
// BRAND COLORS
// ============================================
const primary = '#3b82f6'
const primaryDark = '#2563eb'
const primaryLight = '#eff6ff'
const primaryGlow = 'rgba(59,130,246,0.35)'

// ============================================
// CONSTANTS
// ============================================
const API_BASE = 'https://blog.ceresense.com.ng/'

const getFullImageUrl = (path, imageUrl) => {
  if (imageUrl) return imageUrl
  if (!path) return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300"
  if (path.startsWith('http')) return path
  return `${API_BASE}/storage/${path}`
}

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  welcomeCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    padding: '32px',
    background: `linear-gradient(135deg, ${primary}, ${primaryDark})`,
    borderRadius: '20px',
    color: 'white',
    flexWrap: 'wrap',
    gap: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '28px'
  },
  statCard: (color, isClickable) => ({
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    cursor: isClickable ? 'pointer' : 'default',
    transition: 'all 0.25s ease',
    textDecoration: 'none',
    display: 'block',
    position: 'relative',
    overflow: 'hidden'
  }),
  statIconWrapper: (color) => ({
    width: '52px',
    height: '52px',
    background: color,
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    marginBottom: '16px'
  }),
  statValue: {
    fontSize: '30px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '4px',
    lineHeight: 1
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 500,
    letterSpacing: '0.5px'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '20px',
    marginBottom: '28px'
  },
  contentCard: {
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9'
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 22px',
    background: 'white',
    color: primary,
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  outlineBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 22px',
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '1.5px solid rgba(255,255,255,0.3)',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)'
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '28px'
  },
  quickActionCard: (color) => ({
    background: 'white',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  }),
  badge: (bg, color) => ({
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
    background: bg,
    color: color,
    display: 'inline-block',
    whiteSpace: 'nowrap'
  }),
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#94a3b8'
  },
  skeleton: {
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px'
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 10000,
    padding: '14px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    animation: 'slideInRight 0.3s ease',
    maxWidth: '400px'
  }
}

// ============================================
// SKELETON COMPONENT
// ============================================
const Skeleton = ({ width, height, style }) => (
  <div style={{ ...styles.skeleton, width, height, ...style }} />
)

// ============================================
// MAIN COMPONENT
// ============================================
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBlogs: 0, totalImages: 0, totalUsers: 0, totalViews: 0,
    publishedPosts: 0, draftPosts: 0, featuredImages: 0,
  })
  const [recentPosts, setRecentPosts] = useState([])
  const [recentImages, setRecentImages] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      const [blogRes, galleryRes, usersRes] = await Promise.allSettled([
        blogApi.getAll(),
        galleryApi.getAll(),
        usersApi.getAll().catch(() => ({ data: { data: [] } }))
      ])

      const blogs = blogRes.status === 'fulfilled' 
        ? (blogRes.value.data?.data || blogRes.value.data || [])
        : []
      const gallery = galleryRes.status === 'fulfilled' 
        ? (galleryRes.value.data?.data || galleryRes.value.data || [])
        : []
      const users = usersRes.status === 'fulfilled' 
        ? (usersRes.value.data?.data || usersRes.value.data || [])
        : []

      const totalViews = [...blogs, ...gallery].reduce((sum, item) => sum + (item.views || 0), 0)

      setStats({
        totalBlogs: blogs.length,
        totalImages: gallery.length,
        totalUsers: users.length || 1,
        totalViews,
        publishedPosts: blogs.filter(b => b.status === 'published').length,
        draftPosts: blogs.filter(b => b.status === 'draft').length,
        featuredImages: gallery.filter(g => g.featured).length,
      })

      const sortedPosts = [...blogs].sort((a, b) => 
        new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
      ).slice(0, 5)
      
      const sortedImages = [...gallery].sort((a, b) => 
        new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
      ).slice(0, 4)

      const sortedUsers = [...users].sort((a, b) => 
        new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)
      ).slice(0, 3)

      setRecentPosts(sortedPosts)
      setRecentImages(sortedImages)
      setRecentUsers(sortedUsers)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return dateString }
  }

  // ============================================
  // LOADING SKELETON
  // ============================================
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.welcomeCard, background: '#f1f5f9', minHeight: '120px' }}>
          <div>
            <Skeleton width="250px" height="28px" style={{ marginBottom: '10px' }} />
            <Skeleton width="350px" height="16px" />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Skeleton width="120px" height="44px" />
            <Skeleton width="130px" height="44px" />
          </div>
        </div>
        <div style={styles.statsGrid}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <Skeleton width="52px" height="52px" style={{ marginBottom: '16px' }} />
              <Skeleton width="80px" height="30px" style={{ marginBottom: '8px' }} />
              <Skeleton width="100px" height="13px" />
            </div>
          ))}
        </div>
        <div style={styles.contentGrid}>
          {[1,2].map(i => (
            <div key={i} style={styles.contentCard}>
              <div style={styles.cardHeader}>
                <Skeleton width="140px" height="20px" />
                <Skeleton width="60px" height="14px" />
              </div>
              <div style={{ padding: '16px 24px' }}>
                {[1,2,3].map(j => (
                  <Skeleton key={j} width="100%" height="50px" style={{ marginBottom: '12px' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
      </div>
    )
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error && !refreshing && stats.totalBlogs === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: '#dc2626', opacity: 0.7 }} />
        <h3 style={{ color: '#1e293b', margin: 0 }}>Failed to Load Dashboard</h3>
        <p style={{ color: '#64748b', margin: 0, maxWidth: '400px' }}>{error}</p>
        <button onClick={handleRefresh} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
          background: primary, color: 'white', border: 'none', borderRadius: '10px',
          cursor: 'pointer', fontWeight: 600, marginTop: '8px'
        }}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    )
  }

  // ============================================
  // MAIN DASHBOARD
  // ============================================
  return (
    <div style={styles.container}>
      {/* ===== WELCOME CARD ===== */}
      <div style={styles.welcomeCard}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '30%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={24} style={{ opacity: 0.9 }} />
            <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Welcome back, Admin! 👋</h1>
          </div>
          <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '15px' }}>
            Here's what's happening with your website today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          <button onClick={handleRefresh} disabled={refreshing} style={styles.outlineBtn}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.15)'}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/admin/blog" style={styles.primaryBtn}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 4px 12px ${primaryGlow}` }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none' }}>
            <Plus size={18} /> New Post
          </Link>
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div style={styles.quickActions}>
        {[
          { icon: <PenTool size={20} />, label: 'Write Post', desc: 'Create new blog post', link: '/admin/blog', color: primary },
          { icon: <Camera size={20} />, label: 'Upload Image', desc: 'Add to gallery', link: '/admin/gallery', color: primary },
          { icon: <Shield size={20} />, label: 'Add User', desc: 'Manage team', link: '/admin/users', color: primary },
        ].map((action, i) => (
          <Link key={i} to={action.link} style={styles.quickActionCard(action.color)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = primary }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0' }}>
            <div style={{ ...styles.statIconWrapper(action.color), width: '44px', height: '44px', marginBottom: 0, borderRadius: '12px' }}>
              {action.icon}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{action.label}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{action.desc}</div>
            </div>
            <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#94a3b8' }} />
          </Link>
        ))}
      </div>

      {/* ===== STATS CARDS ===== */}
      <div id="stats" style={styles.statsGrid}>
        {[
          { icon: <FileText size={22} />, value: stats.totalBlogs, label: 'Total Posts', sub: `${stats.publishedPosts} published · ${stats.draftPosts} drafts`, color: primary, bg: primaryLight, link: '/admin/blog' },
          { icon: <Image size={22} />, value: stats.totalImages, label: 'Gallery Images', sub: `${stats.featuredImages} featured`, color: primary, bg: primaryLight, link: '/admin/gallery' },
          { icon: <Users size={22} />, value: stats.totalUsers, label: 'Admin Users', sub: 'Team members', color: primary, bg: primaryLight, link: '/admin/users' },
          { icon: <Eye size={22} />, value: stats.totalViews.toLocaleString(), label: 'Total Views', sub: 'Across all content', color: primary, bg: primaryLight },
        ].map((stat, i) => (
          <Link 
            key={i} 
            to={stat.link || '#'} 
            style={styles.statCard(stat.color, !!stat.link)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${primaryGlow.replace('0.35', '0.1')}`; e.currentTarget.style.borderColor = primary }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0' }}
          >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: stat.bg, opacity: 0.5, pointerEvents: 'none' }} />
            <div style={styles.statIconWrapper(stat.color)}>{stat.icon}</div>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>{stat.sub}</div>
          </Link>
        ))}
      </div>

      {/* ===== RECENT CONTENT ===== */}
      <div style={styles.contentGrid}>
        {/* Recent Posts */}
        <div style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 600, margin: 0 }}>
              <div style={{ width: '36px', height: '36px', background: primaryLight, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color={primary} />
              </div>
              Recent Posts
            </h3>
            <Link to="/admin/blog" style={{ color: primary, fontSize: '13px', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: '8px 24px' }}>
            {recentPosts.length === 0 ? (
              <div style={styles.emptyState}>
                <FileText size={40} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <p style={{ fontWeight: 500, marginBottom: '4px' }}>No posts yet</p>
                <p style={{ fontSize: '13px', marginBottom: '12px' }}>Start creating content</p>
                <Link to="/admin/blog" style={{ color: primary, fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>Create First Post →</Link>
              </div>
            ) : (
              recentPosts.map((post, i) => (
                <div key={post.id || post._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < recentPosts.length - 1 ? '1px solid #f1f5f9' : 'none', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: '0 0 6px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</h4>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={styles.badge(post.status === 'published' ? '#f0fdf4' : '#fefce8', post.status === 'published' ? '#16a34a' : '#ca8a04')}>
                        {post.status === 'published' ? '✓ Published' : '📝 Draft'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {formatDate(post.created_at || post.createdAt)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {post.views || 0}</span>
                    </div>
                  </div>
                  {post.cover_image && (
                    <img src={getFullImageUrl(post.cover_image)} alt="" style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, background: '#f1f5f9' }}
                      onError={e => { e.target.style.display = 'none' }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Images */}
        <div style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 600, margin: 0 }}>
              <div style={{ width: '36px', height: '36px', background: primaryLight, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image size={18} color={primary} />
              </div>
              Recent Images
            </h3>
            <Link to="/admin/gallery" style={{ color: primary, fontSize: '13px', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: '16px 24px' }}>
            {recentImages.length === 0 ? (
              <div style={styles.emptyState}>
                <Image size={40} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <p style={{ fontWeight: 500, marginBottom: '4px' }}>No images yet</p>
                <Link to="/admin/gallery" style={{ color: primary, fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>Upload First Image →</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {recentImages.map((image, i) => (
                  <div key={image.id || image._id || i} style={{ borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', borderRadius: '10px', background: '#f1f5f9' }}>
                      <img src={getFullImageUrl(image.image_path, image.image_url)} alt={image.title || 'Gallery image'} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300" }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 10px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))', color: 'white', fontSize: '11px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {image.title || 'Untitled'}
                      </div>
                      {image.featured && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: primary, color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 600 }}>⭐ Featured</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== RECENT USERS ===== */}
      {recentUsers.length > 0 && (
        <div style={styles.contentCard}>
          <div style={styles.cardHeader}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 600, margin: 0 }}>
              <div style={{ width: '36px', height: '36px', background: primaryLight, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} color={primary} />
              </div>
              Team Members
            </h3>
            <Link to="/admin/users" style={{ color: primary, fontSize: '13px', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Manage Users <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: '8px 24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {recentUsers.map((user, i) => (
              <div key={user.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', flex: '1 1 200px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${primary}, ${primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '14px', flexShrink: 0 }}>
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{user.name || 'Unknown'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    <span style={styles.badge(user.role === 'super_admin' ? '#fef3c7' : primaryLight, user.role === 'super_admin' ? '#92400e' : primary)}>
                      {user.role || 'user'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {error && refreshing && (
        <div style={{ ...styles.toast, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
      `}</style>
    </div>
  )
}

export default AdminDashboard