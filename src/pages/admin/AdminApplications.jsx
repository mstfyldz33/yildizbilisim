import React, { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore'
import './AdminApplications.css'

const AdminApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const q = query(collection(db, 'job_applications'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      const applicationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setApplications(applicationsData)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu başvuruyu silmek istediğinizden emin misiniz?')) return
    
    try {
      await deleteDoc(doc(db, 'job_applications', id))
      fetchApplications()
      if (selectedApplication?.id === id) {
        setSelectedApplication(null)
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      alert('Hata: ' + error.message)
    }
  }

  const getPositionLabel = (position) => {
    const positions = {
      technical: 'Teknik Uzman / Kurulum Uzmanı',
      sales: 'Satış Temsilcisi',
      support: 'Teknik Destek Uzmanı',
      other: 'Diğer'
    }
    return positions[position] || position
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
    <div className="admin-applications">
      <div className="admin-page-header">
        <h1>İş Başvuruları</h1>
        <span className="admin-badge-info">{applications.length} başvuru</span>
      </div>

      <div className="admin-applications-container">
        <div className="admin-applications-list">
          {applications.length === 0 ? (
            <div className="admin-empty-state">
              <i className="fas fa-briefcase"></i>
              <p>Henüz başvuru yok</p>
            </div>
          ) : (
            applications.map((application) => (
              <div
                key={application.id}
                className={`admin-application-item ${selectedApplication?.id === application.id ? 'active' : ''}`}
                onClick={() => setSelectedApplication(application)}
              >
                <div className="admin-application-header">
                  <div>
                    <strong>{application.name}</strong>
                    <span className="admin-application-position">
                      {getPositionLabel(application.position)}
                    </span>
                  </div>
                  <span className="admin-application-date">
                    {new Date(application.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="admin-application-contact">
                  <span><i className="fas fa-envelope"></i> {application.email}</span>
                  <span><i className="fas fa-phone"></i> {application.phone}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedApplication && (
          <div className="admin-application-detail">
            <div className="admin-application-detail-header">
              <div>
                <h2>{selectedApplication.name}</h2>
                <p className="admin-application-meta">
                  <span><i className="fas fa-briefcase"></i> {getPositionLabel(selectedApplication.position)}</span>
                  <span><i className="fas fa-envelope"></i> {selectedApplication.email}</span>
                  <span><i className="fas fa-phone"></i> {selectedApplication.phone}</span>
                  <span><i className="fas fa-calendar"></i> {new Date(selectedApplication.created_at).toLocaleString('tr-TR')}</span>
                </p>
              </div>
              <button onClick={() => handleDelete(selectedApplication.id)} className="admin-btn-delete">
                <i className="fas fa-trash"></i> Sil
              </button>
            </div>
            <div className="admin-application-content">
              <div className="admin-application-section">
                <h3>Deneyim</h3>
                <p>{selectedApplication.experience || 'Belirtilmemiş'}</p>
              </div>
              {selectedApplication.cv_url && (
                <div className="admin-application-section">
                  <h3>CV</h3>
                  <a
                    href={selectedApplication.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-cv-link"
                  >
                    <i className="fas fa-file-pdf"></i> CV'yi İndir
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminApplications

