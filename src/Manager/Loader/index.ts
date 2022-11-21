import { frameArea } from "@/utils"
import { AnimationMixer, Box3, LoadingManager, PerspectiveCamera, Scene, Vector3 } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

type LoadType = "gltf" | "obj"
interface LoaderOptions {
  container: HTMLElement
  scene: Scene
  controls: OrbitControls
  camera: PerspectiveCamera
}

export default class LoaderManager {
  static container: HTMLElement

  static scene: Scene
  static mixers: AnimationMixer[]
  static controls: OrbitControls
  static camera: PerspectiveCamera

  static init({ container, scene, controls, camera }: LoaderOptions) {
    this.container = container
    this.scene = scene
    this.controls = controls
    this.camera = camera
  }

  static loadModel(type: LoadType, url: string, options?: LoaderOptions): Promise<Scene> | undefined {
    switch (type) {
      case "gltf":
        return this.loadGLTFModel(url)
      default:
        console.log("暂不支持该类模型")
    }
  }

  // const delta = clock.getDelta()
  // for (let i = 0; i < mixers.length; i++) {
  //   // 重复播放动画
  //   mixers[i].update(delta)
  // }

  /**
   * 加载gltf模型
   * @param url
   * @returns
   */
  static async loadGLTFModel(url: string): Promise<Scene> {
    const loadManager = new LoadingManager()
    loadManager.onStart = (url, loaded, total) => {
      console.log(url, loaded, total)
    }

    loadManager.onProgress = (url, loaded, total) => {
      // console.log(url, loaded, total)
      console.log(`进度: ${((loaded / total) * 100).toFixed(2)}%`)
    }

    loadManager.onError = (e) => {
      console.log(e)
    }

    loadManager.onLoad = () => {
      console.log("加载完成")
    }

    const gltfLoader = new GLTFLoader(loadManager) // 实时显示进度
      .setCrossOrigin("anonymous") // 设置image的CrossOrigin模式
    return new Promise((resolve) => {
      gltfLoader.load(url, (gltf: GLTF) => {
        const { scene, controls, camera } = this
        const root: Scene = gltf.scene as unknown as Scene
        scene.add(root)

        // 调用动画
        const mixer = new AnimationMixer(gltf.scene.children[2])
        const mixers = []
        if (gltf.animations.length > 0) {
          mixer.clipAction(gltf.animations[0]).setDuration(1).play()

          mixers.push(mixer)
        }

        this.mixers = mixers

        // compute the box that contains all the stuff
        // from root and below
        const box = new Box3().setFromObject(root)

        const boxSize = box.getSize(new Vector3()).length()
        const boxCenter = box.getCenter(new Vector3())
        frameArea(boxSize * 0.5, boxSize, boxCenter, camera)

        // update the Trackball controls to handle the new size
        controls.maxDistance = boxSize * 10
        controls.target.copy(boxCenter)
        controls.update()
        resolve(scene)
      })
    })
  }
}
