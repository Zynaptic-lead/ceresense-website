import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Search, X, ChevronLeft, ChevronRight,
  Download, Share2, Calendar, Users, Award, Camera, Video,
  Image as ImageIcon, Filter, Eye
} from "lucide-react";
import { galleryApi } from "../services/api";
import "../styles/Gallery.css";

const API_BASE = 'https://ceresense-ojfl.onrender.com';

const getFullImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/400x300/3b82f6/ffffff?text=CERESENSE";
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
};

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: "all", name: "All", icon: <Sparkles size={18} /> },
    { id: "learning", name: "Learning Sessions", icon: <Users size={18} /> },
    { id: "projects", name: "Student Projects", icon: <Award size={18} /> },
    { id: "events", name: "Events", icon: <Calendar size={18} /> },
    { id: "workshops", name: "Workshops", icon: <Camera size={18} /> },
    { id: "graduation", name: "Graduations", icon: <Video size={18} /> }
  ];

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await galleryApi.getAll();
      const data = response.data?.data || response.data || [];
      
      const formattedImages = Array.isArray(data) ? data.map(item => ({
        id: item._id || item.id,
        src: getFullImageUrl(item.imageUrl),
        category: item.category || 'learning',
        title: item.title || 'Untitled',
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
        description: item.description || '',
        tags: item.tags || [],
        featured: item.featured || false,
        views: item.views || 0,
        downloads: item.downloads || 0
      })) : [];
      
      setGalleryImages(formattedImages);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery. Please try again.');
      setGalleryImages([]);
    } finally {
      setLoading(false);
    }
  };

  const categoriesWithCounts = categories.map(category => ({
    ...category,
    count: category.id === "all" 
      ? galleryImages.length 
      : galleryImages.filter(img => img.category === category.id).length
  }));

  const filteredImages = useMemo(() => {
    return galleryImages.filter(image => {
      const matchesCategory = selectedCategory === "All" || image.category === categories.find(c => c.name === selectedCategory)?.id;
      const matchesSearch = !searchQuery.trim() || (
        image.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, galleryImages]);

  const handleNextImage = () => {
    const currentIndex = galleryImages.findIndex(img => img.id === selectedImage?.id);
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    setSelectedImage(galleryImages[nextIndex]);
  };

  const handlePrevImage = () => {
    const currentIndex = galleryImages.findIndex(img => img.id === selectedImage?.id);
    const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    setSelectedImage(galleryImages[prevIndex]);
  };

  const handleDownload = async (imageUrl, imageId) => {
    try {
      if (imageId) {
        await galleryApi.incrementDownloads(imageId).catch(() => {});
      }
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
      try {
        await navigator.share({
          title: `${image.title} - CERESENSE Gallery`,
          text: image.description,
          url: window.location.href,
        });
      } catch (error) {}
    } else {
      navigator.clipboard.writeText(`${image.title}\n${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  const handleImageClick = async (image) => {
    setSelectedImage(image);
    try {
      await galleryApi.incrementViews(image.id).catch(() => {});
    } catch (err) {}
  };

  if (loading) {
    return (
      <div className="gallery-page">
        <section className="gallery-hero">
          <div className="hero-background-pattern"></div>
          <div className="gallery-hero-container">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="gallery-hero-content">
              <div className="brand-badge"><Sparkles size={20} /><span>CERESENSE GALLERY</span></div>
              <h1 className="gallery-hero-title"><span className="ceresense-text">CERESENSE</span><span className="hero-subtitle">In Action</span></h1>
              <p className="gallery-hero-description">Loading gallery...</p>
            </motion.div>
          </div>
        </section>
        <section style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </section>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      <section className="gallery-hero">
        <div className="hero-background-pattern"></div>
        <div className="gallery-hero-container">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="gallery-hero-content">
            <div className="brand-badge"><Sparkles size={20} /><span>CERESENSE GALLERY</span></div>
            <h1 className="gallery-hero-title"><span className="ceresense-text">CERESENSE</span><span className="hero-subtitle">In Action</span></h1>
            <p className="gallery-hero-description">Explore {galleryImages.length} moments showcasing learning, projects, and community events.</p>
            <div className="stats-grid">
              <div className="stat-item"><span className="stat-number">{galleryImages.length}</span><span className="stat-label">Total Images</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="gallery-controls">
        <div className="controls-container">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input type="text" placeholder="Search images..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="clear-search"><X size={18} /></button>}
          </div>
          <div className="category-filters">
            <div className="filter-label"><Filter size={18} /><span>Filter by:</span></div>
            <div className="filter-buttons">
              {categoriesWithCounts.map((category) => (
                <button key={category.id} onClick={() => setSelectedCategory(category.name)} className={`filter-button ${selectedCategory === category.name ? 'active' : ''}`}>
                  {category.icon}<span>{category.name}</span><span className="count-badge">{category.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-grid-section">
        <div className="gallery-container">
          {error && (
            <div className="api-error">
              <p>⚠️ {error}</p>
              <button onClick={fetchGalleryData} className="retry-btn">Try Again</button>
            </div>
          )}
          <div className="current-filter-info">
            <p>Showing {filteredImages.length} of {galleryImages.length} images{selectedCategory !== "All" && ` in "${selectedCategory}"`}{searchQuery && ` matching "${searchQuery}"`}</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`${selectedCategory}-${searchQuery}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="gallery-grid">
              {filteredImages.length > 0 ? (
                filteredImages.map((image, index) => (
                  <motion.div key={image.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} className={`gallery-item ${image.featured ? 'featured' : ''}`} onClick={() => handleImageClick(image)}>
                    <div className="image-container">
                      <img src={image.src} alt={image.title} className="gallery-image" loading="lazy"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/400x300/3b82f6/ffffff?text=CERESENSE"; }} />
                      <div className="image-overlay">
                        <div className="overlay-content">
                          <div className="image-category">
                            {categories.find(c => c.id === image.category)?.icon || <ImageIcon size={18} />}
                            <span>{categories.find(c => c.id === image.category)?.name || image.category}</span>
                          </div>
                          <h3 className="image-title">{image.title}</h3>
                          <div className="image-stats-small"><span><Eye size={12} /> {image.views}</span><span><Download size={12} /> {image.downloads}</span></div>
                        </div>
                      </div>
                      {image.featured && <div className="featured-badge"><Sparkles size={12} /><span>Featured</span></div>}
                    </div>
                    <div className="image-info">
                      <div className="info-header"><h3 className="info-title">{image.title}</h3><span className="info-date">{image.date}</span></div>
                      <p className="info-description">{image.description}</p>
                      <div className="image-tags">{image.tags.map((tag, i) => (<span key={i} className="tag">{tag}</span>))}</div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="no-results">
                  <ImageIcon size={48} /><h3>No images found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                  <button onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }} className="reset-filters-btn">Reset All Filters</button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lightbox" onClick={() => setSelectedImage(null)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setSelectedImage(null)}><X size={24} /></button>
              <div className="lightbox-main">
                <img src={selectedImage.src} alt={selectedImage.title} className="lightbox-image"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/800x600/3b82f6/ffffff?text=Image+Not+Available"; }} />
                <button className="lightbox-nav prev" onClick={handlePrevImage}><ChevronLeft size={24} /></button>
                <button className="lightbox-nav next" onClick={handleNextImage}><ChevronRight size={24} /></button>
                <div className="lightbox-actions">
                  <button className="action-button" onClick={() => handleDownload(selectedImage.src, selectedImage.id)}>Download</button>
                  <button className="action-button" onClick={() => handleShare(selectedImage)}>Share</button>
                </div>
              </div>
              <div className="lightbox-info">
                <div className="info-header">
                  <div className="category-badge">{categories.find(c => c.id === selectedImage.category)?.icon || <ImageIcon size={18} />}<span>{categories.find(c => c.id === selectedImage.category)?.name || selectedImage.category}</span></div>
                  <span className="image-date">{selectedImage.date}</span>
                </div>
                <h2 className="lightbox-title">{selectedImage.title}</h2>
                <p className="lightbox-description">{selectedImage.description}</p>
                <div className="lightbox-stats">
                  <div className="stat"><Eye size={16} /><span>{selectedImage.views} views</span></div>
                  <div className="stat"><Download size={16} /><span>{selectedImage.downloads} downloads</span></div>
                </div>
                <div className="lightbox-tags">{selectedImage.tags.map((tag, index) => (<span key={index} className="tag">{tag}</span>))}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;