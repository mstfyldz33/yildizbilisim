import React, { useEffect, useState } from 'react'
import { db, storage } from '../../lib/firebase'
import { collection, query, orderBy, getDocs, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import './AdminProjectImages.css'

const AdminProjectImages = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    description: '',
    category: 'project'
  })

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const q = query(collection(db, 'project_images'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      const imagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setImages(imagesData)
    } catch (error) {
      console.error('Error fetching images:', error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      const uploadedImages = []
      
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} bir resim dosyası değil!`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `images/project_images/${fileName}`
        const storageRef = ref(storage, filePath)

        await uploadBytes(storageRef, file)
        const publicUrl = await getDownloadURL(storageRef)
        uploadedImages.push(publicUrl)
      }

      if (uploadedImages.length > 0) {
        setFormData({ ...formData, image_url: uploadedImages[0] })
        if (uploadedImages.length > 1) {
          const newImages = uploadedImages.slice(1).map(url => ({
            image_url: url,
            title: '',
            description: '',
            category: formData.category,
            created_at: serverTimestamp()
          }))
          
          await saveImages(newImages)
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Resim yüklenirken hata oluştu: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const saveImages = async (imagesToSave) => {
    try {
      const batch = imagesToSave.map(img => addDoc(collection(db, 'project_images'), img))
      await Promise.all(batch)
      fetchImages()
    } catch (error) {
      console.error('Error saving images:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.image_url) {
      alert('Lütfen bir resim seçin!')
      return
    }

    try {
      const imageData = {
        image_url: formData.image_url,
        title: formData.title || '',
        description: formData.description || '',
        category: formData.category,
        created_at: serverTimestamp()
      }

      await addDoc(collection(db, 'project_images'), imageData)

      setShowModal(false)
      resetForm()
      fetchImages()
    } catch (error) {
      console.error('Error saving image:', error)
      alert('Hata: ' + error.message)
    }
  }

  const handleDelete = async (id, imageUrl) => {
    if (!confirm('Bu görseli silmek istediğinizden emin misiniz?')) return

    try {
      if (imageUrl && imageUrl.includes('firebasestorage')) {
        try {
          const urlParts = imageUrl.split('/')
          const encodedPath = urlParts.slice(urlParts.indexOf('o') + 1).join('/')
          const decodedPath = decodeURIComponent(encodedPath.split('?')[0])
          const storageRef = ref(storage, decodedPath)
          await deleteObject(storageRef)
        } catch (err) {
          console.error('Error deleting image from storage:', err)
        }
      }

      await deleteDoc(doc(db, 'project_images', id))
      fetchImages()
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Hata: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      image_url: '',
      title: '',
      description: '',
      category: 'project'
    })
  }

  const getCategoryLabel = (category) => {
    return category === 'project' ? 'Proje Görseli' : 'Ekip Fotoğrafı'
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Yükleniyor...</p>
      </div>
    )
  }

  const projectImages = images.filter(img => img.category === 'project')
  const teamImages = images.filter(img => img.category === 'team')

  return (
    <div className="admin-project-images">
      <div className="admin-page-header">
        <h1>Proje Görselleri & Bizden Kareler</h1>
        <button 
          onClick={() => {
            resetForm()
            setShowModal(true)
          }} 
          className="admin-btn-primary"
        >
          <i className="fas fa-plus"></i> Yeni Görsel Ekle
        </button>
      </div>

      <div className="admin-image-categories">
        <div className="admin-image-category">
          <h2>
            <i className="fas fa-building"></i> Proje Görselleri ({projectImages.length})
          </h2>
          <div className="admin-images-grid">
            {projectImages.length === 0 ? (
              <div className="admin-empty">
                Henüz proje görseli yok. İlk görseli ekleyin!
              </div>
            ) : (
              projectImages.map((image) => (
                <div key={image.id} className="admin-image-card">
                  <div className="admin-image-preview">
                    <img src={image.image_url} alt={image.title || 'Proje görseli'} />
                    <div className="admin-image-overlay">
                      <button
                        onClick={() => handleDelete(image.id, image.image_url)}
                        className="admin-btn-delete admin-btn-small"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="admin-image-info">
                    {image.title && <h3>{image.title}</h3>}
                    {image.description && <p>{image.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-image-category">
          <h2>
            <i className="fas fa-users"></i> Bizden Kareler ({teamImages.length})
          </h2>
          <div className="admin-images-grid">
            {teamImages.length === 0 ? (
              <div className="admin-empty">
                Henüz ekip fotoğrafı yok. İlk fotoğrafı ekleyin!
              </div>
            ) : (
              teamImages.map((image) => (
                <div key={image.id} className="admin-image-card">
                  <div className="admin-image-preview">
                    <img src={image.image_url} alt={image.title || 'Ekip fotoğrafı'} />
                    <div className="admin-image-overlay">
                      <button
                        onClick={() => handleDelete(image.id, image.image_url)}
                        className="admin-btn-delete admin-btn-small"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="admin-image-info">
                    {image.title && <h3>{image.title}</h3>}
                    {image.description && <p>{image.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Yeni Görsel Ekle</h2>
              <button onClick={() => setShowModal(false)} className="admin-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Kategori *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="project">Proje Görseli</option>
                  <option value="team">Bizden Kareler</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>Görsel *</label>
                {formData.image_url ? (
                  <div className="admin-image-preview-form">
                    <img src={formData.image_url} alt="Preview" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="admin-btn-delete admin-btn-small"
                    >
                      <i className="fas fa-times"></i> Değiştir
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="admin-upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        multiple
                        className="admin-file-input"
                      />
                      {uploading && (
                        <div className="admin-upload-status">
                          <i className="fas fa-spinner fa-spin"></i> Yükleniyor...
                        </div>
                      )}
                      <p className="admin-upload-hint">
                        Birden fazla görsel seçebilirsiniz. İlk görsel bu formda kullanılacak, diğerleri otomatik kaydedilecek.
                      </p>
                    </div>
                    <div className="admin-form-group" style={{ marginTop: '1rem' }}>
                      <label>Veya Harici URL Girin</label>
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://... veya /images/..."
                        style={{ marginTop: '0.5rem' }}
                      />
                      <p className="admin-upload-hint" style={{ marginTop: '0.5rem' }}>
                        Firebase Storage yerine harici bir görsel URL'si de kullanabilirsiniz.
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="admin-form-group">
                <label>Başlık (Opsiyonel)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: AVM Kurulumu"
                />
              </div>
              <div className="admin-form-group">
                <label>Açıklama (Opsiyonel)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Görsel hakkında kısa açıklama..."
                  rows="3"
                />
              </div>
              <div className="admin-modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="admin-btn-secondary"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="admin-btn-primary" 
                  disabled={uploading || !formData.image_url}
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProjectImages

