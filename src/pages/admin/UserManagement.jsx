import { useState, useEffect } from 'react'
import { Plus, X, Edit, Trash2, User, Mail, Shield, Key, Calendar, AlertCircle, CheckCircle, Users as UsersIcon } from 'lucide-react'
import { usersApi } from '../../services/api'

// ============================================
// BRAND COLORS
// ============================================
const blue = '#3b82f6'
const blueDark = '#2563eb'
const blueLight = '#eff6ff'
const blueGlow = 'rgba(59,130,246,0.35)'

// ============================================
// STYLES
// ============================================
const S = {
  page: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  card: { background:'white', borderRadius:16, border:'1px solid #e2e8f0', padding:24, marginBottom:24 },
  cardHead: { display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 },
  btnP: { display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', background:`linear-gradient(135deg, ${blue}, ${blueDark})`, color:'white', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', boxShadow:`0 4px 15px ${blueGlow}`, transition:'all 0.2s' },
  btnI: (bg,clr) => ({ padding:'7px 11px', background:bg, border:'none', borderRadius:8, cursor:'pointer', color:clr, display:'inline-flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }),
  th: { padding:'14px 16px', textAlign:'left', fontSize:12, color:'#64748b', textTransform:'uppercase', fontWeight:600, whiteSpace:'nowrap' },
  label: { display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 },
  iconIn: { position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' },
  input: { width:'100%', padding:'12px 14px 12px 42px', border:'2px solid #e2e8f0', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' },
  badge: (bg,clr) => ({ padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600, background:bg, color:clr, display:'inline-flex', alignItems:'center', gap:5 }),
  modalBg: { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:20, backdropFilter:'blur(4px)' },
  modalBox: { background:'white', borderRadius:16, width:'100%', maxWidth:460, boxShadow:'0 25px 60px rgba(0,0,0,0.3)', maxHeight:'90vh', overflow:'auto' },
  modalHead: { padding:'20px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 },
  err: { padding:'12px 16px', background:'#fef2f2', color:'#dc2626', borderRadius:10, marginBottom:16, fontSize:13, display:'flex', alignItems:'center', gap:8, border:'1px solid #fecaca' },
  ok: { padding:'12px 16px', background:'#f0fdf4', color:'#16a34a', borderRadius:10, marginBottom:16, fontSize:13, display:'flex', alignItems:'center', gap:8, border:'1px solid #bbf7d0' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:16, marginBottom:24 },
  statCard: { padding:18, background:'white', borderRadius:12, border:'1px solid #e2e8f0', textAlign:'center' },
  tableWrap: { background:'white', borderRadius:16, border:'1px solid #e2e8f0', overflow:'auto' },
  empty: { padding:'60px', textAlign:'center', color:'#94a3b8' }
}

// ============================================
// COMPONENT
// ============================================
const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [formData, setFormData] = useState({ name:'', email:'', password:'', role:'admin' })

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try { setLoading(true); const r = await usersApi.getAll(); const d = r.data?.data||r.data||[]; setUsers(Array.isArray(d)?d:[]) }
    catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleAddNew = () => { setEditingUser(null); setFormData({ name:'', email:'', password:'', role:'admin' }); setError(''); setSuccess(''); setShowModal(true) }
  
  const handleEdit = (user) => { setEditingUser(user); setFormData({ name:user.name||'', email:user.email||'', password:'', role:user.role||'admin' }); setError(''); setSuccess(''); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setError(''); setSuccess('')
    try {
      if (editingUser) {
        const data = { name:formData.name.trim(), email:formData.email.trim(), role:formData.role }
        if (formData.password.trim()) data.password = formData.password
        await usersApi.update(editingUser.id, data); setSuccess('User updated!')
      } else {
        await usersApi.create({ name:formData.name.trim(), email:formData.email.trim(), password:formData.password, role:formData.role })
        setSuccess('User created! Credentials sent to email.'); setFormData({ name:'', email:'', password:'', role:'admin' })
      }
      fetchUsers(); setTimeout(() => { setShowModal(false); setSuccess(''); setEditingUser(null) }, 1500)
    } catch(e) {
      if (e.response?.status===422) { const errs = e.response.data.errors; setError(Object.values(errs)[0]?.[0]||'Validation failed') }
      else setError(e.response?.data?.message||(editingUser?'Update failed':'Create failed'))
    } finally { setSubmitting(false) }
  }

  const confirmDelete = (user) => {
    const cu = JSON.parse(localStorage.getItem('user')||'{}')
    if (cu.id===user.id) { alert('Cannot delete yourself!'); return }
    if (user.role==='super_admin') { alert('Cannot delete super admin!'); return }
    setDeleteConfirm(user)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try { await usersApi.delete(deleteConfirm.id); setUsers(u=>u.filter(x=>x.id!==deleteConfirm.id)); setDeleteConfirm(null) }
    catch(e) { alert(e.response?.data?.message||'Delete failed') }
  }

  const fmtDate = (d) => { if(!d) return '-'; return new Date(d).toLocaleDateString('en-US',{ year:'numeric', month:'short', day:'numeric' }) }

  const roleBadge = (role) => {
    const cfg = { super_admin:{ bg:'#fef3c7', clr:'#92400e', lbl:'Super Admin', ic:'👑' }, admin:{ bg:blueLight, clr:blue, lbl:'Admin', ic:'🛡️' } }
    const c = cfg[role]||cfg.admin
    return <span style={S.badge(c.bg,c.clr)}>{c.ic} {c.lbl}</span>
  }

  const initials = (n) => { if(!n) return '?'; return n.split(' ').map(w=>w.charAt(0)).join('').toUpperCase().substring(0,2) }
  const avatarBg = (n) => `linear-gradient(135deg, ${blue}, ${blueDark})`

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
          <div><h1 style={{ fontSize:24, fontWeight:700, color:'#1e293b', margin:'0 0 4px' }}>👥 User Management</h1><p style={{ color:'#64748b', margin:0, fontSize:14 }}>Manage admin users and their roles</p></div>
          <button onClick={handleAddNew} style={S.btnP} onMouseEnter={e=>{e.target.style.transform='translateY(-1px)';e.target.style.boxShadow=`0 6px 20px ${blueGlow}`}} onMouseLeave={e=>{e.target.style.transform='translateY(0)';e.target.style.boxShadow=`0 4px 15px ${blueGlow}`}}><Plus size={18} /> Add User</button>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsGrid}>
        {[{ v:users.length, l:'Total Users', i:'👥' },{ v:users.filter(u=>u.role==='super_admin').length, l:'Super Admins', i:'👑' },{ v:users.filter(u=>u.role==='admin').length, l:'Admins', i:'🛡️' }].map((s,i)=>(
          <div key={i} style={S.statCard}><div style={{ fontSize:26, fontWeight:700, color:blue, marginBottom:4 }}>{s.v}</div><div style={{ fontSize:11, color:'#64748b', textTransform:'uppercase', fontWeight:500 }}>{s.i} {s.l}</div></div>
        ))}
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:650 }}>
          <thead><tr style={{ background:'#f8fafc', borderBottom:'2px solid #e2e8f0' }}><th style={S.th}>User</th><th style={S.th}>Email</th><th style={S.th}>Role</th><th style={S.th}>Created</th><th style={{...S.th, textAlign:'center'}}>Actions</th></tr></thead>
          <tbody>
            {Array.isArray(users)&&users.map(user=>{
              const cu = JSON.parse(localStorage.getItem('user')||'{}')
              const isMe = cu.id===user.id
              return <tr key={user.id} style={{ borderBottom:'1px solid #f1f5f9', transition:'background 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background='#fafbff'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{ padding:'14px 16px' }}><div style={{ display:'flex', alignItems:'center', gap:12 }}><div style={{ width:40, height:40, borderRadius:'50%', background:avatarBg(user.name), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:600, fontSize:14, flexShrink:0 }}>{initials(user.name)}</div><div style={{ fontWeight:600, color:'#1e293b', display:'flex', alignItems:'center', gap:6, fontSize:14 }}>{user.name||'Unknown'}{isMe&&<span style={{ padding:'1px 6px', background:'#dbeafe', color:blue, borderRadius:10, fontSize:10, fontWeight:600 }}>YOU</span>}</div></div></td>
                <td style={{ padding:'14px 16px', fontSize:13, color:'#64748b' }}>{user.email}</td>
                <td style={{ padding:'14px 16px' }}>{roleBadge(user.role)}</td>
                <td style={{ padding:'14px 16px', fontSize:13, color:'#64748b' }}><Calendar size={13} style={{ verticalAlign:'middle', marginRight:4 }} />{fmtDate(user.created_at)}</td>
                <td style={{ padding:'14px 16px', textAlign:'center' }}><div style={{ display:'flex', gap:6, justifyContent:'center' }}>
                  <button onClick={()=>handleEdit(user)} style={S.btnI('#f1f5f9','#374151')} onMouseEnter={e=>e.target.style.background='#e2e8f0'} onMouseLeave={e=>e.target.style.background='#f1f5f9'}><Edit size={14} /></button>
                  <button onClick={()=>confirmDelete(user)} disabled={user.role==='super_admin'||isMe} style={{...S.btnI((user.role==='super_admin'||isMe)?'#f1f5f9':'#fef2f2', (user.role==='super_admin'||isMe)?'#94a3b8':'#dc2626'), opacity:(user.role==='super_admin'||isMe)?0.5:1, cursor:(user.role==='super_admin'||isMe)?'not-allowed':'pointer' }}><Trash2 size={14} /></button>
                </div></td>
              </tr>
            })}
            {(!users||users.length===0)&&<tr><td colSpan={5} style={S.empty}><UsersIcon size={48} style={{ marginBottom:12, opacity:0.5 }} /><p style={{ fontWeight:500 }}>No users found</p></td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal&&<div style={S.modalBg} onClick={()=>{setShowModal(false);setEditingUser(null)}}><div style={S.modalBox} onClick={e=>e.stopPropagation()}>
        <div style={S.modalHead}><h2 style={{ fontSize:18, fontWeight:700 }}>{editingUser?'✏️ Edit User':'➕ Add New User'}</h2><button onClick={()=>{setShowModal(false);setEditingUser(null)}} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b' }}><X size={20} /></button></div>
        <form onSubmit={handleSubmit} style={{ padding:24 }}>
          {error&&<div style={S.err}><AlertCircle size={16} />{error}</div>}{success&&<div style={S.ok}><CheckCircle size={16} />{success}</div>}
          <div style={{ marginBottom:16 }}><label style={S.label}>Full Name *</label><div style={{ position:'relative' }}><User size={18} style={S.iconIn} /><input placeholder="Enter full name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} required style={S.input} onFocus={e=>e.target.style.borderColor=blue} onBlur={e=>e.target.style.borderColor='#e2e8f0'} /></div></div>
          <div style={{ marginBottom:16 }}><label style={S.label}>Email Address *</label><div style={{ position:'relative' }}><Mail size={18} style={S.iconIn} /><input type="email" placeholder="Enter email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} required style={S.input} onFocus={e=>e.target.style.borderColor=blue} onBlur={e=>e.target.style.borderColor='#e2e8f0'} /></div></div>
          <div style={{ marginBottom:16 }}><label style={S.label}>Password {editingUser?'(leave blank to keep current)':'*'}</label><div style={{ position:'relative' }}><Key size={18} style={S.iconIn} /><input type="password" placeholder={editingUser?'New password (optional)':'Enter password'} value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})} required={!editingUser} style={S.input} onFocus={e=>e.target.style.borderColor=blue} onBlur={e=>e.target.style.borderColor='#e2e8f0'} /></div></div>
          <div style={{ marginBottom:24 }}><label style={S.label}>Role *</label><div style={{ position:'relative' }}><Shield size={18} style={S.iconIn} /><select value={formData.role} onChange={e=>setFormData({...formData,role:e.target.value})} style={{...S.input, cursor:'pointer'}}><option value="admin">🛡️ Admin</option><option value="super_admin">👑 Super Admin</option></select></div></div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}>
            <button type="button" onClick={()=>{setShowModal(false);setEditingUser(null)}} style={{ padding:'12px 24px', background:'white', border:'2px solid #e2e8f0', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{...S.btnP, padding:'12px 28px', opacity:submitting?0.7:1, cursor:submitting?'not-allowed':'pointer'}}>{submitting?<><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.6s linear infinite' }} /> Saving...</>:editingUser?'💾 Update User':'➕ Create User'}</button>
          </div>
        </form>
      </div></div>}

      {/* Delete Confirmation */}
      {deleteConfirm&&<div style={{...S.modalBg, zIndex:10000}}><div style={{ background:'white', borderRadius:16, padding:32, maxWidth:400, textAlign:'center', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div><h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Delete User?</h3><p style={{ fontSize:14, color:'#64748b', marginBottom:16 }}>Are you sure you want to delete <strong>{deleteConfirm.name}</strong> ({deleteConfirm.email})?</p><p style={{ fontSize:13, color:'#dc2626', marginBottom:24 }}>This action cannot be undone.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}><button onClick={()=>setDeleteConfirm(null)} style={{ padding:'10px 20px', background:'white', border:'2px solid #e2e8f0', borderRadius:10, cursor:'pointer', fontWeight:600 }}>Cancel</button><button onClick={handleDelete} style={{ padding:'10px 20px', background:'#dc2626', color:'white', border:'none', borderRadius:10, cursor:'pointer', fontWeight:600 }}>Delete User</button></div>
      </div></div>}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default UserManagement