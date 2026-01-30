export const parseDevice = (userAgent) => {
  if (!userAgent) return 'Unknown'

  const ua = userAgent.toLowerCase()

  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    if (/android/i.test(ua)) {
      if (/tablet/i.test(ua)) {
        return 'Android Tablet'
      }
      return 'Android Mobile'
    }
    if (/iphone/i.test(ua)) {
      return 'iPhone'
    }
    if (/ipad/i.test(ua)) {
      return 'iPad'
    }
    return 'Mobile'
  }

  if (/windows/i.test(ua)) {
    return 'Windows PC'
  }
  if (/macintosh|mac os x/i.test(ua)) {
    return 'Mac'
  }
  if (/linux/i.test(ua)) {
    return 'Linux PC'
  }

  return 'Desktop'
}

export const parseBrowser = (userAgent) => {
  if (!userAgent) return 'Unknown'

  const ua = userAgent.toLowerCase()

  if (/edg/i.test(ua)) return 'Edge'
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome'
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari'
  if (/firefox/i.test(ua)) return 'Firefox'
  if (/opera|opr/i.test(ua)) return 'Opera'

  return 'Other'
}

