import { db } from '../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const getIPAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Error getting IP address:', error)
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (err) {
      console.error('Error getting IP from fallback service:', err)
      return 'unknown'
    }
  }
}

const getBrowserInfo = () => {
  const ua = navigator.userAgent
  
  return {
    userAgent: ua,
    language: navigator.language || navigator.userLanguage,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    referrer: document.referrer || 'direct',
    timestamp: new Date().toISOString()
  }
}

export const logVisit = async (page = '/', additionalData = {}) => {
  try {
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (cookieConsent !== 'accepted') {
      return
    }

    const ipAddress = await getIPAddress()
    const browserInfo = getBrowserInfo()
    
    const visitData = {
      ip_address: ipAddress,
      page: page,
      user_agent: browserInfo.userAgent,
      language: browserInfo.language,
      platform: browserInfo.platform,
      screen_width: browserInfo.screenWidth,
      screen_height: browserInfo.screenHeight,
      viewport_width: browserInfo.viewportWidth,
      viewport_height: browserInfo.viewportHeight,
      referrer: browserInfo.referrer,
      created_at: serverTimestamp(),
      ...additionalData
    }

    await addDoc(collection(db, 'visit_logs'), visitData)
  } catch (error) {
    console.error('Error in logVisit:', error)
  }
}

export const logPageView = (page) => {
  logVisit(page, {
    event_type: 'page_view'
  })
}

export const logEvent = (eventType, eventData = {}) => {
  logVisit(window.location.pathname, {
    event_type: eventType,
    ...eventData
  })
}

