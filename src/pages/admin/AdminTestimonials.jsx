import React, { useEffect, useState } from 'react'
import { db, storage } from '../../lib/firebase'
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import './AdminTestimonials.css'

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    text: '',
    rating: 5,
    image_url: ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const q = query(collection(db, 'testimonials'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      const testimonialsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTestimonials(testimonialsData)
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      setTestimonials([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const testimonialData = {
        ...formData,
        created_at: editingTestimonial ? undefined : serverTimestamp(),
        updated_at: serverTimestamp()
      }
      
      if (editingTestimonial) {
        await updateDoc(doc(db, 'testimonials', editingTestimonial.id), testimonialData)
      } else {
        await addDoc(collection(db, 'testimonials'), testimonialData)
      }
      
      setShowModal(false)
      setEditingTestimonial(null)
      setFormData({ name: '', position: '', text: '', rating: 5, image_url: '' })
      fetchTestimonials()
    } catch (error) {
      console.error('Error saving testimonial:', error)
      alert('Hata: ' + error.message)
    }
  }

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      position: testimonial.position,
      text: testimonial.text,
      rating: testimonial.rating || 5,
      image_url: testimonial.image_url || ''
    })
    setShowModal(true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin!')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `images/testimonials/${fileName}`
      const storageRef = ref(storage, filePath)

      await uploadBytes(storageRef, file)
      const publicUrl = await getDownloadURL(storageRef)
      setFormData({ ...formData, image_url: publicUrl })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Resim yüklenirken hata oluştu: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!formData.image_url) return

    try {
      if (formData.image_url.includes('firebasestorage')) {
        const urlParts = formData.image_url.split('/')
        const encodedPath = urlParts.slice(urlParts.indexOf('o') + 1).join('/')
        const decodedPath = decodeURIComponent(encodedPath.split('?')[0])
        const storageRef = ref(storage, decodedPath)
        await deleteObject(storageRef)
      }
    } catch (err) {
      console.error('Error deleting image:', err)
    }

    setFormData({ ...formData, image_url: '' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return
    
    try {
      await deleteDoc(doc(db, 'testimonials', id))
      fetchTestimonials()
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      alert('Hata: ' + error.message)
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
    <div className="admin-testimonials">
      <div className="admin-page-header">
        <h1>Müşteri Yorumları Yönetimi</h1>
        <button onClick={() => {
          setEditingTestimonial(null)
          setFormData({ name: '', position: '', text: '', rating: 5, image_url: '' })
          setShowModal(true)
        }} className="admin-btn-primary">
          <i className="fas fa-plus"></i> Yeni Yorum
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Görsel</th>
              <th>Müşteri Adı</th>
              <th>Pozisyon</th>
              <th>Yorum</th>
              <th>Rating</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-empty">
                  Henüz yorum yok. İlk yorumu ekleyin!
                </td>
              </tr>
            ) : (
              testimonials.map((testimonial) => (
                <tr key={testimonial.id}>
                  <td>
                    {testimonial.image_url ? (
                      <img 
                        src={testimonial.image_url} 
                        alt={testimonial.name}
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover', 
                          borderRadius: '8px' 
                        }}
                      />
                    ) : (
                      <i className="fas fa-image" style={{ color: '#94a3b8', fontSize: '1.5rem' }}></i>
                    )}
                  </td>
                  <td>{testimonial.name}</td>
                  <td>{testimonial.position}</td>
                  <td className="admin-text-preview">{testimonial.text.substring(0, 50)}...</td>
                  <td>
                    <div className="admin-rating">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < testimonial.rating ? 'active' : ''}`}
                        ></i>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button onClick={() => handleEdit(testimonial)} className="admin-btn-edit">
                        <i className="fas fa-pen-to-square"></i> Düzenle
                      </button>
                      <button onClick={() => handleDelete(testimonial.id)} className="admin-btn-delete">
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
              <h2>{editingTestimonial ? 'Yorum Düzenle' : 'Yeni Yorum'}</h2>
              <button onClick={() => setShowModal(false)} className="admin-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Müşteri Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Pozisyon *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Yorum Metni *</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows="5"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Rating (1-5) *</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Ekran Görüntüsü (Opsiyonel)</label>
                {formData.image_url ? (
                  <div className="admin-image-preview-form">
                    <img src={formData.image_url} alt="Ekran görüntüsü" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="admin-btn-delete admin-btn-small"
                    >
                      <i className="fas fa-times"></i> Kaldır
                    </button>
                  </div>
                ) : (
                  <div className="admin-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="admin-file-input"
                    />
                    {uploading && (
                      <div className="admin-upload-status">
                        <i className="fas fa-spinner fa-spin"></i> Yükleniyor...
                      </div>
                    )}
                    <p className="admin-upload-hint">
                      Yorum ile ilgili ekran görüntüsü veya fotoğraf yükleyebilirsiniz.
                    </p>
                    <div className="admin-form-group" style={{ marginTop: '1rem' }}>
                      <label>Veya Harici URL Girin</label>
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://... veya /images/..."
                        style={{ marginTop: '0.5rem' }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingTestimonial ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTestimonials

