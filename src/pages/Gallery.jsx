import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Search, X, ChevronLeft, ChevronRight,
  Download, Share2, Calendar, Users, Award, Camera, Video,
  Image as ImageIcon, Filter, Eye, RefreshCw
} from "lucide-react";
import { galleryApi } from "../services/api";

// ============================================
// BRAND COLORS
// ============================================
const blue = '#3b82f6';
const blueDark = '#2563eb';
const blueLight = '#eff6ff';

// ============================================
// CONSTANTS
// ============================================
const API_BASE = 'https://blog.ceresense.com.ng';
const FALLBACK = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600';

const getFullImageUrl = (imagePath, imageUrl) => {
  if (imageUrl) return imageUrl;
  if (imagePath && imagePath.startsWith('http')) return imagePath;
  if (imagePath) {
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_BASE}/storage/${cleanPath}`;
  }
  return FALLBACK;
};

const CATEGORIES = [
  { id: "all", name: "All", icon: <Sparkles size={18} /> },
  { id: "learning", name: "Learning", icon: <Users size={18} /> },
  { id: "projects", name: "Projects", icon: <Award size={18} /> },
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
      setLoading(true); setError(null);
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
      setError('Failed to load gallery.');
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
      try { await navigator.share({ title: `${image.title} - CERESENSE`, text: image.description }); } catch {}
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
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <section style={{ background: `linear-gradient(135deg, ${blueDark}, #1e3a5f)`, padding: '60px 20px 40px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', color: 'white' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: 20, fontSize: 14, fontWeight: 500, marginBottom: 24, border: '1px solid rgba(255,255,255,0.3)' }}>
              <Sparkles size={20} /> CERESENSE GALLERY
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16 }}>CERESENSE In Action</h1>
            <p style={{ fontSize: 18, opacity: 0.9 }}>Loading amazing moments...</p>
          </div>
        </section>
        <section style={{ padding: 80, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #e2e8f0', borderTopColor: blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 16, color: '#64748b', fontWeight: 500 }}>Loading gallery...</p>
        </section>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${blueDark}, #1e3a5f)`, padding: '60px 20px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: 20, fontSize: 14, fontWeight: 500, marginBottom: 24, border: '1px solid rgba(255,255,255,0.3)' }}>
              <Sparkles size={20} /> CERESENSE GALLERY
            </div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, marginBottom: 16 }}>CERESENSE In Action</h1>
            <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 600, margin: '0 auto 24px' }}>
              Explore {galleryImages.length} moments showcasing learning, projects, and community events.
            </p>
            <div style={{ display: 'flex', gap: 40, justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700 }}>{galleryImages.length}</div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>Total Images</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700 }}>{galleryImages.filter(i => i.featured).length}</div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>Featured</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Controls */}
      <section style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 250, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
              <Search size={20} color="#94a3b8" />
              <input type="text" placeholder="Search images..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }} />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              <Filter size={18} /> Filter:
            </span>
            {categoriesWithCounts.map((category) => (
              <button key={category.id} onClick={() => setSelectedCategory(category.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                  background: selectedCategory === category.name ? blue : 'white',
                  border: `1px solid ${selectedCategory === category.name ? blue : '#e2e8f0'}`,
                  borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  color: selectedCategory === category.name ? 'white' : '#64748b',
                  transition: 'all 0.15s',
                }}>
                {category.icon} {category.name}
                <span style={{ 
                  padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                  background: selectedCategory === category.name ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: selectedCategory === category.name ? 'white' : '#64748b',
                }}>{category.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {error && (
            <div style={{ textAlign: 'center', padding: 20, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', marginBottom: 20 }}>
              <p style={{ margin: '0 0 12px 0' }}>⚠️ {error}</p>
              <button onClick={fetchGalleryData} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: blue, color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
              Showing <strong style={{ color: '#1e293b' }}>{filteredImages.length}</strong> of {galleryImages.length} images
              {selectedCategory !== "All" && <> in <strong style={{ color: blue }}>"{selectedCategory}"</strong></>}
            </p>
            {(selectedCategory !== "All" || searchQuery) && (
              <button onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                style={{ padding: '6px 14px', background: blueLight, color: blue, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Clear Filters
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`${selectedCategory}-${searchQuery}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              
              {filteredImages.length > 0 ? filteredImages.map((image, index) => (
                <motion.div key={image.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                  onClick={() => handleImageClick(image)}
                  style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  
                  <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#f1f5f9' }}>
                    <img src={image.src} alt={image.title} loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.src = FALLBACK; }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'flex-end', padding: 16 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                      <div style={{ color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12 }}>
                          {CATEGORIES.find(c => c.id === image.category)?.icon || <ImageIcon size={14} />}
                          {CATEGORIES.find(c => c.id === image.category)?.name || image.category}
                        </div>
                        <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{image.title}</h3>
                      </div>
                    </div>
                    {image.featured && (
                      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: blue, color: 'white', borderRadius: 14, fontSize: 11, fontWeight: 600 }}>
                        <Sparkles size={11} /> Featured
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <h3 style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{image.title}</h3>
                      <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{image.date}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{image.description || 'No description'}</p>
                    {image.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                        {image.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} style={{ padding: '2px 8px', background: blueLight, color: blue, borderRadius: 12, fontSize: 11 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} /> {image.views}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Download size={12} /> {image.downloads}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#94a3b8', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                  <ImageIcon size={48} style={{ opacity: 0.4, marginBottom: 12 }} />
                  <h3 style={{ color: '#1e293b', marginBottom: 8 }}>No images found</h3>
                  <button onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                    style={{ padding: '10px 24px', background: blue, color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
                    Reset Filters
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 20, maxWidth: 1000, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
              
              <div style={{ position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 350 }}>
                <button onClick={() => setSelectedImage(null)}
                  style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex' }}>
                  <X size={20} />
                </button>
                <img src={selectedImage.src} alt={selectedImage.title}
                  style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }}
                  onError={e => { e.target.src = FALLBACK; }} />
                <button onClick={handlePrevImage}
                  style={{ position: 'absolute', left: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', padding: 10, borderRadius: '50%', display: 'flex' }}>
                  <ChevronLeft size={22} />
                </button>
                <button onClick={handleNextImage}
                  style={{ position: 'absolute', right: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', padding: 10, borderRadius: '50%', display: 'flex' }}>
                  <ChevronRight size={22} />
                </button>
                <div style={{ position: 'absolute', bottom: 12, display: 'flex', gap: 8 }}>
                  <button onClick={() => handleDownload(selectedImage.src, selectedImage.id)}
                    style={{ padding: '8px 14px', background: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <Download size={15} /> Download
                  </button>
                  <button onClick={() => handleShare(selectedImage)}
                    style={{ padding: '8px 14px', background: blue, color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <Share2 size={15} /> Share
                  </button>
                </div>
              </div>
              
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: blueLight, color: blue, borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                    {CATEGORIES.find(c => c.id === selectedImage.category)?.icon || <ImageIcon size={14} />}
                    {CATEGORIES.find(c => c.id === selectedImage.category)?.name || selectedImage.category}
                  </span>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{selectedImage.date}</span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>{selectedImage.title}</h2>
                <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 16px 0' }}>{selectedImage.description}</p>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}><Eye size={15} /> {selectedImage.views} views</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}><Download size={15} /> {selectedImage.downloads} downloads</span>
                </div>
                {selectedImage.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedImage.tags.map((tag, i) => (
                      <span key={i} style={{ padding: '4px 12px', background: blueLight, color: blue, borderRadius: 16, fontSize: 12, fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Gallery;