import * as THREE from "three"

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer"
import Stats from "stats.js"

interface Options extends ProgramOptions {
  el: HTMLElement
}

interface ProgramOptions {
  vertexShaderSource: string
  fragmentShaderSource: string
}

export default class M3d {
  public gl!: WebGLRenderingContext
  canvas!: HTMLCanvasElement
  public program!: WebGLProgram
  root!: HTMLElement
  container: HTMLElement
  camera!: THREE.PerspectiveCamera
  renderer!: THREE.Renderer
  controls!: OrbitControls
  scene!: THREE.Scene
  stats!: Stats
  popupGroup!: THREE.Group
  labelRenderer!: CSS2DRenderer
  mixers: any = []
  clock!: THREE.Clock
  constructor(el: HTMLElement, options?: Options) {
    this.container = el
    console.log(options)
    this.init()
  }

  get width(): number {
    return this.container.clientWidth
  }

  get height(): number {
    return this.container.clientHeight
  }

  /**
   * 初始化
   */
  private init() {
    this.createRenderer()
    this.createStates()
    this.createScene()
    this.createCamera()
    this.createClock()
    this.createHemisphereLight()
    this.createDirectionalLight()
    this.createPopupGroup()
    this.create2DRenderer()
    this.createControls()

    this.loop()
  }

  /**
   * 判断是不是dev环境
   * @returns
   */
  getIsDev(): boolean {
    const MODE = import.meta.env.MODE
    return MODE === "development"
  }

  private createStates() {
    const { getIsDev, container } = this
    if (getIsDev()) {
      const stats = new Stats()
      stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
      container.appendChild(stats.dom)
      this.stats = stats
    }
  }

  /**
   * 创建半球光源，模拟户外光照
   */
  private createHemisphereLight() {
    const { scene } = this
    const skyColor = 0xb1e1ff // light blue
    const groundColor = 0xb97a20 // brownish orange
    const intensity = 0.6
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
    scene.add(light)
  }

  /**
   * 创建方向光，模拟太阳光
   */
  private createDirectionalLight() {
    const { scene } = this

    const color = 0xffffff
    const intensity = 0.8
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(5, 10, 2)
    scene.add(light)
    scene.add(light.target)
  }

