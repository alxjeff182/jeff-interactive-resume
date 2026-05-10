/** Brief non-blocking toast (photo mode, debug toggle, etc.). */
export function showAppToast(msg, durationMs = 2000) {
  const el = document.getElementById('app-toast')
  if (!el) return
  el.textContent = msg
  el.classList.add('show')
  clearTimeout(showAppToast._t)
  showAppToast._t = setTimeout(() => el.classList.remove('show'), durationMs)
}
