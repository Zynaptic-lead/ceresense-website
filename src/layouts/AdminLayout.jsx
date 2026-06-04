import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Image, FileText, LogOut, Menu, X,
  ChevronRight, Home, Users, Shield
} from "lucide-react";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (!userData || !token) {
      navigate('/admin/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      handleLogout();
    }
  }, [navigate]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/blog', icon: <FileText size={20} />, label: 'Blog Posts' },
    { path: '/admin/gallery', icon: <Image size={20} />, label: 'Gallery' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return 'Dashboard Overview';
    if (path.includes('/admin/blog')) return 'Blog Management';
    if (path.includes('/admin/gallery')) return 'Gallery Management';
    if (path.includes('/admin/users')) return 'User Management';
    return 'Admin Panel';
  };

  const getUserDisplayName = () => {
    if (!user) return 'Admin';
    return user.name || user.fullName || user.email?.split('@')[0] || 'Admin';
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const getUserEmail = () => {
    return user?.email || '';
  };

  const getUserRole = () => {
    const role = user?.role || 'admin';
    return role === 'super_admin' ? 'Super Admin' : 'Admin';
  };

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f8fafc',
        gap: '16px'
      }}>
        <div style={{
          width: '44px', height: '44px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading admin panel...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Brand colors
  const primary = '#3b82f6';
  const primaryDark = '#2563eb';
  const primaryLight = 'rgba(59,130,246,0.15)';
  const primaryGlow = 'rgba(59,130,246,0.35)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 998, backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside style={{
        width: sidebarOpen ? '280px' : '0px',
        background: 'white',
        color: '#1e293b',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 999,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.06)' : 'none',
        borderRight: '1px solid #e2e8f0'
      }}>
        {/* Logo */}
        <div style={{ 
          padding: '20px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '72px'
        }}>
          <Link to="/admin/dashboard" style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', 
            textDecoration: 'none', color: '#1e293b' 
          }}>
            <div style={{
              width: '42px', height: '42px',
              background: `linear-gradient(135deg, ${primary}, ${primaryDark})`,
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '18px', flexShrink: 0, color: 'white',
              boxShadow: `0 4px 12px ${primaryGlow}`
            }}>
              C
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                CERESENSE
              </h2>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0 0', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Admin Panel
              </p>
            </div>
          </Link>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)}
              style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ 
          flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '2px',
          overflowY: 'auto'
        }}>
          <p style={{ 
            fontSize: '10px', color: '#94a3b8', 
            textTransform: 'uppercase', letterSpacing: '1.5px',
            padding: '8px 16px 6px', fontWeight: 600
          }}>
            Main Menu
          </p>
          
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 16px',
                  color: isActive ? primary : '#64748b',
                  textDecoration: 'none', borderRadius: '10px',
                  background: isActive ? '#eff6ff' : 'transparent',
                  transition: 'all 0.15s ease',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#1e293b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                <span style={{ display: 'flex', color: isActive ? primary : '#94a3b8' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && (
                  <div style={{
                    width: '4px', height: '20px',
                    background: primary, borderRadius: '2px',
                    position: 'absolute', right: '-1px'
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ 
          padding: '12px', borderTop: '1px solid #f1f5f9'
        }}>
          {/* View Website */}
          <Link to="/" target="_blank"
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 16px', color: '#64748b',
              textDecoration: 'none', borderRadius: '10px',
              fontSize: '13px', marginBottom: '8px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = primary }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
          >
            <Home size={18} />
            <span>View Website</span>
            <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </Link>

          {/* User Info */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', marginBottom: '8px',
            background: '#f8fafc', borderRadius: '10px'
          }}>
            <div style={{
              width: '36px', height: '36px',
              background: `linear-gradient(135deg, ${primary}, ${primaryDark})`,
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, flexShrink: 0, color: 'white',
              boxShadow: `0 2px 8px ${primaryGlow}`
            }}>
              {getUserInitial()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: '13px', fontWeight: 600, color: '#1e293b',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {getUserDisplayName()}
              </div>
              <div style={{ 
                fontSize: '11px', color: '#94a3b8',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {getUserEmail()}
              </div>
              <div style={{ marginTop: '4px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: '10px', fontSize: '10px',
                  fontWeight: 600,
                  background: user?.role === 'super_admin' ? '#fef3c7' : '#eff6ff',
                  color: user?.role === 'super_admin' ? '#92400e' : primary
                }}>
                  {getUserRole()}
                </span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px', color: '#ef4444',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2' }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '0px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Header */}
        <header style={{
          background: 'white',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          {/* Hamburger */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none', border: '1px solid #e2e8f0',
              color: '#64748b', cursor: 'pointer', padding: '8px',
              borderRadius: '8px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease', flexShrink: 0
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Page Title */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '17px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
              {getPageTitle()}
            </h1>
          </div>

          {/* User Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '6px 14px 6px 6px', background: '#f8fafc',
            borderRadius: '30px', border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '30px', height: '30px',
              background: `linear-gradient(135deg, ${primary}, ${primaryDark})`,
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white',
              fontSize: '12px', fontWeight: 700, flexShrink: 0
            }}>
              {getUserInitial()}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>
                {getUserDisplayName()}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.2 }}>
                {getUserRole()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '24px', flex: 1 }}>
          <Outlet />
        </div>

        {/* Footer */}
        <footer style={{
          padding: '14px 24px', borderTop: '1px solid #e2e8f0',
          textAlign: 'center', fontSize: '12px', color: '#94a3b8',
          background: 'white'
        }}>
          CERESENSE Admin Panel &copy; {new Date().getFullYear()} · All rights reserved.
        </footer>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        nav::-webkit-scrollbar {
          width: 4px;
        }
        nav::-webkit-scrollbar-track {
          background: transparent;
        }
        nav::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }
        
        @media (max-width: 768px) {
          main {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;