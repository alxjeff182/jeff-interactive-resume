import { state } from '../state.js'

export class WorldManager {
  constructor(scene) {
    this.scene = scene
  }

  addEditable(obj) {
    this.scene.add(obj)
    state.editables.push(obj)
  }

  addClickable(obj) {
    this.addEditable(obj)
    state.clickable.push(obj)
  }
}
