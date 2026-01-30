// Google Analytics utility
// Google Analytics ID'yi environment variable'dan al veya buraya ekle
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || ''

// Google Analytics script yükleme
export const initGA = () => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return

  // Script zaten yüklenmişse tekrar yükleme
  if (window.gtag) return

  // Google Analytics script'ini ekle
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script1)

  // gtag config script'ini ekle
  const script2 = document.createElement('script')
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
      page_path: window.location.pathname,
      send_page_view: false
    });
  `
  document.head.appendChild(script2)
}

// Page view tracking
export const trackPageView = (path) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: document.title
  })
}

// Event tracking
export const trackEvent = (action, category, label, value) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  })
}

// Custom event tracking
export const trackCustomEvent = (eventName, parameters = {}) => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', eventName, parameters)
}

// Form submission tracking
export const trackFormSubmission = (formName) => {
  trackEvent('form_submit', 'engagement', formName)
}

// Button click tracking
export const trackButtonClick = (buttonName, location) => {
  trackEvent('click', 'button', buttonName, undefined)
  trackCustomEvent('button_click', {
    button_name: buttonName,
    location: location
  })
}

// Link click tracking
export const trackLinkClick = (linkText, linkUrl) => {
  trackEvent('click', 'link', linkText)
  trackCustomEvent('link_click', {
    link_text: linkText,
    link_url: linkUrl
  })
}

// Scroll tracking
export const trackScroll = (percent) => {
  if (percent === 25 || percent === 50 || percent === 75 || percent === 100) {
    trackEvent('scroll', 'engagement', `${percent}%`)
  }
}

// Time on page tracking
export const trackTimeOnPage = (seconds) => {
  trackCustomEvent('time_on_page', {
    time_seconds: seconds
  })
}

