import React, { useState, useRef, useEffect } from 'react'

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmM2YzZjMiLz48L3N2Zz4=',
  width,
  height,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [imageRef, setImageRef] = useState()
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let observer
    let didCancel = false

    if (imageRef && imageSrc === placeholder) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (
                !didCancel &&
                (entry.intersectionRatio > 0 || entry.isIntersecting)
              ) {
                setImageSrc(src)
                observer.unobserve(imageRef)
              }
            })
          },
          {
            threshold: 0.01,
            rootMargin: '75px'
          }
        )
        observer.observe(imageRef)
      } else {
        // Fallback for older browsers
        setImageSrc(src)
      }
    }

    return () => {
      didCancel = true
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef)
      }
    }
  }, [imageRef, imageSrc, src, placeholder])

  const handleLoad = () => {
    setLoaded(true)
  }

  const handleError = () => {
    setError(true)
    // Hata durumunda placeholder veya varsayılan bir resim gösterilebilir
  }

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`lazy-image ${className} ${loaded ? 'loaded' : 'loading'} ${error ? 'error' : ''}`}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  )
}

export default LazyImage
