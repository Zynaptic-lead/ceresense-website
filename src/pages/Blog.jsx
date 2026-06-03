import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, Clock, User, Heart, Bookmark, 
  Sparkles, TrendingUp, ThumbsUp, ThumbsDown, 
  Eye, ArrowLeft, Tag, Award
} from "lucide-react";
import { blogApi } from "../services/api";
import "../styles/Blog.css";

const API_URL = 'https://ceresense-ojfl.onrender.com';

// Helper to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600";
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}${imagePath}`;
};

// ==================== BLOG LISTING PAGE ====================

const BlogListingPage = ({ onPostSelect }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await blogApi.getAll();
      const postsData = response.data?.data || response.data || [];
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      });
    } catch { return dateString; }
  };

  if (loading) {
    return (
      <div className="blog-page">
        <section className="blog-hero">
          <div className="blog-hero-container">
            <div className="blog-hero-content">
              <div className="hero-badge">
                <Sparkles size={20} />
                <span>CERESENSE INSIGHTS</span>
              </div>
              <h1 className="blog-hero-title">Tech Insights & Innovations</h1>
              <p className="blog-hero-description">Loading articles...</p>
            </div>
          </div>
        </section>
        <section style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid #e2e8f0', borderTopColor: '#3b82f6',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </section>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="blog-hero-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="blog-hero-content">
            <div className="hero-badge"><Sparkles size={20} /><span>CERESENSE INSIGHTS</span></div>
            <h1 className="blog-hero-title">Tech Insights & Innovations</h1>
            <p className="blog-hero-description">Expert perspectives on technology, education, and the future of learning</p>
          </motion.div>
        </div>
      </section>

      <section className="blog-listing">
        <div className="listing-container">
          {error && (
            <div style={{ textAlign: 'center', padding: '20px', background: '#fef2f2', borderRadius: '12px', color: '#dc2626', marginBottom: '24px' }}>
              <p>{error}</p>
              <button onClick={fetchBlogPosts} style={{ marginTop: '12px', padding: '8px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Try Again</button>
            </div>
          )}

          <div className="listing-header">
            <h2 className="listing-title">Latest Articles</h2>
            <p className="listing-subtitle">
              {posts.length > 0 ? `Discover ${posts.length} articles from industry experts` : 'No articles yet. Check back soon!'}
            </p>
          </div>

          <div className="blog-cards-grid">
            {posts.map((post, index) => (
              <motion.article
                key={post._id || post.id || index}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }} className="blog-card"
                onClick={() => onPostSelect(post._id || post.id)} style={{ cursor: 'pointer' }}
              >
                <div className="card-image">
                  <img src={getImageUrl(post.coverImage)} alt={post.title} className="card-img" loading="lazy"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600"; }} />
                  <div className="card-category">
                    <TrendingUp size={14} />
                    <span>{post.category || "General"}</span>
                  </div>
                </div>

                <div className="card-content">
                  <div className="card-meta">
                    <div className="meta-item"><Calendar size={14} /><span>{formatDate(post.createdAt)}</span></div>
                    <div className="meta-item"><Clock size={14} /><span>{post.readTime || "5 min read"}</span></div>
                    <div className="meta-item"><Eye size={14} /><span>{post.views || 0}</span></div>
                  </div>

                  <h3 className="card-title">{post.title}</h3>
                  <p className="card-excerpt">{post.excerpt}</p>

                  <div className="card-author">
                    <div className="author-info">
                      <User size={14} />
                      <span>{post.author?.fullName || post.author?.name || "CERESENSE Team"}</span>
                    </div>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="card-tags">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="tag"><Tag size={12} /> {tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="card-footer">
                    <div className="card-stats"><div className="stat"><Heart size={14} /><span>{post.likes || 0}</span></div></div>
                    <button className="read-btn">Read Article →</button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="blog-cta">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Stay Updated</h2>
            <p className="cta-description">Subscribe to never miss the latest insights</p>
            <div className="cta-stats">
              <div className="cta-stat"><Award size={24} /><div><h3>{posts.length}</h3><p>Articles</p></div></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// ==================== BLOG DETAIL PAGE ====================

const BlogDetailPage = ({ postId, onBack }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPostDetail(); }, [postId]);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h3>Article not found</h3>
        <button onClick={onBack} style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '16px' }}>← Back to Articles</button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try { return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); } catch { return dateString; }
  };

  return (
    <div className="blog-page">
      <section className="blog-hero" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '60px 20px' }}>
        <div className="blog-hero-container">
          <div className="blog-hero-content">
            <div className="hero-badge"><TrendingUp size={20} /><span>{post.category || 'General'}</span></div>
            <h1 className="blog-hero-title" style={{ fontSize: '36px' }}>{post.title}</h1>
            <p className="blog-hero-description">{post.excerpt}</p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
              <span>📅 {formatDate(post.createdAt)}</span>
              <span>👤 {post.author?.fullName || 'Admin'}</span>
              <span>📂 {post.category || 'General'}</span>
              <span>⏱️ {post.readTime || '5 min read'}</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', marginBottom: '30px', color: '#64748b' }}>
          <ArrowLeft size={16} /> Back to Articles
        </button>

        {/* Cover Image */}
        {post.coverImage && (
          <img src={getImageUrl(post.coverImage)} alt={post.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '16px', marginBottom: '30px' }}
            onError={(e) => { e.target.style.display = 'none'; }} />
        )}

        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          {/* Render HTML content properly */}
          <div 
            dangerouslySetInnerHTML={{ __html: post.content || '<p>No content available.</p>' }}
            style={{ fontSize: '18px', lineHeight: '1.8', color: '#374151', marginBottom: '30px' }}
          />

          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '30px' }}>
              {post.tags.map((tag, i) => (
                <span key={i} style={{ padding: '6px 14px', background: '#f1f5f9', borderRadius: '20px', fontSize: '13px', color: '#64748b' }}>#{tag}</span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', padding: '20px 0', borderTop: '1px solid #e2e8f0' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: 500 }}>
              <Heart size={18} /> {post.likes || 0}
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: 500 }}>
              <Eye size={18} /> {post.views || 0} views
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const Blog = () => {
  const [view, setView] = useState('listing');
  const [selectedPostId, setSelectedPostId] = useState(null);

  return (
    <>
      {view === 'listing' ? (
        <BlogListingPage onPostSelect={(id) => { setSelectedPostId(id); setView('detail'); window.scrollTo(0, 0); }} />
      ) : (
        <BlogDetailPage postId={selectedPostId} onBack={() => { setView('listing'); setSelectedPostId(null); window.scrollTo(0, 0); }} />
      )}
    </>
  );
};

export default Blog;