  /**
   * 创建渲染器
   */
  private createRenderer() {
    const { width, height } = this
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    })
    const container = this.container

    renderer.setClearColor(0x000000, 0)
    // renderer.setPixelRatio(window.devicePixelRatio) // this line would make FPS decreased at 30 for mobile device
    renderer.setSize(this.width, this.height)
    renderer.domElement.style.position = "relative"
    renderer.domElement.style.width = `${width}px`
    renderer.domElement.style.height = `${height}px`
    container.appendChild(renderer.domElement)
    this.renderer = renderer
  }

  private createScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color("black")
  }

  private createCamera() {
    const camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 3000)
    // camera.position.set(0, 0, -28)
    camera.position.set(3.55, 0, -328)
    this.scene.add(camera) // this is required cause there is a light under camera
    this.camera = camera
  }

  private createControls() {
    const controls = new OrbitControls(this.camera, this.labelRenderer.domElement)
    controls.rotateSpeed = 0.3
    controls.autoRotate = false
    controls.enableZoom = false
    controls.enablePan = false
    controls.enabled = true
    this.controls = controls
  }

  private loop() {
    requestAnimationFrame(this.loop.bind(this))
    this.animate()
    this.render()
  }

  private animate() {
    this.controls.update()
  }

  resizeRendererToDisplaySize() {
    const { width, height, renderer, labelRenderer } = this
    const canvas = renderer.domElement
    const needResize = canvas.width !== width || canvas.height !== height
    if (needResize) {
      renderer.setSize(width, height, false)
      labelRenderer.setSize(width, height)
    }
    return needResize
  }

  private createClock() {
    this.clock = new THREE.Clock()
  }

  private render() {
    const { scene, camera, renderer, getIsDev, stats, labelRenderer, clock, mixers } = this
    const isDev = getIsDev()
    if (isDev) {
      stats.begin()
    }
    if (this.resizeRendererToDisplaySize()) {
      const canvas = renderer.domElement
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
    }

    const delta = clock.getDelta()
    for (let i = 0; i < mixers.length; i++) {
      // 重复播放动画
      mixers[i].update(delta)
    }

    labelRenderer.render(scene, camera)
    renderer.render(scene, camera)

    if (isDev) {
      stats.end()
    }
  }

  /**
   * 设置相机位置
   * @param ve3
   * @param y
   * @param z
   */
  public setCamera(ve3: THREE.Vector3 | number, y?: number, z?: number) {
    if (typeof ve3 === "number") {
      this.camera.position.set(ve3, y!, z!)
    } else {
      this.camera.position.set(ve3.x, ve3.y, ve3.z)
    }
  }

  frameArea(sizeToFitOnScreen: number, boxSize: number, boxCenter: THREE.Vector3, camera: THREE.PerspectiveCamera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5)
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY)
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize()

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter))

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100
    camera.far = boxSize * 100

    camera.updateProjectionMatrix()

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z)
  }

  /**
   * 加载gltf模型
   * @param url
   * @returns
   */
  async loadGLTFModel(url: string): Promise<THREE.Scene> {
    const gltfLoader = new GLTFLoader()
    const onProgress = (xhr: ProgressEvent<EventTarget>) => {
      console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`)
    }
    const onError = (res: ErrorEvent) => {
      console.log(res)
    }
    return new Promise((resolve) => {
      gltfLoader.load(
        url,
        (gltf: GLTF) => {
          const { scene, controls, camera, frameArea } = this
          const root: THREE.Scene = gltf.scene as unknown as THREE.Scene
          scene.add(root)

          // 调用动画
          const mixer = new THREE.AnimationMixer(gltf.scene.children[2])
          const mixers = []
          if (gltf.animations.length > 0) {
            mixer.clipAction(gltf.animations[0]).setDuration(1).play()

            mixers.push(mixer)
          }

          this.mixers = mixers

          // compute the box that contains all the stuff
          // from root and below
          const box = new THREE.Box3().setFromObject(root)

          const boxSize = box.getSize(new THREE.Vector3()).length()
          const boxCenter = box.getCenter(new THREE.Vector3())
          frameArea(boxSize * 0.5, boxSize, boxCenter, camera)

          // update the Trackball controls to handle the new size
          controls.maxDistance = boxSize * 10
          controls.target.copy(boxCenter)
          controls.update()
          resolve(scene)
        },
        onProgress,
        onError
      )
    })
  }

  /**
   * 初始化弹出层组
   */
  private createPopupGroup() {
    const { scene } = this
    const group = new THREE.Group()
    scene.add(group)
    this.popupGroup = group
  }

  /**
   * 初始化css2dRenderer渲染器
   */
  private create2DRenderer() {
    const { width, height, container } = this
    const labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(width, height)
    labelRenderer.domElement.style.position = "absolute"
    labelRenderer.domElement.style.top = "0"
    this.labelRenderer = labelRenderer
    container.appendChild(labelRenderer.domElement)
  }

  addPopup(dom: HTMLElement | string, position: THREE.Vector3, options?: PopupOptions): CSS2DObject {
    console.log(options)
    const { popupGroup, container } = this
    let div
    if (typeof dom === "string") {
      div = document.createElement("div")
      div.innerHTML = dom
    } else {
      div = dom
    }

    container.appendChild(div)
    const moonLabel = new CSS2DObject(div)
    // //前两个参数是对于屏幕xy坐标,可以取负数  第三个不清楚,按道理应该是z轴坐标,不知道怎么体现
    moonLabel.position.set(position.x, position.y, position.z)
    moonLabel.layers.set(0)

    popupGroup.add(moonLabel)
    return moonLabel
    // const loadedCars = root.getObjectByName('Cars');

    // console.log(container)
  }

  clearPopups() {
    const { popupGroup, labelRenderer } = this
    popupGroup.children.forEach((object) => [popupGroup.remove(object)])
    labelRenderer.domElement.innerHTML = ""
  }

  /**
   * 获取射线与屏幕交叉点Intersection
   * @param event
   * @returns
   */
  getIntersection(event: MouseEvent) {
    // EventTarget
    const { container, camera, width, height } = this
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    // 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
    const div3DLeft = container.getBoundingClientRect().left
    const div3DTop = container.getBoundingClientRect().top
    mouse.x = ((event.clientX - div3DLeft) / width) * 2 - 1
    mouse.y = -((event.clientY - div3DTop) / height) * 2 + 1
    // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
    raycaster.setFromCamera(mouse, camera)
    // 获取raycaster直线和所有模型相交的数组集合
    return this.raycastMeshes(raycaster)
  }

  /**
   * 获取鼠标事件获取到的元素
   * @param raycaster
   */
  raycastMeshes(raycaster: THREE.Raycaster) {
    const { scene, filtersVisible } = this
    const intersects: THREE.Intersection<THREE.Object3D<THREE.Event>>[] = []
    // 对场景及其子节点遍历
    scene.children.forEach((item) => {
      // 如果场景的子节点是Group或者Scene对象
      if (item instanceof THREE.Group || item instanceof THREE.Scene) {
        // 场景子节点及其后代，被射线穿过的模型的数组集合
        const rayArr = raycaster.intersectObjects(item.children, true)
        intersects.push(...rayArr)
      } else if (item instanceof THREE.Mesh) {
        // 如果场景的子节点是Mesh网格对象，场景子节点被射线穿过的模型的数组集合
        intersects.push(...raycaster.intersectObject(item))
      }
    })

    const visibleIntersects = filtersVisible(intersects)
    // visibleIntersects[0].object.visible = false
    console.log(visibleIntersects)
    return visibleIntersects.length > 0 ? visibleIntersects[0] : null
  }
  /**
   * 过滤隐藏的元素
   * @param arr
   * @returns
   */
  filtersVisible(
    arr: THREE.Intersection<THREE.Object3D<THREE.Event>>[]
  ): THREE.Intersection<THREE.Object3D<THREE.Event>>[] {
    let arrList = arr
    if (arr && arr.length > 0) {
      arrList = []
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].object.visible) {
          arrList.push(arr[i])
        }
      }
    }
    return arrList
  }
  // /**
  //  * 获取拾取到的元素，并执行回调函数
  //  * @param { Function } callback
  //  * @param { THREE.Object3D } intersects
  //  */
  // getNode(callback, intersects, event) {
  //   // let selectedObjects = null
  //   if (intersects[0].object !== undefined) {
  //     //   console.log(intersects[0].object, '这就是成功点击到的对象了~')

  //     // 有可能点到线上的文字
  //     this.callback(callback, intersects[0].object.__data || intersects[0].object.parent.__data, event)
  //   }
  // }

  // showPopup() {
  //   const { popupGroup, scene } = this
  //   const moonGeometry = new THREE.SphereGeometry(1, 16, 16)
  //   const moonMaterial = new THREE.MeshPhongMaterial({
  //     shininess: 5,
  //     // map: textureLoader.load("textures/planets/moon_1024.jpg"),
  //   })
  //   const moon = new THREE.Mesh(moonGeometry, moonMaterial)
  //   const earthDiv = document.createElement("div")
  //   earthDiv.className = "label"
  //   earthDiv.textContent = "Earth"
  //   earthDiv.style.marginTop = "-1em"
  //   const earthLabel = new CSS2DObject(earthDiv)
  //   earthLabel.position.set(0, 1, 0)
  //   scene.add(earthLabel)
  //   earthLabel.layers.set(0)
  // }
}

interface PopupOptions {
  name: string
}
