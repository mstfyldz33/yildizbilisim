import React, { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '../../components/Toast'
import './AdminBlog.css'

const AdminBlog = () => {
  const { showToast } = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    icon: 'fa-video'
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'blog_posts'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPosts(postsData)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const postData = {
        ...formData,
        created_at: editingPost ? undefined : serverTimestamp(),
        updated_at: serverTimestamp()
      }
      
      if (editingPost) {
        await updateDoc(doc(db, 'blog_posts', editingPost.id), postData)
      } else {
        await addDoc(collection(db, 'blog_posts'), postData)
      }
      
      setShowModal(false)
      setEditingPost(null)
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        icon: 'fa-video'
      })
      fetchPosts()
      showToast(editingPost ? 'Blog yazısı güncellendi!' : 'Blog yazısı eklendi!', 'success')
    } catch (error) {
      console.error('Error saving post:', error)
      showToast('Hata: ' + error.message, 'error')
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content || '',
      date: post.date || new Date().toISOString().split('T')[0],
      icon: post.icon || 'fa-video'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) return
    
    try {
      await deleteDoc(doc(db, 'blog_posts', id))
      fetchPosts()
      showToast('Blog yazısı silindi!', 'success')
    } catch (error) {
      console.error('Error deleting post:', error)
      showToast('Hata: ' + error.message, 'error')
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="admin-blog">
      <div className="admin-page-header">
        <h1>Blog Yönetimi</h1>
        <button onClick={() => {
          setEditingPost(null)
          setFormData({
            title: '',
            excerpt: '',
            content: '',
            date: new Date().toISOString().split('T')[0],
            icon: 'fa-video'
          })
          setShowModal(true)
        }} className="admin-btn-primary">
          <i className="fas fa-plus"></i> Yeni Blog Yazısı
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Tarih</th>
              <th>İkon</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="4" className="admin-empty">
                  Henüz blog yazısı yok. İlk yazınızı ekleyin!
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.date}</td>
                  <td><i className={`fas ${post.icon}`}></i></td>
                  <td>
                    <div className="admin-actions">
                      <button onClick={() => handleEdit(post)} className="admin-btn-edit">
                        <i className="fas fa-pen-to-square"></i> Düzenle
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="admin-btn-delete">
                        <i className="fas fa-trash"></i> Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingPost ? 'Blog Yazısı Düzenle' : 'Yeni Blog Yazısı'}</h2>
              <button onClick={() => setShowModal(false)} className="admin-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Başlık *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Özet *</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows="3"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>İçerik</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="6"
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Tarih *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>İkon (Font Awesome class)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="fa-video"
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingPost ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminBlog

