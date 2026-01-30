import React, { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const q = query(
        collection(db, 'projects'),
        orderBy('created_at', 'desc'),
        limit(3)
      )
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

  if (loading) {
    return (
      <section id="projects" className="projects">
        <div className="container">
          <div className="projects-header">
            <h2>Sonlandırılan Projeler</h2>
            <p>Müşterilerimizle birlikte gerçekleştirdiğimiz başarılı projeler</p>
          </div>
          <div className="admin-loading">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </div>
      </section>
    )
  }

  const defaultProjects = [
    {
      icon: 'fa-building',
      badge: 'Kurumsal',
      title: 'Silifke AVM Kamera Sistemi',
      description: '64 kanal NVR, 4K IP kamera altyapısı, uzaktan izleme ve uyarı sistemi ile tam güvenlik çözümü.',
      features: [
        { icon: 'fa-video', text: '64 IP Kamera' },
        { icon: 'fa-server', text: 'NVR Sistemi' },
        { icon: 'fa-mobile-screen-button', text: 'Mobil İzleme' },
        { icon: 'fa-bell', text: 'Uyarı Sistemi' }
      ],
      location: 'Silifke/Mersin',
      year: '2024'
    },
    {
      icon: 'fa-home',
      badge: 'Konut Sitesi',
      title: 'Deniz Sitesi Güvenlik Projesi',
      description: '36 IP kamera, plaka tanıma sistemi ve mobil izleme entegrasyonu ile konut sitesi güvenlik çözümü.',
      features: [
        { icon: 'fa-video', text: '36 IP Kamera' },
        { icon: 'fa-car', text: 'Plaka Tanıma' },
        { icon: 'fa-mobile-screen-button', text: 'Mobil İzleme' },
        { icon: 'fa-cloud', text: 'Bulut Depolama' }
      ],
      location: 'Atakent, Silifke',
      year: '2024'
    },
    {
      icon: 'fa-store',
      badge: 'Mağaza',
      title: 'Silifke Şube Zinciri',
      description: '8 mağazada toplam 72 kamera, bulut kayıt sistemi ve merkezi raporlama ile zincir mağaza güvenlik çözümü.',
      features: [
        { icon: 'fa-video', text: '72 Kamera' },
        { icon: 'fa-store', text: '8 Mağaza' },
        { icon: 'fa-cloud', text: 'Bulut Kayıt' },
        { icon: 'fa-chart-bar', text: 'Raporlama' }
      ],
      location: 'İlçe Geneli',
      year: '2023'
    }
  ]

  const displayProjects = projects.length > 0 ? projects.map(p => ({
    ...p,
    features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features || []
  })) : defaultProjects

  const getBadgeClass = (badge) => {
    const classes = {
      'Kurumsal': 'badge-corporate',
      'Konut Sitesi': 'badge-residential',
      'Mağaza': 'badge-retail'
    }
    return classes[badge] || ''
  }

  return (
    <section id="projects" className="projects">
      <div className="container">
        <div className="projects-header">
          <h2>Sonlandırılan Projeler</h2>
          <p>Müşterilerimizle birlikte gerçekleştirdiğimiz başarılı projeler</p>
        </div>
        <div className="projects-grid">
          {displayProjects.map((project, index) => (
            <div key={project.id || index} className="project-card">
              <div className="project-image">
                <div className="project-icon">
                  <i className={`fas ${project.icon}`}></i>
                </div>
                <div className={`project-badge ${getBadgeClass(project.badge)}`}>{project.badge}</div>
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-features">
                  {project.features.map((feature, fIndex) => (
                    <div key={fIndex} className="feature-item">
                      <i className={`fas ${feature.icon}`}></i>
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
                <div className="project-footer">
                  <div className="project-meta">
                    <span className="meta-item"><i className="fas fa-location-dot"></i> {project.location}</span>
                    <span className="meta-item"><i className="far fa-calendar"></i> {project.year}</span>
                  </div>
                  <div className="project-status">
                    <i className="fas fa-circle-check"></i> Tamamlandı
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
