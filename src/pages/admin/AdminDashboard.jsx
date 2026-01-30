import React, { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, getCountFromServer, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { parseDevice } from '../../utils/deviceParser'
import './AdminDashboard.css'

const COLORS = ['#DC2626', '#2563EB', '#EF4444', '#3B82F6', '#B91C1C', '#1D4ED8', '#991B1B', '#1E40AF']

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    blogCount: 0,
    projectCount: 0,
    testimonialCount: 0,
    messageCount: 0,
    applicationCount: 0
  })
  const [visitStats, setVisitStats] = useState({
    deviceData: [],
    durationData: [],
    dailyVisits: [],
    avgDuration: 0,
    totalUniqueVisitors: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchVisitStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [blogCount, projectCount, testimonialCount, messageCount, applicationCount] = await Promise.all([
        getCountFromServer(collection(db, 'blog_posts')),
        getCountFromServer(collection(db, 'projects')),
        getCountFromServer(collection(db, 'testimonials')),
        getCountFromServer(collection(db, 'contact_messages')),
        getCountFromServer(collection(db, 'job_applications'))
      ])

      setStats({
        blogCount: blogCount.data().count || 0,
        projectCount: projectCount.data().count || 0,
        testimonialCount: testimonialCount.data().count || 0,
        messageCount: messageCount.data().count || 0,
        applicationCount: applicationCount.data().count || 0
      })
    } catch (error) {
      console.error('Stats fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVisitStats = async () => {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo)

      const q = query(
        collection(db, 'visit_logs'),
        where('created_at', '>=', thirtyDaysAgoTimestamp),
        orderBy('created_at', 'asc')
      )
      const querySnapshot = await getDocs(q)

      const deviceCounts = {}
      const ipSessions = {}
      const dailyCounts = {}

      querySnapshot.docs.forEach(doc => {
        const log = doc.data()
        const created_at = log.created_at?.toDate ? log.created_at.toDate() : new Date(log.created_at)
        
        const device = parseDevice(log.user_agent)
        deviceCounts[device] = (deviceCounts[device] || 0) + 1

        const ip = log.ip_address
        if (!ipSessions[ip]) {
          ipSessions[ip] = {
            firstVisit: created_at,
            lastVisit: created_at,
            pages: new Set()
          }
        }
        const session = ipSessions[ip]
        if (created_at < session.firstVisit) {
          session.firstVisit = created_at
        }
        if (created_at > session.lastVisit) {
          session.lastVisit = created_at
        }
        session.pages.add(log.page)

        const date = created_at.toISOString().split('T')[0]
        dailyCounts[date] = (dailyCounts[date] || 0) + 1
      })

      const deviceData = Object.entries(deviceCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      const durations = []
      Object.values(ipSessions).forEach(session => {
        const duration = (session.lastVisit - session.firstVisit) / 1000
        if (duration > 0) {
          durations.push(duration)
        }
      })

      const durationBuckets = {
        '0-30 saniye': 0,
        '30 saniye - 1 dakika': 0,
        '1-3 dakika': 0,
        '3-5 dakika': 0,
        '5-10 dakika': 0,
        '10-30 dakika': 0,
        '30+ dakika': 0
      }

      durations.forEach(duration => {
        if (duration < 30) {
          durationBuckets['0-30 saniye']++
        } else if (duration < 60) {
          durationBuckets['30 saniye - 1 dakika']++
        } else if (duration < 180) {
          durationBuckets['1-3 dakika']++
        } else if (duration < 300) {
          durationBuckets['3-5 dakika']++
        } else if (duration < 600) {
          durationBuckets['5-10 dakika']++
        } else if (duration < 1800) {
          durationBuckets['10-30 dakika']++
        } else {
          durationBuckets['30+ dakika']++
        }
      })

      const durationData = Object.entries(durationBuckets)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0)

      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        last7Days.push({
          date: new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
          visits: dailyCounts[dateStr] || 0
        })
      }

      const avgDuration = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0

      setVisitStats({
        deviceData,
        durationData,
        dailyVisits: last7Days,
        avgDuration,
        totalUniqueVisitors: Object.keys(ipSessions).length
      })
    } catch (error) {
      console.error('Error fetching visit stats:', error)
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
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Dashboard</h1>
        <p>Hoş geldiniz! Sistem genel bakışı</p>
      </div>
      
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blog">
            <i className="fas fa-newspaper"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.blogCount}</h3>
            <p>Blog Yazısı</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon project">
            <i className="fas fa-project-diagram"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.projectCount}</h3>
            <p>Proje</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon testimonial">
            <i className="fas fa-comments"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.testimonialCount}</h3>
            <p>Müşteri Yorumu</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon message">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.messageCount}</h3>
            <p>İletişim Mesajı</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon application">
            <i className="fas fa-briefcase"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.applicationCount}</h3>
            <p>İş Başvurusu</p>
          </div>
        </div>
      </div>

      <div className="admin-visit-analytics">
        <div className="admin-charts-header">
          <h2>Ziyaretçi Analitiği</h2>
          <div className="admin-visit-summary">
            <div className="admin-visit-stat">
              <i className="fas fa-users"></i>
              <div>
                <span className="stat-value">{visitStats.totalUniqueVisitors}</span>
                <span className="stat-label">Benzersiz Ziyaretçi</span>
              </div>
            </div>
            <div className="admin-visit-stat">
              <i className="fas fa-clock"></i>
              <div>
                <span className="stat-value">{formatDuration(visitStats.avgDuration)}</span>
                <span className="stat-label">Ortalama Kalış Süresi</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-charts-grid">
          <div className="admin-chart-card">
            <h3>Cihaz Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={visitStats.deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {visitStats.deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="admin-chart-card">
            <h3>Ziyaret Süreleri</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitStats.durationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="admin-chart-card full-width">
            <h3>Son 7 Günlük Ziyaret Trendi</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitStats.dailyVisits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#764ba2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="admin-quick-actions">
        <h2>Hızlı İşlemler</h2>
        <div className="admin-actions-grid">
          <a href="/admin/blog" className="admin-action-card">
            <i className="fas fa-circle-plus"></i>
            <span>Yeni Blog Yazısı</span>
          </a>
          <a href="/admin/projects" className="admin-action-card">
            <i className="fas fa-circle-plus"></i>
            <span>Yeni Proje Ekle</span>
          </a>
          <a href="/admin/testimonials" className="admin-action-card">
            <i className="fas fa-circle-plus"></i>
            <span>Yeni Yorum Ekle</span>
          </a>
        </div>
      </div>
    </div>
  )
}

const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0 sn'
  
  if (seconds < 60) {
    return `${Math.round(seconds)} sn`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${minutes} dk ${secs} sn`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours} sa ${minutes} dk`
  }
}

export default AdminDashboard

