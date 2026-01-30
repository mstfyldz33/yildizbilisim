import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { I18nProvider } from './i18n/index.jsx'
import { useVisitLogger } from './hooks/useVisitLogger'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminLogin from './components/admin/AdminLogin'
import { ToastProvider } from './components/Toast'

// Loading component
const LoadingFallback = () => (
  <div className="admin-loading" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--color-primary)' }}></i>
  </div>
)

import Layout from './components/Layout'
import HeroSlider from './components/HeroSlider'
import ServicesComparison from './components/ServicesComparison'
import Certificates from './components/Certificates'
import Blog from './components/Blog'
import Testimonials from './components/Testimonials'
import Careers from './components/Careers'

// Lazy load pages for better performance
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const BrandsPage = lazy(() => import('./pages/BrandsPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const FAQPage = lazy(() => import('./pages/FAQPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const KVKKPage = lazy(() => import('./pages/KVKKPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'))
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'))
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'))
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'))
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'))
const AdminProjectImages = lazy(() => import('./pages/admin/AdminProjectImages'))
const AdminSlider = lazy(() => import('./pages/admin/AdminSlider'))
const AdminServices = lazy(() => import('./pages/admin/AdminServices'))
const AdminPackageComparison = lazy(() => import('./pages/admin/AdminPackageComparison'))
const AdminVisitLogs = lazy(() => import('./pages/admin/AdminVisitLogs'))

function HomePage() {
  return (
    <Layout>
      <HeroSlider />
      <ServicesComparison />
      <Certificates />
      <Blog />
      <Testimonials />
      <Careers />
    </Layout>
  )
}

function AppRouter() {
  useVisitLogger()

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/about" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <AboutPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/services" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <ServicesPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/brands" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <BrandsPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <ProjectsPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/testimonials" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <TestimonialsPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/gallery" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <GalleryPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/faq" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <FAQPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/blog" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <BlogPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/blog/:id" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <BlogDetailPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/map" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <MapPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/contact" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <ContactPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/search" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <SearchPage />
            </Suspense>
          </Layout>
        } 
      />
      <Route 
        path="/kvkk" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <KVKKPage />
            </Suspense>
          </Layout>
        }
      />
      <Route 
        path="/privacy" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <PrivacyPage />
            </Suspense>
          </Layout>
        }
      />
      <Route 
        path="/cookie-policy" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <CookiePolicyPage />
            </Suspense>
          </Layout>
        }
      />
      <Route 
        path="/terms" 
        element={
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <TermsPage />
            </Suspense>
          </Layout>
        }
      />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>} />
        <Route path="dashboard" element={<Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>} />
        <Route path="blog" element={<Suspense fallback={<LoadingFallback />}><AdminBlog /></Suspense>} />
        <Route path="projects" element={<Suspense fallback={<LoadingFallback />}><AdminProjects /></Suspense>} />
        <Route path="testimonials" element={<Suspense fallback={<LoadingFallback />}><AdminTestimonials /></Suspense>} />
        <Route path="messages" element={<Suspense fallback={<LoadingFallback />}><AdminMessages /></Suspense>} />
        <Route path="applications" element={<Suspense fallback={<LoadingFallback />}><AdminApplications /></Suspense>} />
        <Route path="gallery" element={<Suspense fallback={<LoadingFallback />}><AdminGallery /></Suspense>} />
        <Route path="project-images" element={<Suspense fallback={<LoadingFallback />}><AdminProjectImages /></Suspense>} />
        <Route path="slider" element={<Suspense fallback={<LoadingFallback />}><AdminSlider /></Suspense>} />
        <Route path="services" element={<Suspense fallback={<LoadingFallback />}><AdminServices /></Suspense>} />
        <Route path="package-comparison" element={<Suspense fallback={<LoadingFallback />}><AdminPackageComparison /></Suspense>} />
        <Route path="visit-logs" element={<Suspense fallback={<LoadingFallback />}><AdminVisitLogs /></Suspense>} />
      </Route>
      <Route path="*" element={
        <Suspense fallback={<LoadingFallback />}>
          <NotFoundPage />
        </Suspense>
      } />
    </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppRouter />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  )
}

export default App
