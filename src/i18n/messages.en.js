/** @type {const} */
export const MESSAGES_EN = {
  shell: {
    title: 'Jeffry Alexander G. — Interactive 3D Resume · Senior Frontend Engineer · Jakarta',
    loading: 'Loading 3D experience...',
    hint: 'Click a building for details · Pond (Contact): PDF',
    skipLink: 'Skip to interactive farm',
    skipHref: '#c',
    introAria: 'Introduction',
    canvasAria:
      'Interactive isometric farm: keyboard or on-screen stick to move; tap or click a building for resume details.',
    exitPhotoMode: 'Exit photo mode',
    touchMove: 'Move',
    touchStickAria: 'Drag to walk',
    touchToolbarAria: 'View controls',
    touchActionsAria: 'Interaction actions',
    touchZoomAria: 'Zoom',
    touchActionA: 'Interact with nearest building',
    touchActionB: 'Hold to run (same pace as double-tap run on desktop)',
    touchPhotoAria: 'Toggle photo mode',
    touchPhotoTitle: 'Photo mode',
    touchZoomOut: 'Zoom out',
    touchZoomIn: 'Zoom in',
    mobileControlsAria: 'Touch controls',
    closePanelAria: 'Close resume panel',
    langSwitchToId: 'Switch language to Indonesian',
    langSwitchToEn: 'Switch language to English',
    tourTriggerAria: 'Show guided tour',
    tourTriggerTitle: 'How to use this scene',
  },
  tour: {
    next: 'Next',
    prev: 'Back',
    done: 'Got it',
    stepStickTitle: 'Move',
    stepStickDesc:
      'Drag the stick to walk around the scene — it replaces WASD / arrow keys on desktop.',
    stepZoomTitle: 'Zoom',
    stepZoomDesc:
      'Tap − and + to move the camera in and out. You can also pinch with two fingers on the farm view.',
    stepPhotoTitle: 'Photo mode',
    stepPhotoDesc:
      'Tap the camera to hide the HUD for a clean screenshot. Tap again or use Exit to bring everything back.',
    stepBTitle: 'Run — hold B',
    stepBDesc:
      'Hold B to sprint. Let go to walk again — same idea as double-tap run on keyboard.',
    stepATitle: 'Interact — tap A',
    stepADesc:
      'When you are close enough to a building, tap A to open its resume section. The button is dimmed until you are in range.',
    stepDesktopCanvasTitle: 'Explore',
    stepDesktopCanvasDesc:
      'Use WASD or arrow keys to move. Drag on the farm to orbit the camera. Scroll the mouse wheel to zoom in and out. Double-tap a movement key quickly to sprint. Press F to toggle photo mode (clean HUD). Click a building when you are close enough to open resume details.',
    stepDesktopHintTitle: 'Hints',
    stepDesktopHintDesc:
      'A pill like this may appear with shortcuts. The pond opens a PDF contact card.',
    stepDesktopLangTitle: 'Language',
    stepDesktopLangDesc:
      'Switch between English and Indonesian — all UI labels and the tour update instantly.',
  },
  loading: {
    critical: 'Loading critical 3D assets...',
    farmhouse: 'Loading farmhouse...',
    buildings: 'Loading buildings...',
    character: 'Loading character...',
    finalizing: 'Finalizing scene...',
    preparing: 'Preparing scene...',
  },
  error: {
    title: 'Could not load 3D assets',
    retry: 'Retry',
    suffixRetry: 'Please retry.',
  },
  toast: {
    photoOn: 'Photo mode — clean view',
    photoOff: 'HUD visible',
    sprint: 'Sprint boost activated',
    moveCloser: 'Move closer to a building to interact',
  },
  cv: {
    openBuilding: 'Open',
    pondBadge: 'Contact — PDF',
  },
}
