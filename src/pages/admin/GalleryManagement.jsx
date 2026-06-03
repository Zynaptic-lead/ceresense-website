import { useState, useEffect } from 'react'
import { Search, Filter, Eye, Edit, Trash2, Calendar, Plus, Upload, X, Star, Download } from 'lucide-react'
import { galleryApi } from '../../services/api'

const API_BASE = 'https://ceresense-ojfl.onrender.com'
const API_URL = `${API_BASE}/api`

const getFullImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

const GalleryManagement = () => {
  const [images, setImages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: 'workshops',
    description: '',
    tags: '',
    featured: false
  })

  useEffect(() => { fetchImages() }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await galleryApi.getAll()
      const data = response.data?.data || response.data || []
      setImages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching gallery:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file) => {
    const fd = new FormData()
    fd.append('image', file)
    const token = localStorage.getItem('accessToken')
    const response = await fetch(`${API_URL}/gallery`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fd
    })
    const data = await response.json()
    return data.data?.imageUrl || null
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await galleryApi.delete(id)
        setImages(images.filter(img => (img._id || img.id) !== id))
      } catch (err) {
        alert('Failed to delete image')
      }
    }
  }

  const handleEdit = (image) => {
    setEditingImage(image)
    setFormData({
      title: image.title || '',
      category: image.category || 'workshops',
      description: image.description || '',
      tags: Array.isArray(image.tags) ? image.tags.join(', ') : (image.tags || ''),
      featured: image.featured || false
    })
    setImagePreview(getFullImageUrl(image.imageUrl))
    setImageFile(null)
    setShowModal(true)
  }

  const handleAddNew = () => {
    setEditingImage(null)
    setFormData({
      title: '',
      category: 'workshops',
      description: '',
      tags: '',
      featured: false
    })
    setImagePreview(null)
    setImageFile(null)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      if (editingImage) {
        const updateData = {
          title: formData.title,
          category: formData.category,
          description: formData.description,
          tags: tagsArray,
          featured: formData.featured
        }
        await galleryApi.update(editingImage._id || editingImage.id, updateData)
      } else {
        // Create new - upload image with form data
        const fd = new FormData()
        if (imageFile) fd.append('image', imageFile)
        fd.append('title', formData.title)
        fd.append('category', formData.category)
        fd.append('description', formData.description)
        fd.append('tags', tagsArray.join(','))
        fd.append('featured', formData.featured)
        
        const token = localStorage.getItem('accessToken')
        await fetch(`${API_URL}/gallery`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        })
      }
      setShowModal(false)
      fetchImages()
    } catch (err) {
      console.error('Error saving image:', err)
      alert('Failed to save image')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleFeatured = async (image) => {
    try {
      await galleryApi.update(image._id || image.id, { featured: !image.featured })
      fetchImages()
    } catch (err) {
      console.error('Error toggling featured:', err)
    }
  }

  const filteredImages = images.filter(image => {
    const matchesSearch = (image.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || image.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#667eea', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>🖼️ Gallery Management</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Manage your gallery images</p>
        </div>
        <button onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <Upload size={18} /> Upload Image
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {[
          { value: images.length, label: 'Total Images' },
          { value: images.filter(i => i.featured).length, label: 'Featured' },
          { value: images.reduce((s, i) => s + (i.views || 0), 0).toLocaleString(), label: 'Total Views' },
          { value: images.reduce((s, i) => s + (i.downloads || 0), 0), label: 'Downloads' }
        ].map((stat, i) => (
          <div key={i} style={{ flex: 1, minWidth: '120px', textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search images..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }} />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          <option value="workshops">Workshops</option>
          <option value="graduation">Graduation</option>
          <option value="projects">Projects</option>
          <option value="learning">Learning</option>
          <option value="events">Events</option>
        </select>
      </div>

      {/* Gallery Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredImages.map(image => (
          <div key={image._id || image.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: '#f1f5f9' }}>
              <img 
                src={getFullImageUrl(image.imageUrl) || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300"} 
                alt={image.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300" }}
              />
              <button 
                onClick={() => handleToggleFeatured(image)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: image.featured ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', border: 'none', cursor: 'pointer' }}
              >
                <Star size={12} fill={image.featured ? 'white' : 'none'} /> {image.featured ? 'Featured' : 'Regular'}
              </button>
            </div>
            <div style={{ padding: '16px' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '8px', color: '#1e293b' }}>{image.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{image.description || 'No description'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ padding: '4px 12px', background: '#f1f5f9', borderRadius: '20px', fontSize: '12px', color: '#64748b' }}>{image.category}</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  <Eye size={12} style={{ verticalAlign: 'middle' }} /> {image.views || 0} • <Download size={12} style={{ verticalAlign: 'middle' }} /> {image.downloads || 0}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
                <Calendar size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{formatDate(image.createdAt)}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleEdit(image)} style={{ flex: 1, padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                  <Edit size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Edit
                </button>
                <button onClick={() => handleDelete(image._id || image.id)} style={{ flex: 1, padding: '8px', background: '#fef2f2', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#dc2626' }}>
                  <Trash2 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredImages.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No images found</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{editingImage ? 'Edit Image' : 'Upload New Image'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {/* Image Upload */}
              {!editingImage && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Image</label>
                  <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', minHeight: '150px', position: 'relative', cursor: 'pointer', background: imagePreview ? `url(${imagePreview}) center/cover no-repeat` : '#f8fafc' }}>
                    <input type="file" accept="image/*" onChange={handleImageChange} required={!editingImage} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                    {!imagePreview && (
                      <div style={{ color: '#94a3b8' }}>
                        <Upload size={32} style={{ marginBottom: '8px' }} />
                        <p>Click to upload image</p>
                        <small>JPG, PNG or GIF (max 5MB)</small>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Title</label>
                <input type="text" placeholder="Enter image title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}>
                    <option value="workshops">Workshops</option>
                    <option value="graduation">Graduation</option>
                    <option value="projects">Projects</option>
                    <option value="learning">Learning</option>
                    <option value="events">Events</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Featured</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px' }}>
                    <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    Mark as featured
                  </label>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea placeholder="Image description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Tags (comma separated)</label>
                <input type="text" placeholder="e.g., workshop, coding" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving...' : (editingImage ? 'Update Image' : 'Upload Image')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryManagement