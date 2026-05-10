import * as THREE from 'three'
import { getMessages } from '../i18n/locale.js'
import { getResumeData } from '../resumeData.js'
import { state } from '../state.js'
import { resetTouchStick } from './mobileControls.js'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

function isVisible(el) {
  if (!(el instanceof HTMLElement)) return false
  return Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
}

export function getRootEditable(hitObj) {
  for (const ed of state.editables) {
    let cur = hitObj
    while (cur) {
      if (cur === ed) return ed
      cur = cur.parent
    }
  }
  return null
}

export function cvHighlightOn(obj, accentHex) {
  if (!obj) return
  const color = new THREE.Color(accentHex || '#00ffcc')
  obj.traverse((child) => {
    if (!child.isMesh) return
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach((mat) => {
      if (!mat || !('emissive' in mat)) return
      if (!state.cv.hoveredEmissive.has(mat)) {
        state.cv.hoveredEmissive.set(mat, {
          color: mat.emissive.clone(),
          intensity: mat.emissiveIntensity ?? 0,
        })
      }
      mat.emissive.copy(color)
      mat.emissiveIntensity = 0.45
    })
  })
}

export function cvHighlightOff(obj) {
  if (!obj) return
  obj.traverse((child) => {
    if (!child.isMesh) return
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach((mat) => {
      if (!mat || !('emissive' in mat)) return
      const saved = state.cv.hoveredEmissive.get(mat)
      if (saved) {
        mat.emissive.copy(saved.color)
        mat.emissiveIntensity = saved.intensity
      }
    })
  })
  state.cv.hoveredEmissive.clear()
}

function removeFocusTrap() {
  if (state.cv.focusTrapHandler) {
    document.removeEventListener('keydown', state.cv.focusTrapHandler, true)
    state.cv.focusTrapHandler = null
  }
}

