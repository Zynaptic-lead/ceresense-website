import { useState, useEffect } from 'react'
import { Search, Filter, Eye, Edit, Trash2, Calendar, Plus, X, Tag, Upload } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { blogApi } from '../../services/api'

const API_BASE = 'https://ceresense-ojfl.onrender.com'
const API_URL = `${API_BASE}/api`

// Helper to get full image URL
const getFullImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

const BlogManagement = () => {
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    category: 'Technology',
    excerpt: '',
    content: '',
    status: 'draft',
    tags: ''
  })

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  }

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await blogApi.getAll()
      const postsData = response.data?.data || response.data || []
      setPosts(Array.isArray(postsData) ? postsData : [])
    } catch (err) {
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setCoverPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const token = localStorage.getItem('accessToken')
    const response = await fetch(`${API_URL}/blog/upload/cover`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: fd
    })
    const data = await response.json()
    return data.data?.url || null
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await blogApi.delete(id)
        setPosts(posts.filter(post => (post._id || post.id) !== id))
      } catch (err) {
        alert('Failed to delete post')
      }
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post)
    setFormData({
      title: post.title || '',
      category: post.category || 'Technology',
      excerpt: post.excerpt || '',
      content: post.content || '',
      status: post.status || 'draft',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '')
    })
    // Set cover preview with full URL
    setCoverPreview(getFullImageUrl(post.coverImage))
    setCoverImage(null)
    setShowModal(true)
  }

  const handleAddNew = () => {
    setEditingPost(null)
    setFormData({
      title: '',
      category: 'Technology',
      excerpt: '',
      content: '',
      status: 'draft',
      tags: ''
    })
    setCoverPreview(null)
    setCoverImage(null)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      let coverImageUrl = editingPost?.coverImage || null
      if (coverImage) {
        coverImageUrl = await uploadImage(coverImage)
      }
      const postData = {
        ...formData,
        tags: tagsArray,
        coverImage: coverImageUrl,
        readTime: '5 min read'
      }
      if (editingPost) {
        await blogApi.update(editingPost._id || editingPost.id, postData)
      } else {
        await blogApi.create(postData)
      }
      setShowModal(false)
      fetchPosts()
    } catch (err) {
      console.error('Error saving post:', err)
      alert(err.response?.data?.message || 'Failed to save post')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = (post.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

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
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>📝 Blog Management</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Create, edit, and manage your blog posts</p>
        </div>
        <button onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={18} /> New Post
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search posts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }} />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Design">Design</option>
          <option value="Programming">Programming</option>
          <option value="Business">Business</option>
          <option value="Education">Education</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Post</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Views</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map(post => (
              <tr key={post._id || post.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* FIXED: Image with full URL */}
                    <img 
                      src={getFullImageUrl(post.coverImage) || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=100"} 
                      alt="" 
                      style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, background: '#f1f5f9' }}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=100" }}
                    />
                    <div>
                      <h4 style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{post.title}</h4>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{(post.excerpt || '').substring(0, 60)}...</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 12px', background: '#f1f5f9', borderRadius: '20px', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{post.category || 'General'}</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: post.status === 'published' ? '#f0fdf4' : '#fefce8', color: post.status === 'published' ? '#16a34a' : '#ca8a04' }}>{post.status}</span>
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}><Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{formatDate(post.createdAt)}</td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}><Eye size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{post.views || 0}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(post)} style={{ padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#64748b' }}><Edit size={14} /></button>
                    <button onClick={() => handleDelete(post._id || post.id)} style={{ padding: '8px 12px', background: '#fef2f2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPosts.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No posts found</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {/* Cover Image Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Cover Image</label>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', minHeight: '150px', position: 'relative', cursor: 'pointer', background: coverPreview ? `url(${coverPreview}) center/cover no-repeat` : '#f8fafc' }}>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  {!coverPreview && (
                    <div style={{ color: '#94a3b8' }}>
                      <Upload size={32} style={{ marginBottom: '8px' }} />
                      <p>Click to upload cover image</p>
                      <small>JPG, PNG or GIF (max 5MB)</small>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Title</label>
                <input type="text" placeholder="Enter post title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}>
                    <option value="Technology">Technology</option>
                    <option value="Design">Design</option>
                    <option value="Programming">Programming</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Excerpt</label>
                <textarea placeholder="Brief description" value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} rows="2" required style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Content</label>
                <ReactQuill theme="snow" value={formData.content} onChange={(value) => setFormData({...formData, content: value})} modules={modules} style={{ height: '300px', marginBottom: '50px' }} placeholder="Write your blog content here..." />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Tags (comma separated)</label>
                <div style={{ position: 'relative' }}>
                  <Tag size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="text" placeholder="e.g., React, JavaScript, Web" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 40px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving...' : (editingPost ? 'Update Post' : 'Create Post')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlogManagement