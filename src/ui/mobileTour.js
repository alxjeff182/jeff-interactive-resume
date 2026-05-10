import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { getMessages } from '../i18n/locale.js'

/** @deprecated kept for one-time migration from single-key storage */
const LEGACY_STORAGE_KEY = 'jeff_mobile_tour_done'
const STORAGE_TOUCH = 'jeff_scene_tour_touch_done'
const STORAGE_DESKTOP = 'jeff_scene_tour_desktop_done'

function mobileControlsVisible() {
  const el = document.getElementById('mobile-controls')
  if (!el) return false
  return getComputedStyle(el).display !== 'none'
}

function touchTourComplete() {
  return Boolean(
    localStorage.getItem(STORAGE_TOUCH) || localStorage.getItem(LEGACY_STORAGE_KEY),
  )
}

function desktopTourComplete() {
  return Boolean(localStorage.getItem(STORAGE_DESKTOP))
}

function buildTouchSteps() {
  const t = getMessages().tour
  return [
    {
      element: '#touch-stick',
      popover: {
        title: t.stepStickTitle,
        description: t.stepStickDesc,
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#touch-zoom-group',
      popover: {
        title: t.stepZoomTitle,
        description: t.stepZoomDesc,
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#touch-photo-mode',
      popover: {
        title: t.stepPhotoTitle,
        description: t.stepPhotoDesc,
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#touch-action-b',
      popover: {
        title: t.stepBTitle,
        description: t.stepBDesc,
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#touch-action-a',
      popover: {
        title: t.stepATitle,
        description: t.stepADesc,
        side: 'top',
        align: 'center',
      },
    },
  ]
}

function buildDesktopSteps() {
  const t = getMessages().tour
  return [
    {
      element: '#c',
      popover: {
        title: t.stepDesktopCanvasTitle,
        description: t.stepDesktopCanvasDesc,
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '#cv-hint',
      popover: {
        title: t.stepDesktopHintTitle,
        description: t.stepDesktopHintDesc,
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#lang-toggle',
      popover: {
        title: t.stepDesktopLangTitle,
        description: t.stepDesktopLangDesc,
        side: 'bottom',
        align: 'end',
      },
    },
  ]
}

/**
 * Guided tour (driver.js): touch controls when on-screen controls are visible,
 * otherwise keyboard / mouse hints for desktop.
 * @returns {() => void}
 */
export function setupMobileTour() {
  /** @type {import('driver.js').Driver | null} */
  let active = null

  const startTour = () => {
    const touch = mobileControlsVisible()
    const storageKey = touch ? STORAGE_TOUCH : STORAGE_DESKTOP

    active?.destroy()

    const m = getMessages().tour
    const driverObj = driver({
      showProgress: true,
      nextBtnText: m.next,
      prevBtnText: m.prev,
      doneBtnText: m.done,
      steps: touch ? buildTouchSteps() : buildDesktopSteps(),
      onDestroyed: () => {
        localStorage.setItem(storageKey, 'true')
        active = null
      },
    })

    active = driverObj
    driverObj.drive()
  }

  const onSceneReady = () => {
    const touch = mobileControlsVisible()
    if (touch) {
      if (touchTourComplete()) return
    } else if (desktopTourComplete()) {
      return
    }
    window.setTimeout(() => startTour(), 900)
  }

  const onStartTour = () => startTour()

  window.addEventListener('scene-ready', onSceneReady)
  window.addEventListener('start-mobile-tour', onStartTour)
  window.addEventListener('start-scene-tour', onStartTour)

  const trigger = document.getElementById('mobile-tour-trigger')
  trigger?.addEventListener('click', onStartTour)

  return () => {
    window.removeEventListener('scene-ready', onSceneReady)
    window.removeEventListener('start-mobile-tour', onStartTour)
    window.removeEventListener('start-scene-tour', onStartTour)
    trigger?.removeEventListener('click', onStartTour)
    active?.destroy()
  }
}