/** @param {HTMLElement} panel */
function attachFocusTrap(panel) {
  removeFocusTrap()

  state.cv.focusTrapHandler = (e) => {
    if (!state.cv.focusLabel) return

    if (e.key === 'Escape') {
      e.preventDefault()
      cvClosePanel()
      return
    }

    if (e.key !== 'Tab') return

    const nodes = /** @type {HTMLElement[]} */ (
      Array.from(panel.querySelectorAll(FOCUSABLE)).filter(isVisible)
    )
    if (nodes.length === 0) return

    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const active = document.activeElement

    if (e.shiftKey) {
      if (active === first || !panel.contains(active)) {
        e.preventDefault()
        last.focus()
      }
    } else if (active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  document.addEventListener('keydown', state.cv.focusTrapHandler, true)
}

/** @param {string | undefined} editorLabel */
function interactionBadgeText(editorLabel) {
  const m = getMessages().cv
  if (editorLabel === 'Pond') return m.pondBadge
  return `${m.openBuilding}: ${editorLabel}`
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderProjectBodyWithChips(text) {
  const lines = text.split('\n')
  const projects = []
  let currentProject = null
  const fallbackParagraphs = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('- ')) {
      const projectLine = line.slice(2)
      const parts = projectLine.split(' - ')
      const description = parts.length > 1 ? parts.at(-1) : ''
      const title = parts.length > 1 ? parts.slice(0, -1).join(' - ') : projectLine
      currentProject = {
        title: title.trim(),
        description: (description || '').trim(),
        stack: [],
        uiKits: [],
      }
      projects.push(currentProject)
      continue
    }

    if (line.startsWith('Stack:') && currentProject) {
      currentProject.stack = line
        .slice('Stack:'.length)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      continue
    }

    if (line.startsWith('UI Kit:') && currentProject) {
      currentProject.uiKits = line
        .slice('UI Kit:'.length)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      continue
    }

    fallbackParagraphs.push(rawLine)
  }

  if (!projects.length) {
    return fallbackParagraphs.map((item) => `<p class="cv-section-body">${escapeHtml(item)}</p>`).join('')
  }

  return `<div class="cv-project-list">${
    projects.map((project, index) => {
      const stackHtml = project.stack.length
        ? `<div class="cv-inline-meta"><span class="cv-inline-label">Stack</span><div class="cv-tags">${
            project.stack.map((item) => `<span class="cv-tag">${escapeHtml(item)}</span>`).join('')
          }</div></div>`
        : ''
      const uiHtml = project.uiKits.length
        ? `<div class="cv-inline-meta"><span class="cv-inline-label">UI Kit</span><div class="cv-tags">${
            project.uiKits.map((item) => `<span class="cv-tag">${escapeHtml(item)}</span>`).join('')
          }</div></div>`
        : ''

      return `<details class="cv-project-card"${index === 0 ? ' open' : ''}>
        <summary class="cv-project-summary">
          <span class="cv-project-title">${escapeHtml(project.title)}</span>
          <span class="cv-project-toggle" aria-hidden="true">+</span>
        </summary>
        <div class="cv-project-content">
          ${project.description ? `<p class="cv-project-desc">${escapeHtml(project.description)}</p>` : ''}
          ${stackHtml}
          ${uiHtml}
        </div>
      </details>`
    }).join('')
  }</div>`
}

function renderEmploymentSection(sec, index) {
  const lines = (sec.body || '').split('\n')
  const dateLine = (lines.find((line) => line.trim()) || '').trim()
  const bulletLines = lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
    .filter(Boolean)

  const summaryLines = lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('- ') && line !== dateLine)

  const bulletsHtml = bulletLines.length
    ? `<ul class="cv-employment-points">${
        bulletLines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')
      }</ul>`
    : ''
  const summaryHtml = summaryLines.length
    ? `<p class="cv-employment-summary">${escapeHtml(summaryLines.join(' · '))}</p>`
    : ''
  const tagsHtml = (sec.tags && sec.tags.length)
    ? `<div class="cv-tags">${sec.tags.map((t) => `<span class="cv-tag">${escapeHtml(t)}</span>`).join('')}</div>`
    : ''

  return `<details class="cv-employment-card"${index === 0 ? ' open' : ''}>
    <summary class="cv-employment-summary-head">
      <span class="cv-employment-role">${escapeHtml(sec.heading || 'Experience')}</span>
      <span class="cv-project-toggle" aria-hidden="true">+</span>
    </summary>
    <div class="cv-employment-content">
      ${dateLine ? `<p class="cv-employment-date">${escapeHtml(dateLine)}</p>` : ''}
      ${summaryHtml}
      ${bulletsHtml}
      ${tagsHtml}
    </div>
  </details>`
}

export function cvOpenPanel(label, obj) {
  const resume = getResumeData(state.locale)
  if (!Object.hasOwn(resume, label)) return
  const data = resume[/** @type {keyof typeof resume} */ (label)]
  if (!data) return

  state.cv.lastFocusEl = /** @type {HTMLElement | null} */ (document.activeElement)

  state.cv.focusLabel = label

  if (obj) {
    const box = new THREE.Box3().setFromObject(obj)
    box.getCenter(state.cv.focusPoint)
    state.cv.isFocusing = true
  }

  const panel = document.getElementById('cv-panel')
  if (!panel) return
  document.body.classList.add('cv-open')
  panel.style.setProperty('--cv-accent', data.accent)
  panel.setAttribute('aria-hidden', 'false')

  const elIcon = document.getElementById('cv-panel-icon')
  const elTitle = document.getElementById('cv-panel-title')
  const elSubtitle = document.getElementById('cv-panel-subtitle')
  if (elIcon) elIcon.textContent = data.icon
  if (elTitle) elTitle.textContent = data.title
  if (elSubtitle) elSubtitle.textContent = data.subtitle

  const body = document.getElementById('cv-panel-body')
  if (body) {
    body.innerHTML = data.sections.map((sec, index) => {
      if (label === 'Barn') {
        return renderEmploymentSection(sec, index)
      }

      const headingHtml = sec.heading
        ? `<div class="cv-section-heading">${sec.heading}</div>`
        : ''
      const bodyHtml = sec.body
        ? (label === 'Coop'
            ? renderProjectBodyWithChips(sec.body)
            : `<p class="cv-section-body">${escapeHtml(sec.body)}</p>`)
        : ''
      const tagsHtml = (sec.tags && sec.tags.length)
        ? `<div class="cv-tags">${sec.tags.map((t) => `<span class="cv-tag">${t}</span>`).join('')}</div>`
        : ''
      return `<div class="cv-section">${headingHtml}${bodyHtml}${tagsHtml}</div>`
    }).join('')

    if (data.links && data.links.length) {
      body.innerHTML += `<div class="cv-links">${
        data.links.map((l) => {
          const href = escapeHtml(l.url)
          const tabAttr = l.download ? '' : ' target="_blank" rel="noopener"'
          const dlAttr = l.download ? ` download="${escapeHtml(l.download)}"` : ''
          return `<a class="cv-link-btn" href="${href}"${dlAttr}${tabAttr}>${escapeHtml(l.label)}</a>`
        }).join('')
      }</div>`
    }
  }

  panel.classList.add('open')
  const hint = document.getElementById('cv-hint')
  if (hint) hint.classList.remove('visible')

  state.keys.up = state.keys.down = state.keys.left = state.keys.right = false
  resetTouchStick()

  attachFocusTrap(panel)
  requestAnimationFrame(() => {
    const closeBtn = document.getElementById('cv-panel-close')
    closeBtn?.focus()
  })
}

