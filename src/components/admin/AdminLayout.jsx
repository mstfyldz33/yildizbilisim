import React, { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/admin-common.css'
import './AdminLayout.css'

const AdminLayout = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      navigate('/admin/login')
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  return (
    <div className="admin-layout">
      <button 
        className="admin-sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Menüyü Aç/Kapat"
        aria-expanded={sidebarOpen}
      >
        <span className={`hamburger-line ${sidebarOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${sidebarOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${sidebarOpen ? 'active' : ''}`}></span>
      </button>
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={closeSidebar}></div>
      )}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <i className="fas fa-shield-halved"></i>
            <span>Admin Panel</span>
          </div>
          <div className="admin-user-info">
            <i className="fas fa-user-circle"></i>
            <span>{user?.email || 'Admin'}</span>
          </div>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" end className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/blog" className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-newspaper"></i>
            <span>Blog Yönetimi</span>
          </NavLink>
          <NavLink to="/admin/projects" className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-project-diagram"></i>
            <span>Proje Yönetimi</span>
          </NavLink>
          <NavLink to="/admin/testimonials" className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-comments"></i>
            <span>Müşteri Yorumları</span>
          </NavLink>
          <NavLink to="/admin/messages" className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-envelope"></i>
            <span>İletişim Mesajları</span>
          </NavLink>
          <NavLink to="/admin/applications" className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-briefcase"></i>
            <span>İş Başvuruları</span>
          </NavLink>
          <NavLink to="/admin/gallery" className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-images"></i>
            <span>Galeri Yönetimi</span>
          </NavLink>
          <NavLink to="/admin/project-images" className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-camera"></i>
            <span>Proje Görselleri</span>
          </NavLink>
          <NavLink to="/admin/slider" className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-sliders"></i>
            <span>Slider Yönetimi</span>
          </NavLink>
          <NavLink to="/admin/services" className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-concierge-bell"></i>
            <span>Hizmetler (Bireysel)</span>
          </NavLink>
          <NavLink to="/admin/package-comparison" className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-table"></i>
            <span>Paket Karşılaştırma</span>
          </NavLink>
          <NavLink to="/admin/visit-logs" className={({ isActive }) => 'admin-nav-item' + (isActive ? ' active' : '')} onClick={closeSidebar}>
            <i className="fas fa-chart-line"></i>
            <span>Ziyaret Logları & IP Takibi</span>
          </NavLink>
          <Link to="/" className="admin-nav-item" onClick={closeSidebar}>
            <i className="fas fa-home"></i>
            <span>Ana Siteye Dön</span>
          </Link>
          <button onClick={handleLogout} className="admin-nav-item admin-logout-btn">
            <i className="fas fa-right-from-bracket"></i>
            <span>Çıkış Yap</span>
          </button>
        </nav>
      </aside>
      <main className="admin-main" onClick={() => window.innerWidth <= 768 && closeSidebar()}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout

