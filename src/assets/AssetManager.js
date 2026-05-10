import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

export class AssetManager {
  constructor() {
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('/decoders/draco/')

    this.ktx2Loader = new KTX2Loader()
    this.ktx2Loader.setTranscoderPath('/decoders/basis/')

    this.loader = new GLTFLoader()
    this.loader.setDRACOLoader(this.dracoLoader)
    this.loader.setKTX2Loader(this.ktx2Loader)
    this.loader.setMeshoptDecoder(MeshoptDecoder)
  }

  detectSupport(renderer) {
    if (renderer) this.ktx2Loader.detectSupport(renderer)
  }

  loadGltf(url) {
    return new Promise((resolve, reject) => {
      this.loader.load(url, resolve, undefined, reject)
    })
  }

  dispose() {
    this.dracoLoader.dispose()
    this.ktx2Loader.dispose()
  }
}
