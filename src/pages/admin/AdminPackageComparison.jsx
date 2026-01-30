import React, { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, orderBy, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import './AdminPackageComparison.css'

const AdminPackageComparison = () => {
  const [packages, setPackages] = useState([])
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [editingFeature, setEditingFeature] = useState(null)
  const [packageFormData, setPackageFormData] = useState({
    package_type: '',
    package_name: '',
    description: '',
    camera_range: '',
    is_popular: false,
    order_index: 0
  })
  const [featureFormData, setFeatureFormData] = useState({
    package_id: '',
    feature_name: '',
    feature_icon: 'fa-check',
    is_included: true,
    order_index: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [packagesSnapshot, featuresSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'service_packages'), orderBy('order_index', 'asc'))),
        getDocs(query(collection(db, 'package_features'), orderBy('order_index', 'asc')))
      ])

      const packagesData = packagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      const featuresData = featuresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setPackages(packagesData)
      setFeatures(featuresData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setPackages([])
      setFeatures([])
    } finally {
      setLoading(false)
    }
  }

  const handlePackageSubmit = async (e) => {
    e.preventDefault()
    try {
      const packageData = {
        ...packageFormData,
        created_at: editingPackage ? undefined : serverTimestamp(),
        updated_at: serverTimestamp()
      }
      
      if (editingPackage) {
        await updateDoc(doc(db, 'service_packages', editingPackage.id), packageData)
      } else {
        await addDoc(collection(db, 'service_packages'), packageData)
      }
      
      setShowPackageModal(false)
      setEditingPackage(null)
      resetPackageForm()
      fetchData()
    } catch (error) {
      console.error('Error saving package:', error)
      alert('Hata: ' + error.message)
    }
  }

  const handleFeatureSubmit = async (e) => {
    e.preventDefault()
    try {
      const featureData = {
        ...featureFormData,
        created_at: editingFeature ? undefined : serverTimestamp(),
        updated_at: serverTimestamp()
      }
      
      if (editingFeature) {
        await updateDoc(doc(db, 'package_features', editingFeature.id), featureData)
      } else {
        await addDoc(collection(db, 'package_features'), featureData)
      }
      
      setShowFeatureModal(false)
      setEditingFeature(null)
      resetFeatureForm()
      fetchData()
    } catch (error) {
      console.error('Error saving feature:', error)
      alert('Hata: ' + error.message)
    }
  }

  const resetPackageForm = () => {
    setPackageFormData({
      package_type: '',
      package_name: '',
      description: '',
      camera_range: '',
      is_popular: false,
      order_index: 0
    })
  }

  const resetFeatureForm = () => {
    setFeatureFormData({
      package_id: '',
      feature_name: '',
      feature_icon: 'fa-check',
      is_included: true,
      order_index: 0
    })
  }

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg)
    setPackageFormData({
      package_type: pkg.package_type || '',
      package_name: pkg.package_name || '',
      description: pkg.description || '',
      camera_range: pkg.camera_range || '',
      is_popular: pkg.is_popular || false,
      order_index: pkg.order_index || 0
    })
    setShowPackageModal(true)
  }

  const handleEditFeature = (feature) => {
    setEditingFeature(feature)
    setFeatureFormData({
      package_id: feature.package_id || '',
      feature_name: feature.feature_name || '',
      feature_icon: feature.feature_icon || 'fa-check',
      is_included: feature.is_included !== undefined ? feature.is_included : true,
      order_index: feature.order_index || 0
    })
    setShowFeatureModal(true)
  }

  const handleDeletePackage = async (id) => {
    if (!confirm('Bu paketi silmek istediğinizden emin misiniz? Özellikleri de silinecek.')) return
    
    try {
      await deleteDoc(doc(db, 'service_packages', id))
      fetchData()
    } catch (error) {
      console.error('Error deleting package:', error)
      alert('Hata: ' + error.message)
    }
  }

  const handleDeleteFeature = async (id) => {
    if (!confirm('Bu özelliği silmek istediğinizden emin misiniz?')) return
    
    try {
      await deleteDoc(doc(db, 'package_features', id))
      fetchData()
    } catch (error) {
      console.error('Error deleting feature:', error)
      alert('Hata: ' + error.message)
    }
  }

  const getPackageFeatures = (packageId) => {
    return features.filter(f => f.package_id === packageId)
  }

  const getUniqueFeatureNames = () => {
    const uniqueNames = [...new Set(features.map(f => f.feature_name))]
    return uniqueNames
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
    <div className="admin-package-comparison">
      <div className="admin-page-header">
        <h1>Paket Karşılaştırma Yönetimi</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => {
            setEditingPackage(null)
            resetPackageForm()
            setShowPackageModal(true)
          }} className="admin-btn-primary">
            <i className="fas fa-plus"></i> Yeni Paket
          </button>
          <button onClick={() => {
            setEditingFeature(null)
            resetFeatureForm()
            setShowFeatureModal(true)
          }} className="admin-btn-primary">
            <i className="fas fa-plus"></i> Yeni Özellik
          </button>
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="admin-empty">
          <p>Henüz paket yok. İlk paketi ekleyin!</p>
        </div>
      ) : (
        <>
          <div className="admin-packages-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="admin-package-card">
                <div className="admin-package-header">
                  <h3>{pkg.package_name}</h3>
                  {pkg.is_popular && <span className="admin-badge">Popüler</span>}
                </div>
                <div className="admin-package-info">
                  <p><strong>Tip:</strong> {pkg.package_type}</p>
                  <p><strong>Kamera Aralığı:</strong> {pkg.camera_range || 'Belirtilmemiş'}</p>
                  {pkg.description && <p><strong>Açıklama:</strong> {pkg.description}</p>}
                  <p><strong>Özellik Sayısı:</strong> {getPackageFeatures(pkg.id).length}</p>
                </div>
                <div className="admin-package-actions">
                  <button onClick={() => handleEditPackage(pkg)} className="admin-btn-edit">
                    <i className="fas fa-pen-to-square"></i> Düzenle
                  </button>
                  <button onClick={() => handleDeletePackage(pkg.id)} className="admin-btn-delete">
                    <i className="fas fa-trash"></i> Sil
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-comparison-table-wrapper">
            <h2>Paket Özellikleri Karşılaştırması</h2>
            <div className="admin-comparison-table-container">
              <table className="admin-comparison-table">
                <thead>
                  <tr>
                    <th>Özellik</th>
                    {packages.map((pkg) => (
                      <th key={pkg.id}>
                        <div>{pkg.package_name}</div>
                        <small>{pkg.camera_range}</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getUniqueFeatureNames().map((featureName) => (
                    <tr key={featureName}>
                      <td>{featureName}</td>
                      {packages.map((pkg) => {
                        const feature = features.find(
                          f => f.package_id === pkg.id && f.feature_name === featureName
                        )
                        return (
                          <td key={pkg.id}>
                            {feature ? (
                              <div className="admin-feature-cell">
                                <i className={`fas ${feature.is_included ? 'fa-check' : 'fa-times'} ${feature.is_included ? 'check' : 'times'}`}></i>
                                <button
                                  onClick={() => handleEditFeature(feature)}
                                  className="admin-btn-icon-small"
                                  title="Düzenle"
                                >
                                  <i className="fas fa-pen-to-square"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteFeature(feature.id)}
                                  className="admin-btn-icon-small admin-btn-danger"
                                  title="Sil"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setFeatureFormData({
                                    package_id: pkg.id,
                                    feature_name: featureName,
                                    feature_icon: 'fa-check',
                                    is_included: true,
                                    order_index: features.length
                                  })
                                  setShowFeatureModal(true)
                                }}
                                className="admin-btn-icon-small"
                                title="Özellik Ekle"
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showPackageModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPackageModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingPackage ? 'Paket Düzenle' : 'Yeni Paket'}</h2>
              <button onClick={() => setShowPackageModal(false)} className="admin-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handlePackageSubmit} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Paket Tipi *</label>
                <select
                  value={packageFormData.package_type}
                  onChange={(e) => setPackageFormData({ ...packageFormData, package_type: e.target.value })}
                  required
                  disabled={!!editingPackage}
                >
                  <option value="">Seçiniz</option>
                  <option value="basic">Temel (Basic)</option>
                  <option value="standard">Standart (Standard)</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Kurumsal (Enterprise)</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>Paket Adı *</label>
                <input
                  type="text"
                  value={packageFormData.package_name}
                  onChange={(e) => setPackageFormData({ ...packageFormData, package_name: e.target.value })}
                  placeholder="Örn: Temel Paket"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Kamera Aralığı *</label>
                <input
                  type="text"
                  value={packageFormData.camera_range}
                  onChange={(e) => setPackageFormData({ ...packageFormData, camera_range: e.target.value })}
                  placeholder="Örn: 2-4 Kamera"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>Açıklama</label>
                <textarea
                  value={packageFormData.description}
                  onChange={(e) => setPackageFormData({ ...packageFormData, description: e.target.value })}
                  rows="3"
                  placeholder="Paket açıklaması"
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={packageFormData.is_popular}
                      onChange={(e) => setPackageFormData({ ...packageFormData, is_popular: e.target.checked })}
                    />
                    Popüler Paket
                  </label>
                </div>
                <div className="admin-form-group">
                  <label>Sıra No *</label>
                  <input
                    type="number"
                    value={packageFormData.order_index}
                    onChange={(e) => setPackageFormData({ ...packageFormData, order_index: parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowPackageModal(false)} className="admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingPackage ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFeatureModal && (
        <div className="admin-modal-overlay" onClick={() => setShowFeatureModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingFeature ? 'Özellik Düzenle' : 'Yeni Özellik'}</h2>
              <button onClick={() => setShowFeatureModal(false)} className="admin-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleFeatureSubmit} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Paket *</label>
                <select
                  value={featureFormData.package_id}
                  onChange={(e) => setFeatureFormData({ ...featureFormData, package_id: e.target.value })}
                  required
                >
                  <option value="">Seçiniz</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>{pkg.package_name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Özellik Adı *</label>
                <input
                  type="text"
                  value={featureFormData.feature_name}
                  onChange={(e) => setFeatureFormData({ ...featureFormData, feature_name: e.target.value })}
                  placeholder="Örn: IP Kamera"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label>İkon (Font Awesome) *</label>
                <input
                  type="text"
                  value={featureFormData.feature_icon}
                  onChange={(e) => setFeatureFormData({ ...featureFormData, feature_icon: e.target.value })}
                  placeholder="fa-video"
                  required
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={featureFormData.is_included}
                      onChange={(e) => setFeatureFormData({ ...featureFormData, is_included: e.target.checked })}
                    />
                    Pakette Dahil
                  </label>
                </div>
                <div className="admin-form-group">
                  <label>Sıra No *</label>
                  <input
                    type="number"
                    value={featureFormData.order_index}
                    onChange={(e) => setFeatureFormData({ ...featureFormData, order_index: parseInt(e.target.value) || 0 })}
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowFeatureModal(false)} className="admin-btn-secondary">
                  İptal
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingFeature ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPackageComparison

