import * as THREE from 'three'
import {
  CAM_BASE_HALF,
  CAM_ISO_ZOOM_DEFAULT,
  GROUND_FIELD_CENTER_X,
  GROUND_FIELD_CENTER_Z,
  GROUND_FIELD_HALF_EXTENT_X,
  GROUND_FIELD_HALF_EXTENT_Z,
} from './constants.js'
import { state } from './state.js'

export function initScene(targetCanvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas: targetCanvas,
    antialias: true,
    powerPreference: 'high-performance',
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x97c7ff)

  const aspect = window.innerWidth / window.innerHeight
  const camera = new THREE.OrthographicCamera(
    -CAM_BASE_HALF * aspect, CAM_BASE_HALF * aspect,
    CAM_BASE_HALF, -CAM_BASE_HALF,
    0.1, 500,
  )
  camera.zoom = CAM_ISO_ZOOM_DEFAULT
  camera.updateProjectionMatrix()
  camera.position.set(20, 20, 20)
  camera.lookAt(0, 0, 0)

  return { renderer, scene, camera }
}

/** @param {THREE.Scene} scene */
export function setupLights(scene) {
  const ambient = new THREE.AmbientLight(0xfff1d6, 0.75)
  scene.add(ambient)

  const sun = new THREE.DirectionalLight(0xffe0b5, 2.1)
  sun.position.set(8, 12, 6)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 60
  sun.shadow.camera.left = -20
  sun.shadow.camera.right = 20
  sun.shadow.camera.top = 20
  sun.shadow.camera.bottom = -20
  scene.add(sun)
}

/**
 * Ground plane fitted around placed props (see constants GROUND_FIELD_*).
 * @param {THREE.Scene} scene
 * @param {THREE.WebGLRenderer} renderer
 */
export function setupGround(scene, renderer) {
  const gw = GROUND_FIELD_HALF_EXTENT_X * 2
  const gh = GROUND_FIELD_HALF_EXTENT_Z * 2
  const groundGeo = new THREE.PlaneGeometry(gw, gh, 1, 1)
  const groundMat = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.set(GROUND_FIELD_CENTER_X, 0, GROUND_FIELD_CENTER_Z)
  ground.receiveShadow = true
  scene.add(ground)
  state.ground = ground

  const textureLoader = new THREE.TextureLoader()
  const grassSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" shape-rendering="crispEdges">
  <rect width="16" height="16" fill="#3aa655"/>
  <rect x="0" y="0" width="1" height="1" fill="#2f8f4a"/><rect x="2" y="1" width="1" height="1" fill="#2f8f4a"/><rect x="5" y="0" width="1" height="1" fill="#2f8f4a"/><rect x="7" y="2" width="1" height="1" fill="#2f8f4a"/><rect x="11" y="1" width="1" height="1" fill="#2f8f4a"/><rect x="13" y="3" width="1" height="1" fill="#2f8f4a"/><rect x="15" y="0" width="1" height="1" fill="#2f8f4a"/>
  <rect x="1" y="4" width="1" height="1" fill="#49bf6b"/><rect x="3" y="6" width="1" height="1" fill="#49bf6b"/><rect x="6" y="5" width="1" height="1" fill="#49bf6b"/><rect x="9" y="7" width="1" height="1" fill="#49bf6b"/><rect x="12" y="6" width="1" height="1" fill="#49bf6b"/><rect x="14" y="8" width="1" height="1" fill="#49bf6b"/>
  <rect x="4" y="10" width="1" height="1" fill="#2f8f4a"/><rect x="8" y="11" width="1" height="1" fill="#2f8f4a"/><rect x="10" y="13" width="1" height="1" fill="#2f8f4a"/><rect x="2" y="12" width="1" height="1" fill="#2f8f4a"/><rect x="15" y="14" width="1" height="1" fill="#2f8f4a"/>
  <rect x="6" y="14" width="1" height="1" fill="#49bf6b"/><rect x="7" y="15" width="1" height="1" fill="#49bf6b"/><rect x="9" y="14" width="1" height="1" fill="#49bf6b"/><rect x="0" y="15" width="1" height="1" fill="#49bf6b"/>
</svg>`.trim()
  const grassUrl = `data:image/svg+xml;utf8,${encodeURIComponent(grassSvg)}`

  textureLoader.load(grassUrl, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(20 * (gw / 50), 17 * (gh / 42))
    tex.magFilter = THREE.NearestFilter
    tex.minFilter = THREE.NearestMipmapNearestFilter
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
    tex.needsUpdate = true

    groundMat.map = tex
    groundMat.color.set(0xffffff)
    groundMat.needsUpdate = true
  })
}
