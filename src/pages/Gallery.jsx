import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Search, X, ChevronLeft, ChevronRight,
  Download, Share2, Calendar, Users, Award, Camera, Video,
  Image as ImageIcon, Filter, Eye, RefreshCw
} from "lucide-react";
import { galleryApi } from "../services/api";
import "../styles/Gallery.css";

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

const getFullImageUrl = (imagePath, imageUrl) => {
  if (imageUrl) return imageUrl;
  if (imagePath && imagePath.startsWith('http')) return imagePath;
  if (imagePath) return `${API_BASE}/storage/${imagePath}`;
  return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600";
};

const CATEGORIES = [
  { id: "all", name: "All", icon: <Sparkles size={18} /> },
  { id: "learning", name: "Learning Sessions", icon: <Users size={18} /> },
  { id: "projects", name: "Student Projects", icon: <Award size={18} /> },
  { id: "events", name: "Events", icon: <Calendar size={18} /> },
  { id: "workshops", name: "Workshops", icon: <Camera size={18} /> },
  { id: "graduation", name: "Graduations", icon: <Video size={18} /> }
];

// ============================================
// COMPONENT
// ============================================
const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchGalleryData(); }, []);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await galleryApi.getAll();
      const data = response.data?.data || response.data || [];
      
      const formatted = Array.isArray(data) ? data.map(item => ({
        id: item.id || item._id,
        src: item.image_url || getFullImageUrl(item.image_path, item.image_url),
        category: item.category || 'learning',
        title: item.title || 'Untitled',
        date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
        description: item.description || '',
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',') : []),
        featured: item.featured || false,
        views: item.views || 0,
        downloads: item.downloads || 0
      })) : [];
      
      setGalleryImages(formatted);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery. Please try again.');
      setGalleryImages([]);
    } finally {
      setLoading(false);
    }
  };

  const categoriesWithCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: cat.id === "all" ? galleryImages.length : galleryImages.filter(img => img.category === cat.id).length
  }));

  const filteredImages = useMemo(() => {
    return galleryImages.filter(image => {
      const matchesCategory = selectedCategory === "All" || image.category === CATEGORIES.find(c => c.name === selectedCategory)?.id;
      const matchesSearch = !searchQuery.trim() || (
        image.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, galleryImages]);

  const handleNextImage = () => {
    const idx = galleryImages.findIndex(img => img.id === selectedImage?.id);
    setSelectedImage(galleryImages[(idx + 1) % galleryImages.length]);
  };

  const handlePrevImage = () => {
    const idx = galleryImages.findIndex(img => img.id === selectedImage?.id);
    setSelectedImage(galleryImages[(idx - 1 + galleryImages.length) % galleryImages.length]);
  };

  const handleDownload = async (imageUrl, imageId) => {
    try {
      if (imageId) await galleryApi.update(imageId, {}).catch(() => {});
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ceresense-gallery-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async (image) => {
    if (navigator.share) {
      try { await navigator.share({ title: `${image.title} - CERESENSE`, text: image.description, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(`${image.title}\n${window.location.href}`);
      alert('Link copied!');
    }
  };

  const handleImageClick = async (image) => {
    setSelectedImage(image);
    try { await galleryApi.update(image.id, {}).catch(() => {}); } catch {}
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="gallery-page">
        <section className="gallery-hero" style={{ background: `linear-gradient(135deg, ${blueDark}, #1e3a5f)` }}>
          <div className="hero-background-pattern"></div>
          <div className="gallery-hero-container">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="gallery-hero-content">
              <div className="brand-badge"><Sparkles size={20} /><span>CERESENSE GALLERY</span></div>
              <h1 className="gallery-hero-title"><span className="ceresense-text">CERESENSE</span><span className="hero-subtitle">In Action</span></h1>
              <p className="gallery-hero-description">Loading amazing moments...</p>
            </motion.div>
          </div>
        </section>
        <section style={{ padding: '80px 20px', textAlign: 'center', background: '#f8fafc' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #e2e8f0', borderTopColor: blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 16, color: '#64748b', fontWeight: 500 }}>Loading gallery...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </section>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="gallery-page">
      {/* ===== HERO SECTION ===== */}
      <section className="gallery-hero" style={{ background: `linear-gradient(135deg, ${blueDark}, #1e3a5f)` }}>
        <div className="hero-background-pattern"></div>
        <div className="gallery-hero-container">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="gallery-hero-content">
            <div className="brand-badge">
              <Sparkles size={20} />
              <span>CERESENSE GALLERY</span>
            </div>
            <h1 className="gallery-hero-title">
              <span className="ceresense-text">CERESENSE</span>
              <span className="hero-subtitle">In Action</span>
            </h1>
            <p className="gallery-hero-description">
              Explore {galleryImages.length} moments showcasing learning, projects, and community events.
            </p>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{galleryImages.length}</span>
                <span className="stat-label">Total Images</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{galleryImages.filter(i => i.featured).length}</span>
                <span className="stat-label">Featured</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CONTROLS ===== */}
      <section className="gallery-controls" style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div className="controls-container">
          {/* Search */}
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ outline: 'none' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="clear-search">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="category-filters">
            <div className="filter-label">
              <Filter size={18} />
              <span>Filter by:</span>
            </div>
            <div className="filter-buttons">
              {categoriesWithCounts.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`filter-button ${selectedCategory === category.name ? 'active' : ''}`}
                  style={selectedCategory === category.name ? { background: blue, borderColor: blue, color: 'white' } : {}}
                >
                  {category.icon}
                  <span>{category.name}</span>
                  <span className="count-badge">{category.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== GALLERY GRID ===== */}
      <section className="gallery-grid-section" style={{ background: '#f8fafc' }}>
        <div className="gallery-container">
          {/* Error */}
          {error && (
            <div className="api-error" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '20px 24px', textAlign: 'center', marginBottom: 20 }}>
              <p style={{ color: '#dc2626', marginBottom: 12 }}>⚠️ {error}</p>
              <button onClick={fetchGalleryData} className="retry-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: blue, color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          )}

          {/* Info */}
          <div className="current-filter-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
              Showing <strong style={{ color: '#1e293b' }}>{filteredImages.length}</strong> of {galleryImages.length} images
              {selectedCategory !== "All" && <> in <strong style={{ color: blue }}>"{selectedCategory}"</strong></>}
              {searchQuery && <> matching <strong style={{ color: blue }}>"{searchQuery}"</strong></>}
            </p>
            {(selectedCategory !== "All" || searchQuery) && (
              <button
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                style={{ padding: '6px 14px', background: blueLight, color: blue, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="gallery-grid"
            >
              {filteredImages.length > 0 ? (
                filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`gallery-item ${image.featured ? 'featured' : ''}`}
                    onClick={() => handleImageClick(image)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="image-container">
                      <img
                        src={image.src}
                        alt={image.title}
                        className="gallery-image"
                        loading="lazy"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600"; }}
                      />
                      <div className="image-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                        <div className="overlay-content">
                          <div className="image-category">
                            {CATEGORIES.find(c => c.id === image.category)?.icon || <ImageIcon size={18} />}
                            <span>{CATEGORIES.find(c => c.id === image.category)?.name || image.category}</span>
                          </div>
                          <h3 className="image-title">{image.title}</h3>
                          <div className="image-stats-small">
                            <span><Eye size={12} /> {image.views}</span>
                            <span><Download size={12} /> {image.downloads}</span>
                          </div>
                        </div>
                      </div>
                      {image.featured && (
                        <div className="featured-badge" style={{ background: blue, color: 'white' }}>
                          <Sparkles size={12} /><span>Featured</span>
                        </div>
                      )}
                    </div>
                    <div className="image-info">
                      <div className="info-header">
                        <h3 className="info-title">{image.title}</h3>
                        <span className="info-date">{image.date}</span>
                      </div>
                      <p className="info-description">{image.description}</p>
                      {image.tags.length > 0 && (
                        <div className="image-tags">
                          {image.tags.slice(0, 4).map((tag, i) => (
                            <span key={i} className="tag" style={{ background: blueLight, color: blue }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="no-results" style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                  <ImageIcon size={48} style={{ opacity: 0.4, marginBottom: 12 }} />
                  <h3 style={{ color: '#1e293b', marginBottom: 8 }}>No images found</h3>
                  <p style={{ marginBottom: 16 }}>Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                    style={{ padding: '10px 24px', background: blue, color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ===== LIGHTBOX ===== */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lightbox"
            onClick={() => setSelectedImage(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="lightbox-content"
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 20, maxWidth: 1000, width: '100%', maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}
            >
              {/* Close */}
              <button
                className="lightbox-close"
                onClick={() => setSelectedImage(null)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', padding: 10, borderRadius: '50%', zIndex: 10, display: 'flex' }}
              >
                <X size={24} />
              </button>

              {/* Image */}
              <div className="lightbox-main" style={{ position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="lightbox-image"
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"; }}
                />
                <button className="lightbox-nav prev" onClick={handlePrevImage} style={{ position: 'absolute', left: 16, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', padding: 12, borderRadius: '50%', display: 'flex' }}>
                  <ChevronLeft size={24} />
                </button>
                <button className="lightbox-nav next" onClick={handleNextImage} style={{ position: 'absolute', right: 16, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', padding: 12, borderRadius: '50%', display: 'flex' }}>
                  <ChevronRight size={24} />
                </button>
                <div className="lightbox-actions" style={{ position: 'absolute', bottom: 16, display: 'flex', gap: 8 }}>
                  <button className="action-button" onClick={() => handleDownload(selectedImage.src, selectedImage.id)} style={{ padding: '8px 16px', background: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <Download size={16} /> Download
                  </button>
                  <button className="action-button" onClick={() => handleShare(selectedImage)} style={{ padding: '8px 16px', background: blue, color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="lightbox-info" style={{ padding: 24 }}>
                <div className="info-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div className="category-badge" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: blueLight, color: blue, borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                    {CATEGORIES.find(c => c.id === selectedImage.category)?.icon || <ImageIcon size={16} />}
                    <span>{CATEGORIES.find(c => c.id === selectedImage.category)?.name || selectedImage.category}</span>
                  </div>
                  <span className="image-date" style={{ fontSize: 13, color: '#64748b' }}>{selectedImage.date}</span>
                </div>
                <h2 className="lightbox-title" style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{selectedImage.title}</h2>
                <p className="lightbox-description" style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>{selectedImage.description}</p>
                <div className="lightbox-stats" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div className="stat" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}><Eye size={16} /><span>{selectedImage.views} views</span></div>
                  <div className="stat" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}><Download size={16} /><span>{selectedImage.downloads} downloads</span></div>
                </div>
                {selectedImage.tags.length > 0 && (
                  <div className="lightbox-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedImage.tags.map((tag, index) => (
                      <span key={index} className="tag" style={{ padding: '4px 12px', background: blueLight, color: blue, borderRadius: 16, fontSize: 12, fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .filter-button {
          transition: all 0.2s ease;
        }
        .filter-button:hover {
          background: ${blueLight} !important;
          border-color: ${blue} !important;
          color: ${blue} !important;
        }
        .filter-button.active {
          background: ${blue} !important;
          border-color: ${blue} !important;
          color: white !important;
        }
        
        .gallery-item {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
};

export default Gallery; 