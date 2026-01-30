import React from 'react'
import { useI18n } from '../i18n'

const LanguageSwitcher = () => {
  const { locale, setLocale } = useI18n()

  const toggleLanguage = () => {
    setLocale(locale === 'tr' ? 'en' : 'tr')
  }

  return (
    <button
      className="language-switcher"
      onClick={toggleLanguage}
      aria-label={locale === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
      title={locale === 'tr' ? 'English' : 'Türkçe'}
    >
      {locale === 'tr' ? (
        <>
          <i className="fas fa-globe"></i>
          <span>EN</span>
        </>
      ) : (
        <>
          <i className="fas fa-globe"></i>
          <span>TR</span>
        </>
      )}
    </button>
  )
}

export default LanguageSwitcher