export function cvClosePanel() {
  removeFocusTrap()

  state.cv.focusLabel = null
  state.cv.isFocusing = false

  const panel = document.getElementById('cv-panel')
  if (panel) {
    panel.classList.remove('open')
    panel.setAttribute('aria-hidden', 'true')
  }
  document.body.classList.remove('cv-open')

  const hint = document.getElementById('cv-hint')
  if (hint) hint.classList.add('visible')

  const prev = state.cv.lastFocusEl
  state.cv.lastFocusEl = null
  if (prev && typeof prev.focus === 'function') {
    requestAnimationFrame(() => prev.focus())
  }
}

/** @param {HTMLCanvasElement} targetCanvas */
export function setupCV(targetCanvas) {
  const _ray = new THREE.Raycaster()
  const _ndc = new THREE.Vector2()

  const interactionBadge = document.getElementById('interaction-badge')

  targetCanvas.addEventListener('pointermove', (e) => {
    if (state.cv.focusLabel) return

    _ndc.x = (e.clientX / window.innerWidth) * 2 - 1
    _ndc.y = -(e.clientY / window.innerHeight) * 2 + 1
    _ray.setFromCamera(_ndc, state.camera)

    const hits = _ray.intersectObjects(state.editables, true)
    const root = hits.length > 0 ? getRootEditable(hits[0].object) : null
    const label = root?.userData?.editorLabel
    const resume = getResumeData(state.locale)
    const isInteractable = Boolean(label && Object.hasOwn(resume, label))

    if (isInteractable && root !== state.cv.hovered && label) {
      cvHighlightOff(state.cv.hovered)
      state.cv.hovered = root
      cvHighlightOn(root, resume[/** @type {keyof typeof resume} */ (label)].accent)
      targetCanvas.style.cursor = 'pointer'
      if (interactionBadge) {
        interactionBadge.textContent = interactionBadgeText(label)
        interactionBadge.classList.add('visible')
      }
    } else if (!isInteractable && state.cv.hovered) {
      cvHighlightOff(state.cv.hovered)
      state.cv.hovered = null
      targetCanvas.style.cursor = ''
      if (interactionBadge) interactionBadge.classList.remove('visible')
    }
  })

  const closeBtn = document.getElementById('cv-panel-close')
  if (closeBtn) closeBtn.addEventListener('click', cvClosePanel)

  setTimeout(() => {
    if (!state.cv.focusLabel) {
      const hint = document.getElementById('cv-hint')
      if (hint) hint.classList.add('visible')
    }
  }, 1800)

  window.addEventListener('localechange', () => {
    if (interactionBadge && interactionBadge.classList.contains('visible') && state.cv.hovered) {
      const lb = state.cv.hovered.userData?.editorLabel
      if (lb) interactionBadge.textContent = interactionBadgeText(lb)
    }
  })

  targetCanvas.addEventListener('pointerleave', () => {
    if (interactionBadge) interactionBadge.classList.remove('visible')
  })
}
