import React, { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '../../components/Toast'
import './AdminServices.css'

const AdminServices = () => {
  const { showToast } = useToast()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    icon: 'fa-video',
    title: '',
    description: ''
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const q = query(collection(db, 'services'), orderBy('created_at', 'asc'))
      const querySnapshot = await getDocs(q)
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setServices(servicesData)
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const serviceData = {
        ...formData,
        created_at: editingService ? undefined : serverTimestamp(),
        updated_at: serverTimestamp()
      }
      
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), serviceData)
      } else {
        await addDoc(collection(db, 'services'), serviceData)
      }
      
      setShowModal(false)
      setEditingService(null)
      resetForm()
      fetchServices()
      showToast(editingService ? 'Hizmet güncellendi!' : 'Hizmet eklendi!', 'success')
    } catch (error) {
      console.error('Error saving service:', error)
      showToast('Hata: ' + error.message, 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      icon: 'fa-video',
      title: '',
      description: ''
    })
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setFormData({
      icon: service.icon || 'fa-video',
      title: service.title || '',
      description: service.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return
    
    try {
      await deleteDoc(doc(db, 'services', id))
      fetchServices()
      showToast('Hizmet silindi!', 'success')
    } catch (error) {
      console.error('Error deleting service:', error)
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
    <div className="admin-services">
      <div className="admin-page-header">
        <h1>Hizmet Paketleri Yönetimi</h1>
        <button onClick={() => {
          setEditingService(null)
          resetForm()
          setShowModal(true)
        }} className="admin-btn-primary">
          <i className="fas fa-plus"></i> Yeni Hizmet
        </button>
      </div>

      <div className="admin-services-grid">
        {services.length === 0 ? (
          <div className="admin-empty">
            Henüz hizmet yok. İlk hizmeti ekleyin!
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="admin-service-card">
              <div className="admin-service-icon">
                <i className={`fas ${service.icon}`}></i>
              </div>
              <div className="admin-service-info">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
              <div className="admin-service-actions">
                <button onClick={() => handleEdit(service)} className="admin-btn-edit">
                  <i className="fas fa-pen-to-square"></i> Düzenle
                </button>
                <button onClick={() => handleDelete(service.id)} className="admin-btn-delete">
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
              <h2>{editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet'}</h2>
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
                  placeholder="Örn: IP Kamera Sistemleri"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Açıklama *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Örn: Yüksek çözünürlüklü IP kameralar ile net görüntü kalitesi"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>İkon (Font Awesome class) *</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="fa-video"
                  required
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingService ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminServices

