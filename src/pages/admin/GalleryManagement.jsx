import { useState, useEffect } from 'react'
import { Search, Eye, Edit, Trash2, Calendar, Plus, Upload, X, Star, Download, Image as ImageIcon, Grid, List } from 'lucide-react'
import { galleryApi } from '../../services/api'

// ============================================
// BRAND COLORS
// ============================================
const blue = '#3b82f6'
const blueDark = '#2563eb'
const blueLight = '#eff6ff'
const blueGlow = 'rgba(59,130,246,0.35)'

// ============================================
// CONSTANTS
// ============================================
const API_BASE = 'https://blog.ceresense.com.ng/'

const getFullImageUrl = (imagePath, imageUrl) => {
  if (imageUrl) return imageUrl
  if (imagePath && imagePath.startsWith('http')) return imagePath
  if (imagePath) return `${API_BASE}/storage/${imagePath}`
  return null
}

const CATEGORIES = ['general','workshops','graduation','projects','learning','events','sports','campus','conference','seminar']

// ============================================
// STYLES
// ============================================
const S = {
  page: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  card: { background:'white', borderRadius:16, border:'1px solid #e2e8f0', padding:24, marginBottom:24 },
  cardHead: { display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 },
  btnP: { display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', background:`linear-gradient(135deg, ${blue}, ${blueDark})`, color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', boxShadow:`0 4px 15px ${blueGlow}`, transition:'all 0.2s' },
  btnI: (bg,clr) => ({ padding:'8px 12px', background:bg, border:'none', borderRadius:8, cursor:'pointer', color:clr, display:'inline-flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }),
  searchBox: { flex:1, minWidth:200, display:'flex', alignItems:'center', gap:12, padding:'10px 16px', background:'white', border:'1px solid #e2e8f0', borderRadius:10, transition:'border-color 0.2s' },
  searchIn: { flex:1, border:'none', outline:'none', fontSize:14, background:'transparent' },
  select: { padding:'10px 16px', background:'white', border:'1px solid #e2e8f0', borderRadius:10, fontSize:14, cursor:'pointer', outline:'none', minWidth:160 },
  input: { width:'100%', padding:12, border:'2px solid #e2e8f0', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' },
  label: { display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 },
  th: { padding:'14px 16px', textAlign:'left', fontSize:12, color:'#64748b', textTransform:'uppercase', fontWeight:600, whiteSpace:'nowrap' },
  badge: (bg,clr) => ({ padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600, background:bg, color:clr, display:'inline-flex', alignItems:'center', whiteSpace:'nowrap' }),
  modalBg: { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:20, backdropFilter:'blur(4px)' },
  modalBox: { background:'white', borderRadius:16, width:'100%', maxHeight:'90vh', overflow:'auto', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' },
  modalHead: { padding:'20px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1, borderRadius:'16px 16px 0 0' },
  empty: { padding:'60px 20px', textAlign:'center', color:'#94a3b8' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:16, marginBottom:24 },
  statCard: { padding:20, background:'white', borderRadius:12, border:'1px solid #e2e8f0', textAlign:'center' },
  coverUp: (prev) => ({ border:'2px dashed #e2e8f0', borderRadius:12, padding:30, textAlign:'center', minHeight:180, position:'relative', cursor:'pointer', background:prev?undefined:'#f8fafc', backgroundSize:'cover', backgroundPosition:'center', transition:'border-color 0.2s' })
}

// ============================================
// COMPONENT
// ============================================
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
  const [viewMode, setViewMode] = useState('grid')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [formData, setFormData] = useState({ title:'', category:'general', description:'', tags:'', featured:false })

  useEffect(() => { fetchImages() }, [])

  const fetchImages = async () => {
    try { setLoading(true); const r = await galleryApi.getAll(); const d = r.data?.data||r.data||[]; setImages(Array.isArray(d)?d:[]) }
    catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg','image/png','image/gif','image/webp'].includes(file.type)) { alert('Invalid file type (JPG, PNG, GIF, WebP)'); return }
    if (file.size > 5*1024*1024) { alert('Image must be less than 5MB'); return }
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const confirmDelete = (image) => setDeleteConfirm(image)

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try { await galleryApi.delete(deleteConfirm.id); setImages(imgs=>imgs.filter(i=>i.id!==deleteConfirm.id)); setDeleteConfirm(null) }
    catch(e) { alert('Failed to delete') }
  }

  const handleEdit = (image) => {
    setEditingImage(image)
    setFormData({ title:image.title||'', category:image.category||'general', description:image.description||'', tags:Array.isArray(image.tags)?image.tags.join(', '):(image.tags||''), featured:image.featured||false })
    setImagePreview(image.image_url||getFullImageUrl(image.image_path))
    setImageFile(null); setShowModal(true)
  }

  const handleAddNew = () => {
    setEditingImage(null)
    setFormData({ title:'', category:'general', description:'', tags:'', featured:false })
    setImagePreview(null); setImageFile(null); setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (editingImage) {
        const fd = new FormData()
        fd.append('title',formData.title.trim()); fd.append('category',formData.category)
        fd.append('description',formData.description.trim()); fd.append('tags',formData.tags)
        fd.append('featured',formData.featured?'true':'false'); fd.append('_method','PUT')
        if (imageFile) fd.append('image',imageFile)
        await fetch(`${API_BASE}/api/gallery/${editingImage.id}`,{ method:'POST', headers:{'Authorization':`Bearer ${token}`,'Accept':'application/json'}, body:fd })
      } else {
        if (!imageFile) { alert('Select an image'); setSubmitting(false); return }
        const fd = new FormData()
        fd.append('title',formData.title.trim()); fd.append('category',formData.category)
        fd.append('description',formData.description.trim()); fd.append('tags',formData.tags)
        fd.append('featured',formData.featured?'true':'false'); fd.append('image',imageFile)
        await galleryApi.create(fd,{ headers:{'Content-Type':'multipart/form-data'} })
      }
      setShowModal(false); fetchImages()
    } catch(e) { alert(e.response?.data?.message||'Failed to save') }
    finally { setSubmitting(false) }
  }

  const handleToggleFeatured = async (image) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`${API_BASE}/api/gallery/${image.id}`,{ method:'PUT', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json','Accept':'application/json'}, body:JSON.stringify({featured:!image.featured}) })
      fetchImages()
    } catch(e) { console.error(e) }
  }

  const handleDownload = async (image) => {
    const url = image.image_url||getFullImageUrl(image.image_path)
    if (url) window.open(url,'_blank')
    try { await fetch(`${API_BASE}/api/gallery/download/${image.id}`,{ headers:{'Authorization':`Bearer ${localStorage.getItem('accessToken')}`,'Accept':'application/json'} }); fetchImages() }
    catch(e) { console.error(e) }
  }

  const filteredImages = images.filter(i => {
    const m = (i.title||'').toLowerCase().includes(searchTerm.toLowerCase())
    const c = filterCategory==='all'||i.category===filterCategory
    return m&&c
  })

  const fmtDate = (d) => { if(!d) return ''; return new Date(d).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' }) }

  const stats = { total:images.length, featured:images.filter(i=>i.featured).length, views:images.reduce((s,i)=>s+(i.views||0),0), downloads:images.reduce((s,i)=>s+(i.downloads||0),0) }

  // Loading
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:400 }}>
      <div style={{ width:44, height:44, border:'3px solid #e2e8f0', borderTopColor:blue, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.card}>
        <div style={S.cardHead}>
          <div><h1 style={{ fontSize:24, fontWeight:700, color:'#1e293b', margin:'0 0 4px' }}>🖼️ Gallery Management</h1><p style={{ color:'#64748b', margin:0 }}>Manage your gallery images and media files</p></div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <div style={{ display:'flex', background:'#f1f5f9', borderRadius:10, padding:3 }}>
              <button onClick={()=>setViewMode('grid')} style={{ padding:'8px 14px', border:'none', borderRadius:8, cursor:'pointer', background:viewMode==='grid'?'white':'transparent', fontWeight:viewMode==='grid'?600:400, fontSize:13, boxShadow:viewMode==='grid'?'0 1px 3px rgba(0,0,0,0.1)':'none', transition:'all 0.2s', display:'flex', alignItems:'center', gap:6 }}><Grid size={16} /> Grid</button>
              <button onClick={()=>setViewMode('list')} style={{ padding:'8px 14px', border:'none', borderRadius:8, cursor:'pointer', background:viewMode==='list'?'white':'transparent', fontWeight:viewMode==='list'?600:400, fontSize:13, boxShadow:viewMode==='list'?'0 1px 3px rgba(0,0,0,0.1)':'none', transition:'all 0.2s', display:'flex', alignItems:'center', gap:6 }}><List size={16} /> List</button>
            </div>
            <button onClick={handleAddNew} style={S.btnP} onMouseEnter={e=>{e.target.style.transform='translateY(-1px)';e.target.style.boxShadow=`0 6px 20px ${blueGlow}`}} onMouseLeave={e=>{e.target.style.transform='translateY(0)';e.target.style.boxShadow=`0 4px 15px ${blueGlow}`}}><Upload size={18} /> Upload Image</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsGrid}>
        {[{ v:stats.total, l:'Total Images', i:'🖼️', c:blue },{ v:stats.featured, l:'Featured', i:'⭐', c:blue },{ v:stats.views.toLocaleString(), l:'Total Views', i:'👁️', c:blue },{ v:stats.downloads, l:'Downloads', i:'📥', c:blue }].map((s,i)=>(
          <div key={i} style={S.statCard}><div style={{ fontSize:28, fontWeight:700, color:s.c, marginBottom:4 }}>{s.v}</div><div style={{ fontSize:12, color:'#64748b', textTransform:'uppercase', fontWeight:500 }}>{s.i} {s.l}</div></div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <div style={S.searchBox} onFocus={e=>e.currentTarget.style.borderColor=blue} onBlur={e=>e.currentTarget.style.borderColor='#e2e8f0'}><Search size={18} color="#94a3b8" /><input placeholder="Search images by title..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={S.searchIn} /></div>
        <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={S.select}><option value="all">All Categories</option>{CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select>
      </div>

      {/* Grid View */}
      {viewMode==='grid'&&<div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
        {filteredImages.map(image=><div key={image.id} style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden', transition:'box-shadow 0.2s, transform 0.2s' }} onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateY(0)'}}>
          <div style={{ position:'relative', aspectRatio:'16/10', overflow:'hidden', background:'#f1f5f9' }}>
            <img src={image.image_url||getFullImageUrl(image.image_path)||"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300"} alt={image.title||'Gallery'} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300"}} />
            <button onClick={()=>handleToggleFeatured(image)} title={image.featured?'Remove featured':'Mark featured'} style={{ position:'absolute', top:12, right:12, background:image.featured?`linear-gradient(135deg, ${blue}, ${blueDark})`:'rgba(0,0,0,0.5)', color:'white', padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:600, display:'flex', alignItems:'center', gap:4, border:'none', cursor:'pointer', backdropFilter:'blur(4px)', transition:'all 0.2s' }}><Star size={12} fill={image.featured?'white':'none'} /> {image.featured?'Featured':'Regular'}</button>
          </div>
          <div style={{ padding:16 }}>
            <h3 style={{ fontWeight:600, marginBottom:6, color:'#1e293b', fontSize:15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{image.title||'Untitled'}</h3>
            <p style={{ fontSize:13, color:'#64748b', marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', minHeight:36 }}>{image.description||'No description'}</p>
            {image.tags&&image.tags.length>0&&<div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:12 }}>{(Array.isArray(image.tags)?image.tags:[]).slice(0,3).map((t,i)=><span key={i} style={{ padding:'2px 8px', background:'#f1f5f9', borderRadius:12, fontSize:11, color:'#64748b' }}>{t}</span>)}{Array.isArray(image.tags)&&image.tags.length>3&&<span style={{ fontSize:11, color:'#94a3b8' }}>+{image.tags.length-3} more</span>}</div>}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}><span style={S.badge('#f0fdf4','#059669')}>{image.category}</span><span style={{ fontSize:11, color:'#94a3b8', display:'flex', alignItems:'center', gap:8 }}><span><Eye size={12} style={{ verticalAlign:'middle' }} /> {image.views||0}</span><span><Download size={12} style={{ verticalAlign:'middle' }} /> {image.downloads||0}</span></span></div>
            <div style={{ fontSize:11, color:'#94a3b8', marginBottom:12 }}><Calendar size={11} style={{ verticalAlign:'middle', marginRight:4 }} />{fmtDate(image.created_at)}</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>handleEdit(image)} style={{ flex:1, ...S.btnI('#f1f5f9','#374151'), justifyContent:'center', gap:4, fontSize:12, fontWeight:500 }} onMouseEnter={e=>e.target.style.background='#e2e8f0'} onMouseLeave={e=>e.target.style.background='#f1f5f9'}><Edit size={13} /> Edit</button>
              <button onClick={()=>handleDownload(image)} style={{ padding:'8px 12px', background:'#f0fdf4', border:'none', borderRadius:8, cursor:'pointer', color:'#059669', transition:'background 0.2s' }} onMouseEnter={e=>e.target.style.background='#d1fae5'} onMouseLeave={e=>e.target.style.background='#f0fdf4'}><Download size={13} /></button>
              <button onClick={()=>confirmDelete(image)} style={{ padding:'8px 12px', background:'#fef2f2', border:'none', borderRadius:8, cursor:'pointer', color:'#dc2626', transition:'background 0.2s' }} onMouseEnter={e=>e.target.style.background='#fee2e2'} onMouseLeave={e=>e.target.style.background='#fef2f2'}><Trash2 size={13} /></button>
            </div>
          </div>
        </div>)}
        {filteredImages.length===0&&<div style={{ gridColumn:'1/-1', ...S.empty, background:'white', borderRadius:12, border:'2px dashed #e2e8f0' }}><ImageIcon size={48} style={{ marginBottom:12, opacity:0.5 }} /><p style={{ fontSize:16, fontWeight:500, marginBottom:4 }}>No images found</p><p style={{ fontSize:13 }}>{searchTerm||filterCategory!=='all'?'Try adjusting filters':'Upload your first image'}</p></div>}
      </div>}

      {/* List View */}
      {viewMode==='list'&&<div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:800 }}>
          <thead><tr style={{ background:'#f8fafc', borderBottom:'2px solid #e2e8f0' }}><th style={S.th}>Image</th><th style={S.th}>Title</th><th style={S.th}>Category</th><th style={S.th}>Featured</th><th style={S.th}>Views</th><th style={S.th}>Downloads</th><th style={S.th}>Date</th><th style={S.th}>Actions</th></tr></thead>
          <tbody>
            {filteredImages.map(image=><tr key={image.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
              <td style={{ padding:'12px 16px' }}><img src={image.image_url||getFullImageUrl(image.image_path)} alt="" style={{ width:60, height:40, objectFit:'cover', borderRadius:6, background:'#f1f5f9' }} onError={e=>{e.target.style.display='none'}} /></td>
              <td style={{ padding:'12px 16px', fontWeight:500, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{image.title}</td>
              <td style={{ padding:'12px 16px' }}><span style={S.badge('#f1f5f9','#64748b')}>{image.category}</span></td>
              <td style={{ padding:'12px 16px', textAlign:'center' }}><button onClick={()=>handleToggleFeatured(image)} style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}>{image.featured?<Star size={16} fill={blue} color={blue} />:<Star size={16} color="#d1d5db" />}</button></td>
              <td style={{ padding:'12px 16px', fontSize:13 }}>{image.views||0}</td>
              <td style={{ padding:'12px 16px', fontSize:13 }}>{image.downloads||0}</td>
              <td style={{ padding:'12px 16px', fontSize:13, color:'#64748b' }}>{fmtDate(image.created_at)}</td>
              <td style={{ padding:'12px 16px' }}><div style={{ display:'flex', gap:6 }}>
                <button onClick={()=>handleEdit(image)} style={S.btnI('#f1f5f9','#374151')} onMouseEnter={e=>e.target.style.background='#e2e8f0'} onMouseLeave={e=>e.target.style.background='#f1f5f9'}><Edit size={13} /></button>
                <button onClick={()=>handleDownload(image)} style={S.btnI('#f0fdf4','#059669')} onMouseEnter={e=>e.target.style.background='#d1fae5'} onMouseLeave={e=>e.target.style.background='#f0fdf4'}><Download size={13} /></button>
                <button onClick={()=>confirmDelete(image)} style={S.btnI('#fef2f2','#dc2626')} onMouseEnter={e=>e.target.style.background='#fee2e2'} onMouseLeave={e=>e.target.style.background='#fef2f2'}><Trash2 size={13} /></button>
              </div></td>
            </tr>)}
          </tbody>
        </table>
        {filteredImages.length===0&&<div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>No images found</div>}
      </div>}

      {/* Upload/Edit Modal */}
      {showModal&&<div style={S.modalBg} onClick={()=>setShowModal(false)}><div style={{...S.modalBox, maxWidth:550}} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHead}><h2 style={{ fontSize:18, fontWeight:700, color:'#1e293b' }}>{editingImage?'✏️ Edit Image Details':'📤 Upload New Image'}</h2><button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', padding:4, borderRadius:6 }} onMouseEnter={e=>e.target.style.background='#f1f5f9'} onMouseLeave={e=>e.target.style.background='none'}><X size={20} /></button></div>
        <form onSubmit={handleSubmit} style={{ padding:24 }}>
          <div style={{ marginBottom:20 }}><label style={S.label}>{editingImage?'Change Image (optional)':'Image *'}</label>
            <div style={{...S.coverUp(imagePreview), ...(imagePreview?{backgroundImage:`url(${imagePreview})`}:{})}} onMouseEnter={e=>e.currentTarget.style.borderColor=blue} onMouseLeave={e=>e.currentTarget.style.borderColor='#e2e8f0'}>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
              {!imagePreview&&<div style={{ color:'#94a3b8' }}><Upload size={40} style={{ marginBottom:12, opacity:0.5 }} /><p style={{ fontWeight:500, marginBottom:4 }}>Click to upload image</p><small>JPG, PNG, GIF or WebP (max 5MB)</small></div>}
            </div>
          </div>
          <div style={{ marginBottom:16 }}><label style={S.label}>Title *</label><input placeholder="Enter image title" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} required style={S.input} onFocus={e=>e.target.style.borderColor=blue} onBlur={e=>e.target.style.borderColor='#e2e8f0'} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div><label style={S.label}>Category *</label><select value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} style={S.input}>{CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></div>
            <div><label style={S.label}>Featured</label><label style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 12px', border:'2px solid #e2e8f0', borderRadius:10, cursor:'pointer', background:formData.featured?blueLight:'white', transition:'all 0.2s' }}><input type="checkbox" checked={formData.featured} onChange={e=>setFormData({...formData,featured:e.target.checked})} style={{ width:18, height:18, accentColor:blue, cursor:'pointer' }} /><span style={{ fontSize:14, userSelect:'none' }}>⭐ Mark as featured</span></label></div>
          </div>
          <div style={{ marginBottom:16 }}><label style={S.label}>Description</label><textarea placeholder="Brief description..." value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} rows={3} style={{...S.input, resize:'vertical'}} onFocus={e=>e.target.style.borderColor=blue} onBlur={e=>e.target.style.borderColor='#e2e8f0'} /></div>
          <div style={{ marginBottom:24 }}><label style={S.label}>Tags (comma separated)</label><input placeholder="e.g., workshop, coding" value={formData.tags} onChange={e=>setFormData({...formData,tags:e.target.value})} style={S.input} onFocus={e=>e.target.style.borderColor=blue} onBlur={e=>e.target.style.borderColor='#e2e8f0'} /></div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}>
            <button type="button" onClick={()=>setShowModal(false)} style={{ padding:'12px 24px', background:'white', border:'2px solid #e2e8f0', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', color:'#64748b' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{...S.btnP, padding:'12px 28px', opacity:submitting?0.7:1, cursor:submitting?'not-allowed':'pointer'}}>{submitting?<><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} /> Saving...</>:editingImage?'💾 Update Image':'📤 Upload Image'}</button>
          </div>
        </form>
      </div></div>}

      {/* Delete Confirmation */}
      {deleteConfirm&&<div style={{...S.modalBg, zIndex:10000}}><div style={{ background:'white', borderRadius:16, padding:32, maxWidth:400, textAlign:'center', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🗑️</div><h3 style={{ fontSize:18, fontWeight:700, marginBottom:8, color:'#1e293b' }}>Delete Image?</h3><p style={{ fontSize:14, color:'#64748b', marginBottom:24 }}>Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}><button onClick={()=>setDeleteConfirm(null)} style={{ padding:'10px 20px', background:'white', border:'2px solid #e2e8f0', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:14 }}>Cancel</button><button onClick={handleDelete} style={{ padding:'10px 20px', background:'#dc2626', color:'white', border:'none', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:14 }}>Delete</button></div>
      </div></div>}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default GalleryManagement