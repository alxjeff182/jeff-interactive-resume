import { getMessages } from '../i18n/locale.js'
import { state } from '../state.js'

export function beginCriticalLoad() {
  state.load.criticalPending += 1
  setLoadingStage(getMessages().loading.critical)
}

export function endCriticalLoad() {
  state.load.criticalPending = Math.max(0, state.load.criticalPending - 1)
  if (state.load.criticalPending === 0) {
    markSceneReady()
  }
}

function markSceneReady() {
  if (state.load.sceneReady) return
  state.load.sceneReady = true
  const el = document.getElementById('app-loading')
  if (el) {
    el.classList.add('hidden')
    el.setAttribute('aria-busy', 'false')
  }
}

/**
 * @param {string} text
 */
export function setLoadingStage(text) {
  const stage = document.getElementById('app-loading-stage')
  if (stage) stage.textContent = text
}

/**
 * @param {string} message
 * @param {Error | null} [err]
 */
export function showLoadError(message, err) {
  const wrap = document.getElementById('load-error')
  const detail = wrap?.querySelector('.load-error-detail')
  const suffix = getMessages().error.suffixRetry
  if (detail) {
    detail.textContent = err ? `${message} ${suffix} (${err.message})` : `${message} ${suffix}`
  }
  if (wrap) {
    wrap.hidden = false
  }
  const loading = document.getElementById('app-loading')
  if (loading) {
    loading.classList.add('hidden')
    loading.setAttribute('aria-busy', 'false')
  }
}

export function bindLoadErrorRetry(onRetry) {
  const btn = document.querySelector('.load-error-retry')
  if (btn) btn.addEventListener('click', onRetry)
  return () => {
    if (btn) btn.removeEventListener('click', onRetry)
  }
}
