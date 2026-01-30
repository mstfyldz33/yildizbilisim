import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'

/**
 * /search?q=... - Google SearchAction schema ile uyumlu.
 * Sayfa açıldığında arama modalını açar ve sorguyu doldurur.
 */
const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''

  useEffect(() => {
    if (q.trim()) {
      window.dispatchEvent(new CustomEvent('openSearch', { detail: { query: q.trim() } }))
    }
  }, [q])

  return (
    <Layout
      seo={{
        title: q ? `"${q}" arama - Yıldız Bilişim` : 'Arama - Yıldız Bilişim',
        description: q
          ? `Yıldız Bilişim sitede "${q}" arama sonuçları. Güvenlik kamera sistemleri, blog ve projeler.`
          : 'Yıldız Bilişim web sitesinde arama yapın. Güvenlik kamera sistemleri, hizmetler ve projeler.'
      }}
    >
      <section className="search-page">
        <div className="container">
          <div className="search-page-content">
            <h1>Arama</h1>
            {q ? (
              <p>
                <strong>&quot;{q}&quot;</strong> için arama sonuçları yukarıdaki arama kutusunda gösterilir.
                Arama kutusu açılmadıysa sayfayı yenileyin veya üstteki arama ikonuna tıklayın.
              </p>
            ) : (
              <p>Aramak için üstteki arama ikonuna tıklayın veya adres çubuğuna <code>/search?q=aranacak_kelime</code> yazın.</p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default SearchPage
