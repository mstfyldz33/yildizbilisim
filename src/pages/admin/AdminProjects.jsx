import React, { useEffect, useState } from 'react'
import { db, storage } from '../../lib/firebase'
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import './AdminProjects.css'

const AdminProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    badge: 'Kurumsal',
    icon: 'fa-building',
    location: '',
    year: new Date().getFullYear().toString(),
    features: [],
    status: 'active',
    gallery_images: []
  })
  const [newFeature, setNewFeature] = useState({ icon: 'fa-video', text: '' })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const q = query(collection(db, 'projects'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProjects(projectsData)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFeature = () => {
    if (newFeature.text.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature]
      })
      setNewFeature({ icon: 'fa-video', text: '' })
    }
  }

  const handleRemoveFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = files.map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} bir resim dosyası değil!`)
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `images/projects/${formData.title || 'project'}_${fileName}`
        const storageRef = ref(storage, filePath)

        await uploadBytes(storageRef, file)
        const publicUrl = await getDownloadURL(storageRef)
        return publicUrl
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setFormData({
        ...formData,
        gallery_images: [...formData.gallery_images, ...uploadedUrls]
      })
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Resim yüklenirken hata oluştu: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (imageUrl, index) => {
    if (!confirm('Bu resmi silmek istediğinizden emin misiniz?')) return

    try {
      const urlParts = imageUrl.split('/')
      const encodedPath = urlParts.slice(urlParts.indexOf('o') + 1).join('/')
      const decodedPath = decodeURIComponent(encodedPath.split('?')[0])
      
      const storageRef = ref(storage, decodedPath)
      await deleteObject(storageRef)

      setFormData({
        ...formData,
        gallery_images: formData.gallery_images.filter((_, i) => i !== index)
      })
    } catch (error) {
      console.error('Error removing image:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const projectData = {
        ...formData,
        features: formData.features,
        gallery_images: formData.gallery_images,
        created_at: editingProject ? undefined : serverTimestamp(),
        updated_at: serverTimestamp()
      }

      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject.id), projectData)
      } else {
        await addDoc(collection(db, 'projects'), projectData)
      }
      
      setShowModal(false)
      setEditingProject(null)
      resetForm()
      fetchProjects()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Hata: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      badge: 'Kurumsal',
      icon: 'fa-building',
      location: '',
      year: new Date().getFullYear().toString(),
      features: [],
      status: 'active',
      gallery_images: []
    })
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      ...project,
      features: Array.isArray(project.features) ? project.features : [],
      gallery_images: Array.isArray(project.gallery_images) ? project.gallery_images : [],
      status: project.status || 'active'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return
    
    try {
      await deleteDoc(doc(db, 'projects', id))
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
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
    <div className="admin-projects">
      <div className="admin-page-header">
        <h1>Proje Yönetimi</h1>
        <button onClick={() => {
          setEditingProject(null)
          resetForm()
          setShowModal(true)
        }} className="admin-btn-primary">
          <i className="fas fa-plus"></i> Yeni Proje
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Proje Adı</th>
              <th>Konum</th>
              <th>Yıl</th>
              <th>Badge</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-empty">
                  Henüz proje yok. İlk projenizi ekleyin!
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.location}</td>
                  <td>{project.year}</td>
                  <td><span className="admin-badge">{project.badge}</span></td>
                  <td>
                    <span className={`admin-status ${project.status === 'completed' ? 'completed' : 'active'}`}>
                      {project.status === 'completed' ? 'Sonlandırıldı' : 'Aktif'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button onClick={() => handleEdit(project)} className="admin-btn-edit">
                        <i className="fas fa-pen-to-square"></i> Düzenle
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="admin-btn-delete">
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
              <h2>{editingProject ? 'Proje Düzenle' : 'Yeni Proje'}</h2>
              <button onClick={() => setShowModal(false)} className="admin-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Proje Adı *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Açıklama *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  required
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Konum *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Yıl *</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Badge *</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    required
                  >
                    <option value="Kurumsal">Kurumsal</option>
                    <option value="Konut Sitesi">Konut Sitesi</option>
                    <option value="Mağaza">Mağaza</option>
                  </select>
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
              </div>
              <div className="admin-form-group">
                <label>Özellikler</label>
                <div className="admin-features-list">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="admin-feature-item">
                      <i className={`fas ${feature.icon}`}></i>
                      <span>{feature.text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="admin-feature-remove"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                  <div className="admin-feature-add">
                    <input
                      type="text"
                      placeholder="İkon (örn: fa-video)"
                      value={newFeature.icon}
                      onChange={(e) => setNewFeature({ ...newFeature, icon: e.target.value })}
                      style={{ width: '150px' }}
                    />
                    <input
                      type="text"
                      placeholder="Özellik metni"
                      value={newFeature.text}
                      onChange={(e) => setNewFeature({ ...newFeature, text: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      style={{ flex: 1 }}
                    />
                    <button type="button" onClick={handleAddFeature} className="admin-btn-small">
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Durum *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="active">Aktif</option>
                    <option value="completed">Sonlandırıldı</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Proje Galeri Resimleri</label>
                {formData.gallery_images.length > 0 && (
                  <div className="admin-gallery-preview">
                    {formData.gallery_images.map((img, index) => (
                      <div key={index} className="admin-gallery-item">
                        <img src={img} alt={`Proje ${index + 1}`} />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img, index)}
                          className="admin-gallery-remove"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="admin-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="admin-file-input"
                  />
                  {uploading && (
                    <div className="admin-upload-status">
                      <i className="fas fa-spinner fa-spin"></i> Yükleniyor...
                    </div>
                  )}
                  <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                    Birden fazla resim seçebilirsiniz
                  </p>
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingProject ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProjects

