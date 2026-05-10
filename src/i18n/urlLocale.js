import { state } from '../state.js'

/** @typedef {'en' | 'id'} Locale */

/**
 * @param {string} pathname
 * @returns {Locale | null} First path segment if en/id.
 */
export function localeFromPathname(pathname) {
  const seg = pathname.split('/').filter(Boolean)[0]
  if (seg === 'en' || seg === 'id') return seg
  return null
}

/**
 * Normalize `/` or unknown paths to `/en`; strip extra segments after `/en/...`.
 * @returns {Locale}
 */
export function getInitialLocaleFromUrl() {
  const { origin, pathname, search, hash } = window.location
  const found = localeFromPathname(pathname)
  if (found) {
    const canonical = `/${found}`
    const normalizedPath = pathname.replace(/\/+$/, '') || '/'
    if (normalizedPath !== canonical) {
      window.history.replaceState(null, '', `${origin}${canonical}${search}${hash}`)
    }
    return found
  }
  window.history.replaceState(null, '', `${origin}/en${search}${hash}`)
  return 'en'
}

/**
 * @param {Locale} locale
 */
export function pushLocaleToUrl(locale) {
  const { origin, search, hash } = window.location
  window.history.pushState({ jeffLocale: locale }, '', `${origin}/${locale}${search}${hash}`)
}

/**
 * @param {Locale} locale
 * @param {string} [pageTitle] document.title from current messages
 */
export function syncDocumentSeo(locale, pageTitle) {
  document.documentElement.lang = locale === 'id' ? 'id' : 'en'

  const pageUrl = `${window.location.origin}/${locale}`
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', pageUrl)
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', pageUrl)
  document.querySelector('meta[name="twitter:url"]')?.setAttribute('content', pageUrl)
  document
    .querySelector('meta[property="og:locale"]')
    ?.setAttribute('content', locale === 'id' ? 'id_ID' : 'en_US')

  if (pageTitle) document.title = pageTitle
}

/**
 * @param {(detail: { locale: Locale }) => void} onLocaleFromBrowser
 * @returns {() => void}
 */
export function installLocaleHistory(onLocaleFromBrowser) {
  const handler = () => {
    const { origin, pathname, search, hash } = window.location
    let loc = localeFromPathname(pathname)
    if (!loc) {
      window.history.replaceState(null, '', `${origin}/en${search}${hash}`)
      loc = 'en'
    } else {
      const canonical = `/${loc}`
      const normalizedPath = pathname.replace(/\/+$/, '') || '/'
      if (normalizedPath !== canonical) {
        window.history.replaceState(null, '', `${origin}${canonical}${search}${hash}`)
      }
    }
    if (loc !== state.locale) {
      onLocaleFromBrowser({ locale: loc })
    }
  }
  window.addEventListener('popstate', handler)
  return () => window.removeEventListener('popstate', handler)
}
