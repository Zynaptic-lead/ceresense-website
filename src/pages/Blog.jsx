import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, User, Heart, Eye, ArrowLeft, Tag, 
  Sparkles, TrendingUp, Search, Share2, Bookmark, 
  ChevronRight, Link, Copy, ExternalLink
} from "lucide-react";
import { blogApi } from "../services/api";
import "../styles/Blog.css";

// ============================================
// BRAND COLORS
// ============================================
const blue = '#3b82f6';
const blueDark = '#2563eb';
const blueLight = '#eff6ff';

// ============================================
// CONSTANTS
// ============================================
const API_BASE = 'https://blog.ceresense.com.ng/';

const getImageUrl = (coverImage) => {
  if (!coverImage) return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600";
  if (coverImage.startsWith('http')) return coverImage;
  return `${API_BASE}/storage/${coverImage}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return dateString; }
};

// ============================================
// SHARE BUTTON STYLE
// ============================================
const shareBtnStyle = (bg) => ({
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '8px 12px', background: bg, color: 'white',
  border: 'none', borderRadius: 8, fontSize: 12,
  fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.15s'
});

// ============================================
// BLOG LISTING PAGE
// ============================================
const BlogListingPage = ({ posts, loading, error, onPostSelect, onRetry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  const uniqueTags = [...new Set(posts.flatMap(p => Array.isArray(p.tags) ? p.tags : []))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || 
      (Array.isArray(post.tags) && post.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="blog-page">
        <section className="blog-hero" style={{ background: `linear-gradient(135deg, ${blueDark}, #1e3a5f)` }}>
          <div className="blog-hero-container">
            <div className="blog-hero-content">
              <div className="hero-badge"><Sparkles size={20} /><span>CERESENSE INSIGHTS</span></div>
              <h1 className="blog-hero-title">Tech Insights & Innovations</h1>
              <p className="blog-hero-description">Loading articles...</p>
            </div>
          </div>
        </section>
        <section style={{ padding: '80px 20px', textAlign: 'center', background: '#f8fafc' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #e2e8f0', borderTopColor: blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 16, color: '#64748b', fontWeight: 500 }}>Loading articles...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </section>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <section className="blog-hero" style={{ background: `linear-gradient(135deg, ${blueDark}, #1e3a5f)` }}>
        <div className="blog-hero-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="blog-hero-content">
            <div className="hero-badge"><Sparkles size={20} /><span>CERESENSE INSIGHTS</span></div>
            <h1 className="blog-hero-title">Tech Insights & Innovations</h1>
            <p className="blog-hero-description">Expert perspectives on technology, education, and the future of learning</p>
          </motion.div>
        </div>
      </section>

      <section className="blog-listing" style={{ background: '#f8fafc', padding: '40px 20px' }}>
        <div className="listing-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {error && (
            <div style={{ textAlign: 'center', padding: 20, background: '#fef2f2', borderRadius: 12, color: '#dc2626', marginBottom: 24 }}>
              <p>{error}</p>
              <button onClick={onRetry} style={{ marginTop: 12, padding: '8px 20px', background: blue, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 250, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10 }}>
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Search articles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }} />
              {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>}
            </div>
            <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)}
              style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, cursor: 'pointer', outline: 'none', minWidth: 160 }}>
              <option value="all">🏷️ All Tags</option>
              {uniqueTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </div>

          <div className="listing-header" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
              {selectedTag !== 'all' ? `Tag: ${selectedTag}` : 'Latest Articles'}
            </h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              {filteredPosts.length > 0 ? `Showing ${filteredPosts.length} article${filteredPosts.length > 1 ? 's' : ''}` : 'No articles found'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id || post._id || index}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => onPostSelect(post.id || post._id)}
                style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f1f5f9' }}>
                  <img src={getImageUrl(post.cover_image || post.coverImage)} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600"; }} />
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: blue, color: 'white', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    <TrendingUp size={14} /> {post.category?.name || post.category || "General"}
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b', marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> {formatDate(post.created_at || post.createdAt)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={13} /> {post.views || 0}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8, lineHeight: 1.4 }}>{post.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', marginBottom: 14, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {post.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} style={{ padding: '3px 10px', background: blueLight, color: blue, borderRadius: 14, fontSize: 11, fontWeight: 500 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                      <User size={14} /> {post.author?.name || post.author?.fullName || 'CERESENSE Team'}
                    </div>
                    <button style={{ padding: '8px 16px', background: blue, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Read <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
            {filteredPosts.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                <Search size={48} style={{ opacity: 0.4, marginBottom: 12 }} />
                <h3 style={{ color: '#1e293b', marginBottom: 8 }}>No articles found</h3>
                <p>Try adjusting your search or tag filter</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================
// BLOG DETAIL PAGE WITH SIDEBAR
// ============================================
const BlogDetailPage = ({ postId, onBack, allPosts }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (postId) fetchPostDetail(); }, [postId]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const response = await blogApi.getById(postId);
      setPost(response.data?.data || response.data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || 'CERESENSE Article';

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const relatedPosts = allPosts
    .filter(p => (p.id || p._id) !== postId)
    .filter(p => {
      const postTags = Array.isArray(post?.tags) ? post.tags : [];
      const pTags = Array.isArray(p.tags) ? p.tags : [];
      return pTags.some(tag => postTags.includes(tag));
    })
    .slice(0, 3);

  const allTags = [...new Set(allPosts.flatMap(p => Array.isArray(p.tags) ? p.tags : []))];

  const filteredSidebarPosts = allPosts
    .filter(p => (p.id || p._id) !== postId)
    .filter(p => !sidebarSearch || p.title?.toLowerCase().includes(sidebarSearch.toLowerCase()))
    .slice(0, 5);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ width: 44, height: 44, border: '3px solid #e2e8f0', borderTopColor: blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3 style={{ color: '#1e293b' }}>Article not found</h3>
        <button onClick={onBack} style={{ padding: '12px 24px', background: blue, color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', marginTop: 16, fontWeight: 600 }}>← Back to Articles</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <section style={{ background: `linear-gradient(135deg, ${blueDark}, #1e3a5f)`, padding: '50px 20px', color: 'white' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, cursor: 'pointer', color: 'white', fontSize: 13, marginBottom: 20 }}>
            <ArrowLeft size={16} /> Back to Articles
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            <TrendingUp size={16} /> {post.category?.name || post.category || 'General'}
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: 12, lineHeight: 1.3 }}>{post.title}</h1>
          <p style={{ opacity: 0.9, fontSize: 16, marginBottom: 20, maxWidth: 600, margin: '0 auto 20px' }}>{post.excerpt}</p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 13, opacity: 0.8, flexWrap: 'wrap' }}>
            <span>📅 {formatDate(post.created_at || post.createdAt)}</span>
            <span>👤 {post.author?.name || post.author?.fullName || 'Admin'}</span>
            <span>⏱️ {post.read_time || '5 min read'}</span>
            <span>👁️ {post.views || 0} views</span>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 30 }}>
        <div>
          {(post.cover_image || post.coverImage) && (
            <img src={getImageUrl(post.cover_image || post.coverImage)} alt={post.title} 
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 16, marginBottom: 30 }}
              onError={e => { e.target.style.display = 'none'; }} />
          )}
          <div style={{ background: 'white', borderRadius: 16, padding: 40, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
            <div dangerouslySetInnerHTML={{ __html: post.content || '<p>No content available.</p>' }} style={{ fontSize: 17, lineHeight: 1.8, color: '#374151' }} />
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 30, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                {post.tags.map((tag, i) => (
                  <span key={i} style={{ padding: '6px 14px', background: blueLight, color: blue, borderRadius: 20, fontSize: 13, fontWeight: 500 }}>#{tag}</span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', color: '#64748b', fontWeight: 500 }}>
                <Heart size={16} /> {post.likes || 0} Likes
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', color: '#64748b', fontWeight: 500 }}>
                <Eye size={16} /> {post.views || 0} Views
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={18} color={blue} /> Search Articles
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
              <Search size={16} color="#94a3b8" />
              <input type="text" placeholder="Search..." value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent' }} />
            </div>
            {sidebarSearch && filteredSidebarPosts.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredSidebarPosts.map(p => (
                  <div key={p.id || p._id} onClick={() => { window.scrollTo(0, 0); onBack(); }}
                    style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#1e293b', fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = blueLight}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {p.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SHARE - FIXED */}
          <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={18} color={blue} /> Share Article
            </h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => handleShare('facebook')} style={shareBtnStyle('#1877f2')}>
                <ExternalLink size={14} /> Facebook
              </button>
              <button onClick={() => handleShare('twitter')} style={shareBtnStyle('#1da1f2')}>
                <ExternalLink size={14} /> Twitter
              </button>
              <button onClick={() => handleShare('linkedin')} style={shareBtnStyle('#0a66c2')}>
                <ExternalLink size={14} /> LinkedIn
              </button>
              <button onClick={() => handleShare('copy')} style={shareBtnStyle(copied ? '#16a34a' : '#64748b')}>
                {copied ? <Copy size={14} /> : <Link size={14} />} {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {allTags.length > 0 && (
            <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={18} color={blue} /> Popular Tags
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allTags.slice(0, 15).map((tag, i) => (
                  <span key={i} onClick={() => { onBack(); }}
                    style={{ padding: '5px 12px', background: blueLight, color: blue, borderRadius: 16, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bookmark size={18} color={blue} /> Related Articles
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {relatedPosts.map((p, i) => (
                  <div key={p.id || p._id || i} onClick={() => { window.scrollTo(0, 0); onBack(); }}
                    style={{ display: 'flex', gap: 10, cursor: 'pointer', padding: '8px 10px', borderRadius: 10 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <img src={getImageUrl(p.cover_image || p.coverImage)} alt="" 
                      style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 6, flexShrink: 0, background: '#f1f5f9' }}
                      onError={e => { e.target.src = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=100"; }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(p.created_at || p.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: `linear-gradient(135deg, ${blue}, ${blueDark})`, borderRadius: 14, padding: 24, color: 'white', textAlign: 'center' }}>
            <Sparkles size={28} style={{ marginBottom: 12, opacity: 0.8 }} />
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Enjoy this article?</h4>
            <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>Share it with your network!</p>
            <button onClick={() => handleShare('facebook')} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Share Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================
// MAIN BLOG COMPONENT
// ============================================
const Blog = () => {
  const [view, setView] = useState('listing');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchBlogPosts(); }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true); setError(null);
      const response = await blogApi.getAll();
      const postsData = response.data?.data || response.data || [];
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (err) {
      setError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'listing' ? (
        <motion.div key="listing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <BlogListingPage posts={posts} loading={loading} error={error}
            onPostSelect={(id) => { setSelectedPostId(id); setView('detail'); window.scrollTo(0, 0); }} 
            onRetry={fetchBlogPosts} />
        </motion.div>
      ) : (
        <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <BlogDetailPage postId={selectedPostId} allPosts={posts}
            onBack={() => { setView('listing'); setSelectedPostId(null); window.scrollTo(0, 0); }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Blog;