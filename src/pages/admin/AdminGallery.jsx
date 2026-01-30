import React, { useEffect, useState } from 'react'
import { db, storage } from '../../lib/firebase'
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { useToast } from '../../components/Toast'
import './AdminGallery.css'

const AdminGallery = () => {
  const { showToast } = useToast()
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    count: '',
    icon: 'fa-building',
    image_url: ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      const q = query(collection(db, 'gallery'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      const itemsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setGalleryItems(itemsData)
    } catch (error) {
      console.error('Error fetching gallery items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Lütfen bir resim dosyası seçin!', 'warning')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `images/gallery/${fileName}`
      const storageRef = ref(storage, filePath)

      await uploadBytes(storageRef, file)
      const publicUrl = await getDownloadURL(storageRef)
      setFormData({ ...formData, image_url: publicUrl })
      showToast('Resim yüklendi!', 'success')
    } catch (error) {
      console.error('Error uploading image:', error)
      showToast('Resim yüklenirken hata oluştu: ' + error.message, 'error')
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
      setFormData({ ...formData, image_url: '' })
    } catch (error) {
      console.error('Error removing image:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const itemData = {
        ...formData,
        created_at: editingItem ? undefined : serverTimestamp(),
        updated_at: serverTimestamp()
      }
      
      if (editingItem) {
        await updateDoc(doc(db, 'gallery', editingItem.id), itemData)
      } else {
        await addDoc(collection(db, 'gallery'), itemData)
      }
      
      setShowModal(false)
      setEditingItem(null)
      resetForm()
      fetchGalleryItems()
      showToast(editingItem ? 'Galeri öğesi güncellendi!' : 'Galeri öğesi eklendi!', 'success')
    } catch (error) {
      console.error('Error saving gallery item:', error)
      showToast('Hata: ' + error.message, 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      count: '',
      icon: 'fa-building',
      image_url: ''
    })
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      title: item.title || '',
      count: item.count || '',
      icon: item.icon || 'fa-building',
      image_url: item.image_url || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id, imageUrl) => {
    if (!confirm('Bu galeri öğesini silmek istediğinizden emin misiniz?')) return
    
    try {
      if (imageUrl && imageUrl.includes('firebasestorage')) {
        try {
          const urlParts = imageUrl.split('/')
          const encodedPath = urlParts.slice(urlParts.indexOf('o') + 1).join('/')
          const decodedPath = decodeURIComponent(encodedPath.split('?')[0])
          const storageRef = ref(storage, decodedPath)
          await deleteObject(storageRef)
        } catch (err) {
          console.error('Error deleting image:', err)
        }
      }

      await deleteDoc(doc(db, 'gallery', id))
      fetchGalleryItems()
      showToast('Galeri öğesi silindi!', 'success')
    } catch (error) {
      console.error('Error deleting gallery item:', error)
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
    <div className="admin-gallery">
      <div className="admin-page-header">
        <h1>Galeri Yönetimi</h1>
        <button onClick={() => {
          setEditingItem(null)
          resetForm()
          setShowModal(true)
        }} className="admin-btn-primary">
          <i className="fas fa-plus"></i> Yeni Galeri Öğesi
        </button>
      </div>

      <div className="admin-gallery-grid">
        {galleryItems.length === 0 ? (
          <div className="admin-empty">
            Henüz galeri öğesi yok. İlk öğeyi ekleyin!
          </div>
        ) : (
          galleryItems.map((item) => (
            <div key={item.id} className="admin-gallery-card">
              <div className="admin-gallery-image">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} />
                ) : (
                  <i className={`fas ${item.icon}`}></i>
                )}
              </div>
              <div className="admin-gallery-info">
                <h3>{item.title}</h3>
                <p>{item.count}</p>
              </div>
              <div className="admin-gallery-actions">
                <button onClick={() => handleEdit(item)} className="admin-btn-edit">
                  <i className="fas fa-pen-to-square"></i> Düzenle
                </button>
                <button onClick={() => handleDelete(item.id, item.image_url)} className="admin-btn-delete">
                  <i className="fas fa-trash"></i> Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingItem ? 'Galeri Öğesi Düzenle' : 'Yeni Galeri Öğesi'}</h2>
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
                  placeholder="Örn: AVM Kurulumu"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Sayı/Bilgi *</label>
                <input
                  type="text"
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                  placeholder="Örn: 64 IP Kamera"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>İkon (Font Awesome class)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="fa-building"
                />
              </div>
              <div className="admin-form-group">
                <label>Resim</label>
                {formData.image_url ? (
                  <div className="admin-image-preview">
                    <img src={formData.image_url} alt="Preview" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="admin-btn-delete admin-btn-small"
                    >
                      <i className="fas fa-trash"></i> Resmi Kaldır
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
                  </div>
                )}
              </div>
              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" className="admin-btn-primary" disabled={uploading}>
                  {editingItem ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminGallery

