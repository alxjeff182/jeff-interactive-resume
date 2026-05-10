import { MESSAGES_EN } from '../i18n/messages.en.js'

/** Inject DOM under #app (canvas, HUD, CV panel). */
export function injectAppShell() {
  const app = document.querySelector('#app')
  if (!app) return

  app.innerHTML = `
<a class="skip-link" href="#c">${MESSAGES_EN.shell.skipLink}</a>

<header class="site-shell" aria-label="${MESSAGES_EN.shell.introAria}">
  <p class="site-tagline">
    <span class="site-title-row">
      <strong class="site-title"><span id="site-title-text">${MESSAGES_EN.shell.title}</span></strong>
      <button type="button" id="lang-toggle" class="lang-toggle" aria-label="${MESSAGES_EN.shell.langSwitchToId}">EN</button>
    </span>
    <span class="tagline-desktop">
      <span id="tagline-desktop-text">${MESSAGES_EN.shell.taglineDesktop}</span>
    </span>
    <span class="tagline-touch">
      <span id="tagline-touch-text">${MESSAGES_EN.shell.taglineTouch}</span>
    </span>
  </p>
</header>

<canvas id="c" role="img" aria-label="${MESSAGES_EN.shell.canvasAria}"></canvas>

<div id="app-loading" class="app-loading" role="status" aria-live="polite" aria-busy="true">
  <div class="spinner" aria-hidden="true"></div>
  <p id="app-loading-main">${MESSAGES_EN.shell.loading}</p>
  <p id="app-loading-stage" class="app-loading-stage">${MESSAGES_EN.loading.preparing}</p>
</div>

<div id="load-error" class="load-error" role="alert" hidden>
  <p class="load-error-title">${MESSAGES_EN.error.title}</p>
  <p class="load-error-detail"></p>
  <button type="button" class="load-error-retry">${MESSAGES_EN.error.retry}</button>
</div>

<div id="cv-panel" role="dialog" aria-modal="true" aria-labelledby="cv-panel-title" aria-hidden="true">
  <div id="cv-panel-header">
    <div id="cv-panel-icon" aria-hidden="true"></div>
    <div id="cv-panel-title-group">
      <h2 id="cv-panel-title"></h2>
      <p id="cv-panel-subtitle"></p>
    </div>
    <button type="button" id="cv-panel-close" aria-label="${MESSAGES_EN.shell.closePanelAria}">✕</button>
  </div>
  <div id="cv-panel-body"></div>
</div>

<div id="cv-hint"><span class="cv-hint-icon" aria-hidden="true">🏡</span> <span class="cv-hint-text">${MESSAGES_EN.shell.hint}</span></div>
<div id="interaction-badge" aria-live="polite"></div>

<div id="mobile-controls" class="mobile-controls" aria-label="${MESSAGES_EN.shell.mobileControlsAria}">
  <div class="touch-stick-wrap">
    <span class="touch-stick-label">${MESSAGES_EN.shell.touchMove}</span>
    <div class="touch-stick" id="touch-stick" role="application" aria-label="${MESSAGES_EN.shell.touchStickAria}">
      <span class="touch-stick-base" aria-hidden="true"></span>
      <span class="touch-stick-knob" aria-hidden="true"></span>
    </div>
  </div>
  <div class="touch-actions" role="toolbar" aria-label="${MESSAGES_EN.shell.touchToolbarAria}">
    <div class="touch-main-actions" role="group" aria-label="${MESSAGES_EN.shell.touchActionsAria}">
      <button type="button" class="touch-btn touch-btn-action" id="touch-action-a" aria-label="${MESSAGES_EN.shell.touchActionA}">A</button>
      <button type="button" class="touch-btn touch-btn-action touch-btn-sprint" id="touch-action-b" aria-label="${MESSAGES_EN.shell.touchActionB}">B</button>
    </div>
    <button type="button" class="touch-btn touch-btn-icon" id="touch-photo-mode" aria-label="${MESSAGES_EN.shell.touchPhotoAria}" title="${MESSAGES_EN.shell.touchPhotoTitle}">📷</button>
    <div class="touch-zoom" role="group" aria-label="${MESSAGES_EN.shell.touchZoomAria}">
      <button type="button" class="touch-btn" id="touch-zoom-out" aria-label="${MESSAGES_EN.shell.touchZoomOut}">−</button>
      <button type="button" class="touch-btn" id="touch-zoom-in" aria-label="${MESSAGES_EN.shell.touchZoomIn}">+</button>
    </div>
  </div>
</div>

<button type="button" id="photo-mode-exit" class="photo-exit-btn" aria-label="${MESSAGES_EN.shell.exitPhotoMode}">
  ${MESSAGES_EN.shell.exitPhotoMode}
</button>

<div id="app-toast" role="status" aria-live="polite"></div>
`
}
