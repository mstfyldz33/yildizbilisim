import { createContext, useContext, useState, useEffect } from 'react'
import tr from './locales/tr'
import en from './locales/en'

const locales = {
  tr,
  en
}

const I18nContext = createContext()

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    // Fallback to Turkish if context not available
    return {
      t: (key) => {
        const keys = key.split('.')
        let value = tr
        for (const k of keys) {
          value = value?.[k]
        }
        return value || key
      },
      locale: 'tr',
      setLocale: () => {}
    }
  }
  return context
}

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('locale')
    if (saved && locales[saved]) {
      return saved
    }
    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage
    if (browserLang.startsWith('en')) {
      return 'en'
    }
    return 'tr'
  })

  useEffect(() => {
    localStorage.setItem('locale', locale)
    document.documentElement.setAttribute('lang', locale)
  }, [locale])

  const t = (key) => {
    const keys = key.split('.')
    let value = locales[locale]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

