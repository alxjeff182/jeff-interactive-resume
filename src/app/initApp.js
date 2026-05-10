import { loadModels } from '../models/loadModels.js'
import { setupGround, setupLights, initScene } from '../scene.js'
import { applyUiLocale, setLocale } from '../i18n/locale.js'
import { state } from '../state.js'
import { resize, render } from '../game/render.js'
import { bindLoadErrorRetry } from '../ui/loading.js'
import { cvOpenPanel } from '../ui/cvPanel.js'
import { injectAppShell } from '../ui/shell.js'
import { configurePerfTelemetry } from '../perf/metrics.js'

function scheduleDeferredInit(task) {
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => task(), { timeout: 250 })
    return
  }
  setTimeout(task, 0)
}

export function initApp() {
  state.locale = 'en'
  document.documentElement.lang = 'en'

  injectAppShell()
  applyUiLocale()

  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    const next = state.locale === 'id' ? 'en' : 'id'
    setLocale(next)
    applyUiLocale()
    const open = state.cv.focusLabel
    if (open) cvOpenPanel(open, null)
  })

  const canvas = /** @type {HTMLCanvasElement | null} */ (document.getElementById('c'))
  if (!canvas) throw new Error('Canvas #c is missing.')

  const { renderer, scene, camera } = initScene(canvas)
  state.renderer = renderer
  state.scene = scene
  state.camera = camera
  state.render.quality.maxPixelRatio = Math.min(window.devicePixelRatio, 2)
  state.render.quality.currentPixelRatio = state.render.quality.maxPixelRatio
  renderer.setPixelRatio(state.render.quality.currentPixelRatio)
  configurePerfTelemetry({ intervalMs: 5000 })

  const cleanupFns = []
  let disposed = false

  setupLights(scene)
  setupGround(scene, renderer)
  loadModels(scene)

  scheduleDeferredInit(async () => {
    if (disposed) return
    const [
      inputModule,
      interactionModule,
      cvPanelModule,
      mobileControlsModule,
    ] = await Promise.all([
      import('../game/input.js'),
      import('../game/interaction.js'),
      import('../ui/cvPanel.js'),
      import('../ui/mobileControls.js'),
    ])
    if (disposed) return

    cleanupFns.push(inputModule.setupKeyboardInput(canvas))
    cleanupFns.push(inputModule.setupMouseCameraControls(canvas))
    cleanupFns.push(interactionModule.setupInteraction(canvas))
    cvPanelModule.setupCV(canvas)

    const mobileCleanup = mobileControlsModule.setupMobileControls(canvas)
    if (typeof mobileCleanup === 'function') cleanupFns.push(mobileCleanup)
  })

  const onResize = () => resize()
  window.addEventListener('resize', onResize, { passive: true })
  cleanupFns.push(() => window.removeEventListener('resize', onResize))

  const unbindRetry = bindLoadErrorRetry(() => {
    window.location.reload()
  })
  cleanupFns.push(unbindRetry)

  let rafId = 0
  let lastFrameAt = performance.now()

  const tick = (now) => {
    if (disposed) return

    const targetFps = document.hidden
      ? state.render.hiddenFps
      : (state.render.needsFrame ? state.render.activeFps : state.render.idleFps)
    const minFrameMs = 1000 / Math.max(targetFps, 1)
    if (now - lastFrameAt >= minFrameMs) {
      render()
      lastFrameAt = now
    }

    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  const onVisibilityChange = () => {
    // Force one frame immediately after tab returns to sync camera and UI state.
    state.render.needsFrame = true
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
  cleanupFns.push(() => document.removeEventListener('visibilitychange', onVisibilityChange))

  return {
    destroy() {
      disposed = true
      cancelAnimationFrame(rafId)
      cleanupFns.forEach((fn) => {
        if (typeof fn === 'function') fn()
      })
      renderer.dispose()
    },
  }
}
