import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { logPageView } from '../utils/visitLogger'
import { initGA, trackPageView } from '../utils/analytics'

export const useVisitLogger = () => {
  const location = useLocation()

  useEffect(() => {
    // Initialize Google Analytics on first load
    initGA()
    
    const page = location.pathname + location.search
    
    const timer = setTimeout(() => {
      // Firebase visit logging
      logPageView(page)
      // Google Analytics page view tracking
      trackPageView(page)
    }, 500)

    return () => clearTimeout(timer)
  }, [location])
}

