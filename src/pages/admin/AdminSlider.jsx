import React, { useEffect, useState } from 'react'
import { db, storage } from '../../lib/firebase'
import { useToast } from '../../components/Toast'
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import './AdminSlider.css'

const AdminSlider = () => {
  const { showToast } = useToast()
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSlide, setEditingSlide] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    icon: 'fa-shield-halved',
    isH1: false,
    buttons: [],
    media_type: 'icon', // 'icon', 'youtube', 'video', 'image'
    youtube_url: '',
    video_url: '',
    video_autoplay: true,
    video_muted: true,
    video_loop: true,
    image_url: ''
  })
  const [newButton, setNewButton] = useState({ text: '', href: '', primary: true })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchSlides()
  }, [])

  const parseButtons = (buttons) => {
    if (Array.isArray(buttons)) return buttons
    if (typeof buttons === 'string') {
      try {
        return JSON.parse(buttons) || []
      } catch {
        return []
      }
    }
    return []
  }

  const fetchSlides = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'hero_slides'))
      const slidesData = querySnapshot.docs.map((snap) => {
        const data = snap.data()
        return {
          id: snap.id,
          ...data,
          order_index: data.order_index ?? 999999,
          buttons: parseButtons(data.buttons)
        }
      })
      slidesData.sort((a, b) => (a.order_index ?? 999999) - (b.order_index ?? 999999))
      setSlides(slidesData)
    } catch (error) {
      console.error('Error fetching slides:', error)
      setSlides([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddButton = () => {
    if (newButton.text.trim() && newButton.href.trim()) {
      setFormData({
        ...formData,
        buttons: [...formData.buttons, { ...newButton }]
      })
      setNewButton({ text: '', href: '', primary: true })
    }
  }

  const handleRemoveButton = (index) => {
    setFormData({
      ...formData,
      buttons: formData.buttons.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.media_type === 'image' && !formData.image_url?.trim()) {
      alert('Resim seçiliyken bir slider resmi yüklemeniz veya URL girmeniz gerekir.')
      return
    }
    try {
      const baseData = {
        ...formData,
        buttons: formData.buttons,
        video_autoplay: formData.video_autoplay !== undefined ? formData.video_autoplay : true,
        video_muted: formData.video_muted !== undefined ? formData.video_muted : true,
        video_loop: formData.video_loop !== undefined ? formData.video_loop : true,
        updated_at: serverTimestamp()
      }

      if (editingSlide) {
        await updateDoc(doc(db, 'hero_slides', editingSlide.id), baseData)
      } else {
        const snapshot = await getDocs(collection(db, 'hero_slides'))
        const existingOrders = snapshot.docs.map((d) => d.data().order_index).filter((n) => typeof n === 'number')
        const nextOrder = existingOrders.length ? Math.max(...existingOrders, 0) + 1 : 0

        await addDoc(collection(db, 'hero_slides'), {
          ...baseData,
          created_at: serverTimestamp(),
          order_index: nextOrder
        })
      }
      
      setShowModal(false)
      setEditingSlide(null)
      resetForm()
      fetchSlides()
    } catch (error) {
      console.error('Error saving slide:', error)
      alert('Hata: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      icon: 'fa-shield-halved',
      isH1: false,
      buttons: [],
      media_type: 'icon',
      youtube_url: '',
      video_url: '',
      video_autoplay: true,
      video_muted: true,
      video_loop: true,
      image_url: ''
    })
  }

  const handleEdit = (slide) => {
    setEditingSlide(slide)
    setFormData({
      title: slide.title || '',
      content: slide.content || '',
      icon: slide.icon || 'fa-shield-halved',
      isH1: slide.isH1 || false,
      buttons: Array.isArray(slide.buttons) ? slide.buttons : [],
      media_type: slide.media_type || 'icon',
      youtube_url: slide.youtube_url || '',
      video_url: slide.video_url || '',
      video_autoplay: slide.video_autoplay !== undefined ? slide.video_autoplay : true,
      video_muted: slide.video_muted !== undefined ? slide.video_muted : true,
      video_loop: slide.video_loop !== undefined ? slide.video_loop : true,
      image_url: slide.image_url || ''
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
      const filePath = `images/slider/${fileName}`
      const storageRef = ref(storage, filePath)

      await uploadBytes(storageRef, file)
      const publicUrl = await getDownloadURL(storageRef)
      setFormData({ ...formData, image_url: publicUrl })
      showToast('Resim yüklendi. Kaydet butonuna basarak slide\'ı güncelleyin.', 'success')
    } catch (error) {
      console.error('Error uploading image:', error)
      showToast('Resim yüklenemedi: ' + (error.message || 'Bilinmeyen hata'), 'error')
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
    if (!confirm('Bu slider öğesini silmek istediğinizden emin misiniz?')) return
    
    try {
      await deleteDoc(doc(db, 'hero_slides', id))
      fetchSlides()
    } catch (error) {
      console.error('Error deleting slide:', error)
      alert('Hata: ' + error.message)
    }
  }

  const handleMove = async (id, direction) => {
    try {
      const currentIndex = slides.findIndex(s => s.id === id)
      if (currentIndex === -1) return

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= slides.length) return

      const currentSlide = slides[currentIndex]
      const targetSlide = slides[newIndex]

      await updateDoc(doc(db, 'hero_slides', currentSlide.id), { order_index: targetSlide.order_index })
      await updateDoc(doc(db, 'hero_slides', targetSlide.id), { order_index: currentSlide.order_index })

      fetchSlides()
    } catch (error) {
      console.error('Error moving slide:', error)
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
    <div className="admin-slider">
      <div className="admin-page-header">
        <h1>Slider Yönetimi</h1>
        <button onClick={() => {
          setEditingSlide(null)
          resetForm()
          setShowModal(true)
        }} className="admin-btn-primary">
          <i className="fas fa-plus"></i> Yeni Slide
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Başlık</th>
              <th>İkon</th>
              <th>Buton Sayısı</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {slides.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-empty">
                  Henüz slide yok. İlk slide'ı ekleyin!
                </td>
              </tr>
            ) : (
              slides.map((slide, index) => (
                <tr key={slide.id}>
                  <td>
                    <div className="admin-order-controls">
                      <button
                        onClick={() => handleMove(slide.id, 'up')}
                        disabled={index === 0}
                        className="admin-btn-icon"
                      >
                        <i className="fas fa-chevron-up"></i>
                      </button>
                      <span>{index + 1}</span>
                      <button
                        onClick={() => handleMove(slide.id, 'down')}
                        disabled={index === slides.length - 1}
                        className="admin-btn-icon"
                      >
                        <i className="fas fa-chevron-down"></i>
                      </button>
                    </div>
                  </td>
                  <td>{slide.title}</td>
                  <td><i className={`fas ${slide.icon}`}></i></td>
                  <td>{parseButtons(slide.buttons).length}</td>
                  <td>
                    <div className="admin-actions">
                      <button onClick={() => handleEdit(slide)} className="admin-btn-edit">
                        <i className="fas fa-pen-to-square"></i> Düzenle
                      </button>
                      <button onClick={() => handleDelete(slide.id)} className="admin-btn-delete">
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
          <div className="admin-modal admin-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingSlide ? 'Slide Düzenle' : 'Yeni Slide'}</h2>
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
                <label>İçerik *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="4"
                  required
                />
              </div>
              <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Medya Tipi *</label>
                <select
                  value={formData.media_type}
                  onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                  required
                >
                  <option value="icon">İkon</option>
                  <option value="image">Resim</option>
                  <option value="youtube">YouTube Video</option>
                  <option value="video">Video Dosyası</option>
                </select>
              </div>
              
              {formData.media_type === 'icon' && (
                <div className="admin-form-group">
                  <label>İkon (Font Awesome class) *</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="fa-shield-halved"
                    required
                  />
                </div>
              )}

              {formData.media_type === 'image' && (
                <div className="admin-form-group">
                  <label>Slider Resmi *</label>
                  {formData.image_url ? (
                    <div className="admin-image-preview-form">
                      <img src={formData.image_url} alt="Slider resmi" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
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
                        Slider için resim yükleyebilirsiniz. Önerilen boyut: 1920x1080px
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
              )}
              
              {formData.media_type === 'youtube' && (
                <>
                  <div className="admin-form-group">
                    <label>YouTube Video URL *</label>
                    <input
                      type="text"
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... veya https://youtu.be/..."
                      required
                    />
                    <p className="admin-form-hint">
                      YouTube video linkini yapıştırın. Video otomatik başlayacak, sessiz olacak ve döngüde çalışacak.
                    </p>
                  </div>
                </>
              )}
              
              {formData.media_type === 'video' && (
                <>
                  <div className="admin-form-group">
                    <label>Video URL (Firebase Storage veya harici link) *</label>
                    <input
                      type="text"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://... veya /videos/..."
                      required
                    />
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.video_autoplay}
                          onChange={(e) => setFormData({ ...formData, video_autoplay: e.target.checked })}
                        />
                        Otomatik Başlat
                      </label>
                    </div>
                    <div className="admin-form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.video_muted}
                          onChange={(e) => setFormData({ ...formData, video_muted: e.target.checked })}
                        />
                        Sessiz (Muted)
                      </label>
                    </div>
                    <div className="admin-form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.video_loop}
                          onChange={(e) => setFormData({ ...formData, video_loop: e.target.checked })}
                        />
                        Döngü (Loop)
                      </label>
                    </div>
                  </div>
                  <p className="admin-form-hint">
                    Video dosyaları için MP4 formatı önerilir. Büyük dosyalar için YouTube kullanmanız önerilir.
                  </p>
                </>
              )}
                <div className="admin-form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isH1}
                      onChange={(e) => setFormData({ ...formData, isH1: e.target.checked })}
                    />
                    H1 Başlık (SEO için)
                  </label>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Butonlar</label>
                <div className="admin-buttons-list">
                  {formData.buttons.map((btn, index) => (
                    <div key={index} className="admin-button-item">
                      <span>{btn.text}</span>
                      <span className="admin-button-href">{btn.href}</span>
                      <span className="admin-button-type">{btn.primary ? 'Primary' : 'Secondary'}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveButton(index)}
                        className="admin-feature-remove"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                  <div className="admin-button-add">
                    <input
                      type="text"
                      placeholder="Buton Metni"
                      value={newButton.text}
                      onChange={(e) => setNewButton({ ...newButton, text: e.target.value })}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder="Link (#services)"
                      value={newButton.href}
                      onChange={(e) => setNewButton({ ...newButton, href: e.target.value })}
                      style={{ flex: 1 }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={newButton.primary}
                        onChange={(e) => setNewButton({ ...newButton, primary: e.target.checked })}
                      />
                      Primary
                    </label>
                    <button type="button" onClick={handleAddButton} className="admin-btn-small">
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingSlide ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSlider

