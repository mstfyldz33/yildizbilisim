import React, { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, orderBy, getDocs, doc, deleteDoc, where, limit, Timestamp, getCountFromServer } from 'firebase/firestore'
import './AdminVisitLogs.css'

const AdminVisitLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    page: '',
    ip: '',
    eventType: ''
  })
  const [stats, setStats] = useState({
    totalVisits: 0,
    uniqueIPs: 0,
    todayVisits: 0
  })

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [filter])

  const fetchLogs = async () => {
    try {
      let q = query(collection(db, 'visit_logs'), orderBy('created_at', 'desc'), limit(500))

      if (filter.startDate) {
        const startDate = Timestamp.fromDate(new Date(filter.startDate))
        q = query(q, where('created_at', '>=', startDate))
      }
      if (filter.endDate) {
        const endDate = Timestamp.fromDate(new Date(filter.endDate + 'T23:59:59'))
        q = query(q, where('created_at', '<=', endDate))
      }
      if (filter.eventType) {
        q = query(q, where('event_type', '==', filter.eventType))
      }

      const querySnapshot = await getDocs(q)
      let logsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      if (filter.page) {
        logsData = logsData.filter(log => 
          log.page?.toLowerCase().includes(filter.page.toLowerCase())
        )
      }
      if (filter.ip) {
        logsData = logsData.filter(log => 
          log.ip_address?.toLowerCase().includes(filter.ip.toLowerCase())
        )
      }

      setLogs(logsData)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const totalSnapshot = await getCountFromServer(collection(db, 'visit_logs'))
      const totalCount = totalSnapshot.data().count || 0

      const allLogsSnapshot = await getDocs(collection(db, 'visit_logs'))
      const uniqueIPs = new Set()
      allLogsSnapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.ip_address) {
          uniqueIPs.add(data.ip_address)
        }
      })

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTimestamp = Timestamp.fromDate(today)
      const todayQuery = query(
        collection(db, 'visit_logs'),
        where('created_at', '>=', todayTimestamp)
      )
      const todaySnapshot = await getCountFromServer(todayQuery)
      const todayCount = todaySnapshot.data().count || 0

      setStats({
        totalVisits: totalCount,
        uniqueIPs: uniqueIPs.size,
        todayVisits: todayCount
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu log kaydını silmek istediğinizden emin misiniz?')) return
    
    try {
      await deleteDoc(doc(db, 'visit_logs', id))
      fetchLogs()
      fetchStats()
    } catch (error) {
      console.error('Error deleting log:', error)
      alert('Hata: ' + error.message)
    }
  }

  const handleClearOldLogs = async () => {
    if (!confirm('30 günden eski tüm log kayıtlarını silmek istediğinizden emin misiniz?')) return
    
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo)
      
      const q = query(
        collection(db, 'visit_logs'),
        where('created_at', '<', thirtyDaysAgoTimestamp)
      )
      const snapshot = await getDocs(q)
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      fetchLogs()
      fetchStats()
      alert('Eski loglar silindi!')
    } catch (error) {
      console.error('Error clearing old logs:', error)
      alert('Hata: ' + error.message)
    }
  }

  const formatDate = (dateValue) => {
    let date
    if (dateValue?.toDate) {
      date = dateValue.toDate()
    } else if (dateValue?.seconds) {
      date = new Date(dateValue.seconds * 1000)
    } else {
      date = new Date(dateValue)
    }
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
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
    <div className="admin-visit-logs">
      <div className="admin-page-header">
        <h1>Ziyaret Logları & IP Takibi</h1>
        <button onClick={handleClearOldLogs} className="admin-btn-secondary">
          <i className="fas fa-trash"></i> 30+ Günlük Eski Logları Temizle
        </button>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon visit">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.totalVisits}</h3>
            <p>Toplam Ziyaret</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon ip">
            <i className="fas fa-network-wired"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.uniqueIPs}</h3>
            <p>Benzersiz IP</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon today">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.todayVisits}</h3>
            <p>Bugünkü Ziyaret</p>
          </div>
        </div>
      </div>

      <div className="admin-filters">
        <h3>Filtreler</h3>
        <div className="admin-filter-grid">
          <div className="admin-filter-item">
            <label>Başlangıç Tarihi</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
            />
          </div>
          <div className="admin-filter-item">
            <label>Bitiş Tarihi</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
            />
          </div>
          <div className="admin-filter-item">
            <label>Sayfa</label>
            <input
              type="text"
              placeholder="Sayfa URL'i"
              value={filter.page}
              onChange={(e) => setFilter({ ...filter, page: e.target.value })}
            />
          </div>
          <div className="admin-filter-item">
            <label>IP Adresi</label>
            <input
              type="text"
              placeholder="IP adresi"
              value={filter.ip}
              onChange={(e) => setFilter({ ...filter, ip: e.target.value })}
            />
          </div>
          <div className="admin-filter-item">
            <label>Olay Tipi</label>
            <select
              value={filter.eventType}
              onChange={(e) => setFilter({ ...filter, eventType: e.target.value })}
            >
              <option value="">Tümü</option>
              <option value="page_view">Sayfa Görüntüleme</option>
              <option value="click">Tıklama</option>
              <option value="download">İndirme</option>
            </select>
          </div>
          <div className="admin-filter-item">
            <button
              onClick={() => setFilter({ startDate: '', endDate: '', page: '', ip: '', eventType: '' })}
              className="admin-btn-secondary"
            >
              <i className="fas fa-times"></i> Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tarih/Saat</th>
              <th>IP Adresi</th>
              <th>Sayfa</th>
              <th>Platform</th>
              <th>Olay Tipi</th>
              <th>Referrer</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-empty">
                  Henüz log kaydı yok.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.created_at)}</td>
                  <td><code>{log.ip_address}</code></td>
                  <td>{log.page}</td>
                  <td>{log.platform || '-'}</td>
                  <td>
                    <span className="admin-event-badge">{log.event_type || 'page_view'}</span>
                  </td>
                  <td className="admin-referrer">{log.referrer || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="admin-btn-delete"
                      title="Sil"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminVisitLogs

