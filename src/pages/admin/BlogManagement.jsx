import { useState, useEffect } from 'react'
import { Search, Eye, Edit, Trash2, Calendar, Plus, X, Tag, Upload, FolderOpen, FileText, AlertCircle, CheckCircle, Grid, List } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { blogApi, categoryApi } from '../../services/api'

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

const getFullImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  if (path) return `${API_BASE}/storage/${path}`
  return null
}

// ============================================
// STYLES
// ============================================
const S = {
  page: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  card: { background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  tab: (active) => ({ flex: 1, padding: '10px 20px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', background: active ? `linear-gradient(135deg, ${blue}, ${blueDark})` : 'transparent', color: active ? 'white' : '#64748b', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }),
  btnP: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: `linear-gradient(135deg, ${blue}, ${blueDark})`, color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: `0 4px 15px ${blueGlow}`, transition: 'all 0.2s' },
  btnO: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'white', color: blue, border: `2px solid ${blue}`, borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  btnI: (bg, clr) => ({ padding: '8px 12px', background: bg, border: 'none', borderRadius: '8px', cursor: 'pointer', color: clr, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }),
  searchBox: { flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', transition: 'border-color 0.2s' },
  searchIn: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', background: 'transparent' },
  select: { padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', outline: 'none', minWidth: '140px' },
  input: { width: '100%', padding: '12px 14px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  tableWrap: { background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'auto' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.5px' },
  badge: (bg, clr) => ({ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: bg, color: clr, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }),
  modalBg: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)' },
  modalBox: { background: 'white', borderRadius: '16px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', width: '100%', maxHeight: '90vh', overflow: 'auto' },
  modalHead: { padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1, borderRadius: '16px 16px 0 0' },
  err: { padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' },
  ok: { padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' },
  coverUp: (prev) => ({ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '30px', textAlign: 'center', minHeight: '160px', position: 'relative', cursor: 'pointer', background: prev ? undefined : '#f8fafc', backgroundSize: 'cover', backgroundPosition: 'center', transition: 'border-color 0.2s' }),
  empty: { padding: '60px 20px', textAlign: 'center', color: '#94a3b8' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  catCard: { background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', transition: 'box-shadow 0.2s, transform 0.2s' }
}

// ============================================
// COMPONENT
// ============================================
const BlogManagement = () => {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showBlogModal, setShowBlogModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [editingCat, setEditingCat] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [activeTab, setActiveTab] = useState('blogs')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [viewMode, setViewMode] = useState('table')
  const [formData, setFormData] = useState({ title: '', category_id: '', excerpt: '', content: '', status: 'draft', tags: '' })
  const [catForm, setCatForm] = useState({ name: '', description: '', color: blue, is_active: true })

  const modules = { toolbar: [[{ 'header': [1,2,3,4,5,6,false] }], ['bold','italic','underline','strike'], [{ 'list': 'ordered'},{ 'list': 'bullet' }], [{ 'color': [] },{ 'background': [] }], ['link','image','video'], ['clean']] }

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => { setLoading(true); await Promise.all([fetchPosts(), fetchCats()]); setLoading(false) }
  const fetchCats = async () => { try { const r = await categoryApi.getAll(); setCategories(r.data?.data || []) } catch(e) { console.error(e) } }
  const fetchPosts = async () => { try { const r = await blogApi.getAll(); const d = r.data?.data || r.data || []; setPosts(Array.isArray(d) ? d : []) } catch(e) { console.error(e) } }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5*1024*1024) { setError('Image must be less than 5MB'); return }
    setCoverImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setCoverPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const confirmDelBlog = (post) => setDeleteConfirm({ type: 'blog', item: post })
  const confirmDelCat = (cat) => setDeleteConfirm({ type: 'category', item: cat })

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const { type, item } = deleteConfirm
    try {
      if (type === 'blog') { await blogApi.delete(item.id); setPosts(p => p.filter(x => x.id !== item.id)); setSuccess('Post deleted!') }
      else { await categoryApi.delete(item.id); setCategories(c => c.filter(x => x.id !== item.id)); setSuccess('Category deleted!') }
      setTimeout(() => setSuccess(''), 2000)
    } catch(e) { setError(e.response?.data?.message || 'Delete failed') }
    finally { setDeleteConfirm(null) }
  }

  const editBlog = (post) => {
    setEditingPost(post)
    setFormData({ title: post.title||'', category_id: post.category_id||'', excerpt: post.excerpt||'', content: post.content||'', status: post.status||'draft', tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags||'') })
    setCoverPreview(post.cover_image ? getFullImageUrl(post.cover_image) : null)
    setCoverImage(null); setError(''); setSuccess(''); setShowBlogModal(true)
  }

  const editCat = (cat) => {
    setEditingCat(cat)
    setCatForm({ name: cat.name||'', description: cat.description||'', color: cat.color||blue, is_active: cat.is_active??true })
    setError(''); setSuccess(''); setShowCatModal(true)
  }

  const addBlog = () => { setEditingPost(null); setFormData({ title:'', category_id: categories[0]?.id||'', excerpt:'', content:'', status:'draft', tags:'' }); setCoverPreview(null); setCoverImage(null); setError(''); setSuccess(''); setShowBlogModal(true) }
  const addCat = () => { setEditingCat(null); setCatForm({ name:'', description:'', color:blue, is_active:true }); setError(''); setSuccess(''); setShowCatModal(true) }

  const submitBlog = async (e) => {
    e.preventDefault(); setSubmitting(true); setError(''); setSuccess('')
    try {
      const tags = formData.tags.split(',').map(t=>t.trim()).filter(Boolean)
      const fd = new FormData()
      fd.append('title', formData.title.trim()); fd.append('category_id', formData.category_id)
      fd.append('excerpt', formData.excerpt.trim()); fd.append('content', formData.content)
      fd.append('status', formData.status); tags.forEach(t=>fd.append('tags[]',t))
      if (coverImage) fd.append('cover_image', coverImage)
      if (editingPost) fd.append('_method', 'PUT')
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } }
      if (editingPost) { await blogApi.update(editingPost.id, fd, cfg); setSuccess('Post updated!') }
      else { await blogApi.create(fd, cfg); setSuccess('Post created!') }
      fetchPosts(); setTimeout(() => { setShowBlogModal(false); setSuccess('') }, 1000)
    } catch(e) { setError(e.response?.data?.message || 'Failed to save post') }
    finally { setSubmitting(false) }
  }

  const submitCat = async (e) => {
    e.preventDefault(); setSubmitting(true); setError(''); setSuccess('')
    try {
      if (editingCat) { await categoryApi.update(editingCat.id, catForm); setSuccess('Category updated!') }
      else { await categoryApi.create(catForm); setSuccess('Category created!') }
      fetchCats(); setTimeout(() => { setShowCatModal(false); setSuccess('') }, 1000)
    } catch(e) { setError(e.response?.data?.message || 'Failed to save category') }
    finally { setSubmitting(false) }
  }

  const fmtDate = (d) => { if(!d) return '-'; return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) }
  
  const statusBadge = (s) => {
    const cfg = { published: { bg:'#f0fdf4', clr:'#16a34a', lbl:'✓ Published' }, draft: { bg:'#fefce8', clr:'#ca8a04', lbl:'📝 Draft' } }
    const c = cfg[s] || cfg.draft
    return <span style={S.badge(c.bg, c.clr)}>{c.lbl}</span>
  }

  const filteredPosts = posts.filter(p => {
    const m = (p.title||'').toLowerCase().includes(searchTerm.toLowerCase())
    const c = filterCategory==='all' || p.category_id===parseInt(filterCategory)
    const s = filterStatus==='all' || p.status===filterStatus
    return m && c && s
  })

  const stats = { total: posts.length, published: posts.filter(p=>p.status==='published').length, draft: posts.filter(p=>p.status==='draft').length, cats: categories.length, views: posts.reduce((s,p)=>s+(p.views||0),0) }

  // Loading
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'400px' }}>
      <div style={{ width:44, height:44, border:'3px solid #e2e8f0', borderTopColor:blue, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={S.page}>
      {/* Toast */}
      {success && <div style={{ position:'fixed', top:20, right:20, zIndex:10000, ...S.ok, maxWidth:400, boxShadow:'0 10px 30px rgba(0,0,0,0.15)', animation:'slideIn 0.3s' }}><CheckCircle size={18} />{success}</div>}

      {/* Header */}
      <div style={S.card}>
        <div style={S.cardHead}>
          <div><h1 style={{ fontSize:24, fontWeight:700, color:'#1e293b', margin:'0 0 4px' }}>📝 Content Management</h1><p style={{ color:'#64748b', margin:0, fontSize:14 }}>Manage your blog posts and categories</p></div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button onClick={addCat} style={S.btnO} onMouseEnter={e=>e.target.style.background=blueLight} onMouseLeave={e=>e.target.style.background='white'}><FolderOpen size={17} /> New Category</button>
            <button onClick={addBlog} style={S.btnP} onMouseEnter={e=>{e.target.style.transform='translateY(-1px)';e.target.style.boxShadow=`0 6px 20px ${blueGlow}`}} onMouseLeave={e=>{e.target.style.transform='translateY(0)';e.target.style.boxShadow=`0 4px 15px ${blueGlow}`}}><Plus size={17} /> New Post</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsGrid}>
        {[{ v:stats.total, l:'Total Posts', i:'📝', c:blue },{ v:stats.published, l:'Published', i:'✅', c:'#16a34a' },{ v:stats.draft, l:'Drafts', i:'📄', c:'#ca8a04' },{ v:stats.cats, l:'Categories', i:'📂', c:blue },{ v:stats.views.toLocaleString(), l:'Total Views', i:'👁️', c:blue }].map((s,i)=>(
          <div key={i} style={S.statCard}><div style={{ fontSize:26, fontWeight:700, color:s.c, marginBottom:4 }}>{s.v}</div><div style={{ fontSize:11, color:'#64748b', textTransform:'uppercase', fontWeight:500 }}>{s.i} {s.l}</div></div>
        ))}
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        <button onClick={()=>setActiveTab('blogs')} style={S.tab(activeTab==='blogs')}><FileText size={16} /> Blog Posts ({posts.length})</button>
        <button onClick={()=>setActiveTab('categories')} style={S.tab(activeTab==='categories')}><FolderOpen size={16} /> Categories ({categories.length})</button>
      </div>

      {/* BLOGS TAB */}
      {activeTab==='blogs'&&<>
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
          <div style={S.searchBox} onFocus={e=>e.currentTarget.style.borderColor=blue} onBlur={e=>e.currentTarget.style.borderColor='#e2e8f0'}><Search size={18} color="#94a3b8" /><input placeholder="Search posts..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={S.searchIn} /></div>
          <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={S.select}><option value="all">📂 All Categories</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={S.select}><option value="all">📋 All Status</option><option value="published">✅ Published</option><option value="draft">📝 Draft</option></select>
          <div style={{ display:'flex', background:'#f1f5f9', borderRadius:8, padding:3 }}>
            <button onClick={()=>setViewMode('table')} style={{ padding:'7px 12px', border:'none', borderRadius:6, cursor:'pointer', background:viewMode==='table'?'white':'transparent', boxShadow:viewMode==='table'?'0 1px 3px rgba(0,0,0,0.1)':'none', fontWeight:viewMode==='table'?600:400, fontSize:13, display:'flex', alignItems:'center', gap:4 }}><List size={15} /> List</button>
            <button onClick={()=>setViewMode('grid')} style={{ padding:'7px 12px', border:'none', borderRadius:6, cursor:'pointer', background:viewMode==='grid'?'white':'transparent', boxShadow:viewMode==='grid'?'0 1px 3px rgba(0,0,0,0.1)':'none', fontWeight:viewMode==='grid'?600:400, fontSize:13, display:'flex', alignItems:'center', gap:4 }}><Grid size={15} /> Grid</button>
          </div>
        </div>

        {/* Table View */}
        {viewMode==='table'&&<div style={S.tableWrap}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
            <thead><tr style={{ background:'#f8fafc', borderBottom:'2px solid #e2e8f0' }}><th style={S.th}>Post</th><th style={S.th}>Category</th><th style={S.th}>Status</th><th style={S.th}>Date</th><th style={S.th}>Views</th><th style={{...S.th, textAlign:'center'}}>Actions</th></tr></thead>
            <tbody>
              {filteredPosts.map(post=><tr key={post.id} style={{ borderBottom:'1px solid #f1f5f9', transition:'background 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background='#fafbff'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{ padding:'14px 16px' }}><div style={{ display:'flex', alignItems:'center', gap:12 }}><img src={getFullImageUrl(post.cover_image)||"https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=100"} alt="" style={{ width:56, height:40, objectFit:'cover', borderRadius:6, flexShrink:0, background:'#f1f5f9' }} onError={e=>e.target.src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=100"} /><div style={{ minWidth:0 }}><h4 style={{ fontWeight:600, color:'#1e293b', margin:'0 0 3px', fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:250 }}>{post.title}</h4><p style={{ fontSize:12, color:'#64748b', margin:0 }}>{(post.excerpt||'').substring(0,55)}...</p></div></div></td>
                <td style={{ padding:'14px 16px' }}><span style={S.badge('#f1f5f9','#64748b')}>{post.category?.name||'Uncategorized'}</span></td>
                <td style={{ padding:'14px 16px' }}>{statusBadge(post.status)}</td>
                <td style={{ padding:'14px 16px', fontSize:13, color:'#64748b', whiteSpace:'nowrap' }}><Calendar size={13} style={{ verticalAlign:'middle', marginRight:4 }} />{fmtDate(post.created_at)}</td>
                <td style={{ padding:'14px 16px', fontSize:13, color:'#64748b' }}><Eye size={13} style={{ verticalAlign:'middle', marginRight:4 }} />{post.views||0}</td>
                <td style={{ padding:'14px 16px', textAlign:'center' }}><div style={{ display:'flex', gap:6, justifyContent:'center' }}><button onClick={()=>editBlog(post)} style={S.btnI('#f1f5f9','#64748b')} onMouseEnter={e=>e.target.style.background='#e2e8f0'} onMouseLeave={e=>e.target.style.background='#f1f5f9'}><Edit size={14} /></button><button onClick={()=>confirmDelBlog(post)} style={S.btnI('#fef2f2','#dc2626')} onMouseEnter={e=>e.target.style.background='#fee2e2'} onMouseLeave={e=>e.target.style.background='#fef2f2'}><Trash2 size={14} /></button></div></td>
              </tr>)}
            </tbody>
          </table>
          {filteredPosts.length===0&&<div style={S.empty}><FileText size={48} style={{ opacity:0.4, marginBottom:12 }} /><p style={{ fontWeight:500 }}>No posts found</p><p style={{ fontSize:13 }}>{searchTerm||filterCategory!=='all'?'Try adjusting filters':'Create your first blog post'}</p></div>}
        </div>}

        {/* Grid View */}
        {viewMode==='grid'&&<div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
          {filteredPosts.map(post=><div key={post.id} style={{...S.catCard, cursor:'default'}} onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 25px rgba(0,0,0,0.1)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateY(0)'}}>
            <img src={getFullImageUrl(post.cover_image)||"https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400"} alt="" style={{ width:'100%', height:160, objectFit:'cover', borderRadius:8, marginBottom:12, background:'#f1f5f9' }} />
            <h4 style={{ fontWeight:600, marginBottom:6 }}>{post.title}</h4><p style={{ fontSize:13, color:'#64748b', marginBottom:10 }}>{(post.excerpt||'').substring(0,80)}...</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}><span style={S.badge('#f1f5f9','#64748b')}>{post.category?.name||'General'}</span>{statusBadge(post.status)}</div>
            <div style={{ display:'flex', gap:8 }}><button onClick={()=>editBlog(post)} style={{ flex:1, ...S.btnI('#f1f5f9','#374151'), justifyContent:'center', gap:4 }}><Edit size={14} /> Edit</button><button onClick={()=>confirmDelBlog(post)} style={{ flex:1, ...S.btnI('#fef2f2','#dc2626'), justifyContent:'center', gap:4 }}><Trash2 size={14} /> Delete</button></div>
          </div>)}
          {filteredPosts.length===0&&<div style={{ gridColumn:'1/-1', ...S.empty }}><FileText size={48} style={{ opacity:0.4 }} /><p>No posts found</p></div>}
        </div>}
      </>}

      {/* CATEGORIES TAB */}
      {activeTab==='categories'&&<div style={S.catGrid}>
        {categories.map(cat=><div key={cat.id} style={S.catCard} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 8px 25px rgba(0,0,0,0.08)'} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}><div style={{ width:44, height:44, borderRadius:10, background:cat.color||blue, display:'flex', alignItems:'center', justifyContent:'center', color:'white', flexShrink:0 }}><FolderOpen size={22} /></div><div><h4 style={{ fontWeight:600, color:'#1e293b', marginBottom:2 }}>{cat.name}</h4><span style={S.badge('#f1f5f9','#64748b')}>{cat.blogs_count||0} posts</span></div></div>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:14, minHeight:36 }}>{(cat.description||'No description').substring(0,70)}{cat.description&&cat.description.length>70?'...':''}</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><span style={S.badge(cat.is_active?'#f0fdf4':'#fef2f2', cat.is_active?'#16a34a':'#dc2626')}>{cat.is_active?'● Active':'○ Inactive'}</span>
            <div style={{ display:'flex', gap:6 }}><button onClick={()=>editCat(cat)} style={S.btnI('#f1f5f9','#64748b')} onMouseEnter={e=>e.target.style.background='#e2e8f0'} onMouseLeave={e=>e.target.style.background='#f1f5f9'}><Edit size={14} /></button><button onClick={()=>confirmDelCat(cat)} style={S.btnI('#fef2f2','#dc2626')} onMouseEnter={e=>e.target.style.background='#fee2e2'} onMouseLeave={e=>e.target.style.background='#fef2f2'}><Trash2 size={14} /></button></div>
          </div>
        </div>)}
        {categories.length===0&&<div style={{ gridColumn:'1/-1', ...S.empty }}><FolderOpen size={48} style={{ opacity:0.4, marginBottom:12 }} /><p style={{ fontWeight:500 }}>No categories found</p><p style={{ fontSize:13 }}>Create your first category</p></div>}
      </div>}

      {/* BLOG MODAL */}
      {showBlogModal&&<div style={S.modalBg} onClick={()=>setShowBlogModal(false)}><div style={{...S.modalBox, maxWidth:900}} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHead}><h2 style={{ fontSize:18, fontWeight:700 }}>{editingPost?'✏️ Edit Post':'✨ Create New Post'}</h2><button onClick={()=>setShowBlogModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', padding:4, borderRadius:6 }} onMouseEnter={e=>e.target.style.background='#f1f5f9'} onMouseLeave={e=>e.target.style.background='none'}><X size={20} /></button></div>
        <form onSubmit={submitBlog} style={{ padding:24 }}>
          {error&&<div style={S.err}><AlertCircle size={16} />{error}</div>}{success&&<div style={S.ok}><CheckCircle size={16} />{success}</div>}
          <div style={{ marginBottom:20 }}><label style={S.label}>Cover Image</label><div style={{...S.coverUp(coverPreview), ...(coverPreview?{backgroundImage:`url(${coverPreview})`}:{})}}><input type="file" accept="image/*" onChange={handleImageChange} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />{!coverPreview&&<div style={{ color:'#94a3b8' }}><Upload size={36} style={{ marginBottom:8, opacity:0.5 }} /><p style={{ fontWeight:500, marginBottom:4 }}>Click to upload cover image</p><small>JPG, PNG, GIF or WebP (max 5MB)</small></div>}</div></div>
          <div style={{ marginBottom:16 }}><label style={S.label}>Title *</label><input placeholder="Enter an engaging title..." value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} required style={S.input} onFocus={e=>e.target.style.borderColor=blue} onBlur={e=>e.target.style.borderColor='#e2e8f0'} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div><label style={S.label}>Category *</label><select value={formData.category_id} onChange={e=>setFormData({...formData,category_id:e.target.value})} required style={S.input}><option value="">Select category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label style={S.label}>Status</label><select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})} style={S.input}><option value="draft">📝 Draft</option><option value="published">✅ Published</option></select></div>
          </div>
          <div style={{ marginBottom:16 }}><label style={S.label}>Excerpt *</label><textarea placeholder="Brief summary..." value={formData.excerpt} onChange={e=>setFormData({...formData,excerpt:e.target.value})} rows={2} required style={{...S.input, resize:'vertical'}} onFocus={e=>e.target.style.borderColor=blue} onBlur={e=>e.target.style.borderColor='#e2e8f0'} /></div>
          <div style={{ marginBottom:16 }}><label style={S.label}>Content *</label><ReactQuill theme="snow" value={formData.content} onChange={v=>setFormData({...formData,content:v})} modules={modules} style={{ height:300, marginBottom:50 }} placeholder="Write your content here..." /></div>
          <div style={{ marginBottom:24 }}><label style={S.label}>Tags (comma separated)</label><div style={{ position:'relative' }}><Tag size={18} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} /><input placeholder="e.g., React, JavaScript" value={formData.tags} onChange={e=>setFormData({...formData,tags:e.target.value})} style={{...S.input, paddingLeft:40}} onFocus={e=>e.target.style.borderColor=blue} onBlur={e=>e.target.style.borderColor='#e2e8f0'} /></div></div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}><button type="button" onClick={()=>setShowBlogModal(false)} style={{ padding:'12px 24px', background:'white', border:'2px solid #e2e8f0', borderRadius:10, fontWeight:600, cursor:'pointer', fontSize:14 }}>Cancel</button><button type="submit" disabled={submitting} style={{...S.btnP, padding:'12px 28px', opacity:submitting?0.7:1, cursor:submitting?'not-allowed':'pointer'}}>{submitting?<><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} /> Saving...</>:editingPost?'💾 Update Post':'🚀 Publish Post'}</button></div>
        </form>
      </div></div>}

      {/* CATEGORY MODAL */}
      {showCatModal&&<div style={S.modalBg} onClick={()=>setShowCatModal(false)}><div style={{...S.modalBox, maxWidth:480}} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHead}><h2 style={{ fontSize:18, fontWeight:700 }}>{editingCat?'✏️ Edit Category':'📂 Create Category'}</h2><button onClick={()=>setShowCatModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', padding:4, borderRadius:6 }} onMouseEnter={e=>e.target.style.background='#f1f5f9'} onMouseLeave={e=>e.target.style.background='none'}><X size={20} /></button></div>
        <form onSubmit={submitCat} style={{ padding:24 }}>
          {error&&<div style={S.err}><AlertCircle size={16} />{error}</div>}{success&&<div style={S.ok}><CheckCircle size={16} />{success}</div>}
          <div style={{ marginBottom:16 }}><label style={S.label}>Category Name *</label><input placeholder="e.g., Technology" value={catForm.name} onChange={e=>setCatForm({...catForm,name:e.target.value})} required style={S.input} onFocus={e=>e.target.style.borderColor=blue} onBlur={e=>e.target.style.borderColor='#e2e8f0'} /></div>
          <div style={{ marginBottom:16 }}><label style={S.label}>Description</label><textarea placeholder="Brief description..." value={catForm.description} onChange={e=>setCatForm({...catForm,description:e.target.value})} rows={3} style={{...S.input, resize:'vertical'}} onFocus={e=>e.target.style.borderColor=blue} onBlur={e=>e.target.style.borderColor='#e2e8f0'} /></div>
          <div style={{ marginBottom:16 }}><label style={S.label}>Color</label><div style={{ display:'flex', alignItems:'center', gap:12 }}><input type="color" value={catForm.color} onChange={e=>setCatForm({...catForm,color:e.target.value})} style={{ width:48, height:40, border:'2px solid #e2e8f0', borderRadius:8, cursor:'pointer', padding:2 }} /><span style={{ fontSize:13, color:'#64748b' }}>{catForm.color}</span></div></div>
          <div style={{ marginBottom:24 }}><label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:12, border:'2px solid #e2e8f0', borderRadius:10, background:catForm.is_active?'#f0fdf4':'white' }}><input type="checkbox" checked={catForm.is_active} onChange={e=>setCatForm({...catForm,is_active:e.target.checked})} style={{ width:18, height:18, accentColor:'#16a34a' }} /><span style={{ fontSize:14, fontWeight:500 }}>Active — Show this category on the website</span></label></div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}><button type="button" onClick={()=>setShowCatModal(false)} style={{ padding:'12px 24px', background:'white', border:'2px solid #e2e8f0', borderRadius:10, fontWeight:600, cursor:'pointer', fontSize:14 }}>Cancel</button><button type="submit" disabled={submitting} style={{...S.btnP, padding:'12px 28px', opacity:submitting?0.7:1, cursor:submitting?'not-allowed':'pointer'}}>{submitting?'Saving...':editingCat?'💾 Update':'📂 Create'}</button></div>
        </form>
      </div></div>}

      {/* DELETE CONFIRMATION */}
      {deleteConfirm&&<div style={{...S.modalBg, zIndex:10000}}><div style={{ background:'white', borderRadius:16, padding:32, maxWidth:420, textAlign:'center', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🗑️</div>
        <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Delete {deleteConfirm.type==='blog'?'Post':'Category'}?</h3>
        <p style={{ fontSize:14, color:'#64748b', marginBottom:8 }}>Are you sure?</p>
        <p style={{ fontWeight:600, marginBottom:16 }}>"{deleteConfirm.item.title||deleteConfirm.item.name}"</p>
        {deleteConfirm.type==='category'&&<p style={{ fontSize:13, color:'#dc2626', marginBottom:20 }}>⚠️ All posts in this category will be affected.</p>}
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}><button onClick={()=>setDeleteConfirm(null)} style={{ padding:'10px 20px', background:'white', border:'2px solid #e2e8f0', borderRadius:10, cursor:'pointer', fontWeight:600 }}>Cancel</button><button onClick={handleDelete} style={{ padding:'10px 20px', background:'#dc2626', color:'white', border:'none', borderRadius:10, cursor:'pointer', fontWeight:600 }}>Delete</button></div>
      </div></div>}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideIn{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:translateX(0)}}@media(max-width:768px){.hide-mobile{display:none!important}}`}</style>
    </div>
  )
}

export default BlogManagement