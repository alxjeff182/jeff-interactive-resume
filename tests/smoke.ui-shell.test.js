// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { injectAppShell } from '../src/ui/shell.js'

describe('ui shell smoke', () => {
  it('injects core interactive elements', () => {
    document.body.innerHTML = '<div id="app"></div>'
    injectAppShell()

    expect(document.getElementById('c')).toBeTruthy()
    expect(document.getElementById('cv-panel')).toBeTruthy()
    expect(document.getElementById('cv-hint')).toBeTruthy()
    expect(document.getElementById('touch-stick')).toBeTruthy()
  })
})
