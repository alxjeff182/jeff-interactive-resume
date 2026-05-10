import { state } from '../state.js'
import { MESSAGES_EN } from './messages.en.js'
import { MESSAGES_ID } from './messages.id.js'

/** @typedef {'en' | 'id'} Locale */

/** @param {unknown} v */
function isLocale(v) {
  return v === 'en' || v === 'id'
}

/** @param {Locale} locale */
export function setLocale(locale) {
  if (!isLocale(locale)) return
  state.locale = locale
  document.documentElement.lang = locale === 'id' ? 'id' : 'en'
  window.dispatchEvent(new globalThis.CustomEvent('localechange', { detail: { locale } }))
}

/** @returns {Locale} */
export function getLocale() {
  return state.locale
}

/** @returns {typeof MESSAGES_EN} */
export function getMessages() {
  return state.locale === 'id' ? MESSAGES_ID : MESSAGES_EN
}

export function applyUiLocale() {
  const m = getMessages()

  const titleEl = document.getElementById('site-title-text')
  if (titleEl) titleEl.textContent = m.shell.title

  const desktop = document.getElementById('tagline-desktop-text')
  if (desktop) desktop.textContent = m.shell.taglineDesktop

  const touch = document.getElementById('tagline-touch-text')
  if (touch) touch.textContent = m.shell.taglineTouch

  const loadingMain = document.getElementById('app-loading-main')
  if (loadingMain) loadingMain.textContent = m.shell.loading

  const skip = document.querySelector('.skip-link')
  if (skip) {
    skip.textContent = m.shell.skipLink
    skip.setAttribute('href', m.shell.skipHref || '#c')
  }

  const introHeader = document.querySelector('.site-shell')
  if (introHeader) introHeader.setAttribute('aria-label', m.shell.introAria)

  const canvas = document.getElementById('c')
  if (canvas) canvas.setAttribute('aria-label', m.shell.canvasAria)

  const loadErrTitle = document.querySelector('.load-error-title')
  if (loadErrTitle) loadErrTitle.textContent = m.error.title

  const retryBtn = document.querySelector('.load-error-retry')
  if (retryBtn) retryBtn.textContent = m.error.retry

  const cvHint = document.querySelector('#cv-hint .cv-hint-text')
  if (cvHint) cvHint.textContent = m.shell.hint

  const photoExit = document.getElementById('photo-mode-exit')
  if (photoExit) photoExit.textContent = m.shell.exitPhotoMode

  const stickLabel = document.querySelector('.touch-stick-label')
  if (stickLabel) stickLabel.textContent = m.shell.touchMove

  const stickAria = document.getElementById('touch-stick')
  if (stickAria) stickAria.setAttribute('aria-label', m.shell.touchStickAria)

  const touchToolbar = document.querySelector('.touch-actions[aria-label]')
  if (touchToolbar) touchToolbar.setAttribute('aria-label', m.shell.touchToolbarAria)

  const touchGroup = document.querySelector('.touch-face-diamond[aria-label]')
  if (touchGroup) touchGroup.setAttribute('aria-label', m.shell.touchActionsAria)

  const touchZoom = document.querySelector('.touch-diamond-zoom[aria-label]')
  if (touchZoom) touchZoom.setAttribute('aria-label', m.shell.touchZoomAria)

  const btnA = document.getElementById('touch-action-a')
  if (btnA) btnA.setAttribute('aria-label', m.shell.touchActionA)

  const btnB = document.getElementById('touch-action-b')
  if (btnB) btnB.setAttribute('aria-label', m.shell.touchActionB)

  const btnPhoto = document.getElementById('touch-photo-mode')
  if (btnPhoto) {
    btnPhoto.setAttribute('aria-label', m.shell.touchPhotoAria)
    btnPhoto.setAttribute('title', m.shell.touchPhotoTitle)
  }

  const zoomOut = document.getElementById('touch-zoom-out')
  if (zoomOut) zoomOut.setAttribute('aria-label', m.shell.touchZoomOut)

  const zoomIn = document.getElementById('touch-zoom-in')
  if (zoomIn) zoomIn.setAttribute('aria-label', m.shell.touchZoomIn)

  const mobileWrap = document.getElementById('mobile-controls')
  if (mobileWrap) mobileWrap.setAttribute('aria-label', m.shell.mobileControlsAria)

  const closeBtn = document.getElementById('cv-panel-close')
  if (closeBtn) closeBtn.setAttribute('aria-label', m.shell.closePanelAria)

  const langToggle = document.getElementById('lang-toggle')
  if (langToggle) {
    // Show active locale on the button; tooltip describes the language you'll switch to.
    langToggle.textContent = state.locale === 'id' ? 'ID' : 'EN'
    langToggle.setAttribute('title', state.locale === 'id' ? m.shell.langSwitchToEn : m.shell.langSwitchToId)
    langToggle.setAttribute('aria-label', state.locale === 'id' ? m.shell.langSwitchToEn : m.shell.langSwitchToId)
  }
}
