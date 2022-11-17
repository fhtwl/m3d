import {
  PerspectiveCamera,
  Renderer,
  Scene,
  Group,
  Clock,
  HemisphereLight,
  DirectionalLight,
  WebGLRenderer,
  Color,
  Vector3,
  MathUtils,
  AnimationMixer,
  Box3,
  Raycaster,
  Vector2,
  Intersection,
  Object3D,
  Mesh,
  Event,
  Cache,
} from "three"

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer"
import Stats from "stats.js"
// import { createBackground } from "./utils/index.js"

Cache.enabled = true

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
  camera!: PerspectiveCamera
  renderer!: Renderer
  controls!: OrbitControls
  scene!: Scene
  stats!: Stats
  popupGroup!: Group
  labelRenderer!: CSS2DRenderer
  mixers: any = []
  clock!: Clock
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

  /**
   * 创建States
   */
  private createStates() {
    const { getIsDev, container } = this
    if (getIsDev()) {
      const stats = new Stats()
      stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom

      container.appendChild(stats.dom)
      this.stats = stats
      ;[].forEach.call(this.stats.dom.children, (child: HTMLDivElement) => (child.style.display = ""))
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
    const light = new HemisphereLight(skyColor, groundColor, intensity)
    scene.add(light)
  }

  /**
   * 创建方向光，模拟太阳光
   */
  private createDirectionalLight() {
    const { camera } = this

    const color = 0xffffff
    const intensity = 1
    const light = new DirectionalLight(color, intensity)
    light.position.set(5, 10, 2)
    camera.add(light)
    // scene.add(light.target)

    const light2 = new DirectionalLight(0xffffff, 0.8 * Math.PI)
    light2.position.set(0.5, 0, 0.866) // ~60º
    light2.name = "main_light"
    camera.add(light2)
  }

  /**
   * 创建渲染器
   */
  private createRenderer() {
    const { width, height } = this
    const renderer = new WebGLRenderer({
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
    this.scene = new Scene()
    this.scene.background = new Color("black")
  }

  private createCamera() {
    const camera = new PerspectiveCamera(40, this.width / this.height, 0.1, 3000)
    // camera.position.set(0, 0, -28)
    camera.position.set(3.55, 0, -328)
    this.scene.add(camera) // this is required cause there is a light under camera
    this.camera = camera
  }

  private createControls() {
    const controls = new OrbitControls(this.camera, this.labelRenderer.domElement)
    controls.rotateSpeed = 1
    controls.autoRotate = false // 禁用自转
    controls.enableZoom = true // 允许缩放
    controls.enablePan = true // 允许平移
    controls.keyPanSpeed = 7.0 // 平移速度
    controls.enabled = true // 鼠标控制是否可用
    controls.enableDamping = true // 关闭阻尼效果
    controls.dampingFactor = 0.1 // 惯性滑动
    this.controls = controls
    // controls.addEventListener("change", this.render.bind(this))
    window.addEventListener("resize", this.resize.bind(this), false)
  }

  private loop() {
    this.controls.update()
    this.render()
    requestAnimationFrame(this.loop.bind(this))
  }

  resize() {
    const { container, camera, renderer, labelRenderer } = this
    const { clientHeight, clientWidth } = container

    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
    // this.vignette.style({ aspect: this.camera.aspect })
    renderer.setSize(clientWidth, clientHeight)
    labelRenderer.setSize(clientWidth, clientHeight)
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
    this.clock = new Clock()
  }

  private render() {
    const { scene, camera, renderer, getIsDev, stats, labelRenderer, clock, mixers, resize } = this
    const isDev = getIsDev()
    if (isDev) {
      stats.update()
    }

    // if (this.resizeRendererToDisplaySize()) {
    //   const canvas = renderer.domElement
    //   camera.aspect = canvas.clientWidth / canvas.clientHeight
    //   camera.updateProjectionMatrix()
    // }

    // const delta = clock.getDelta()
    // for (let i = 0; i < mixers.length; i++) {
    //   // 重复播放动画
    //   mixers[i].update(delta)
    // }

    labelRenderer.render(scene, camera)
    renderer.render(scene, camera)
  }

  /**
   * 设置相机位置
   * @param ve3
   * @param y
   * @param z
   */
  public setCamera(ve3: Vector3 | number, y?: number, z?: number) {
    if (typeof ve3 === "number") {
      this.camera.position.set(ve3, y!, z!)
    } else {
      this.camera.position.set(ve3.x, ve3.y, ve3.z)
    }
  }

  frameArea(sizeToFitOnScreen: number, boxSize: number, boxCenter: Vector3, camera: PerspectiveCamera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5
    const halfFovY = MathUtils.degToRad(camera.fov * 0.5)
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY)
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = new Vector3().subVectors(camera.position, boxCenter).multiply(new Vector3(1, 0, 1)).normalize()

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
  async loadGLTFModel(url: string): Promise<Scene> {
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
    const group = new Group()
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

  addPopup(dom: HTMLElement | string, position: Vector3, options?: PopupOptions): CSS2DObject {
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
    const raycaster = new Raycaster()
    const mouse = new Vector2()
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
  raycastMeshes(raycaster: Raycaster) {
    const { scene, filtersVisible } = this
    const intersects: Intersection<Object3D<Event>>[] = []
    // 对场景及其子节点遍历
    scene.children.forEach((item) => {
      // 如果场景的子节点是Group或者Scene对象
      if (item instanceof Group || item instanceof Scene) {
        // 场景子节点及其后代，被射线穿过的模型的数组集合
        const rayArr = raycaster.intersectObjects(item.children, true)
        intersects.push(...rayArr)
      } else if (item instanceof Mesh) {
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
  filtersVisible(arr: Intersection<Object3D<Event>>[]): Intersection<Object3D<Event>>[] {
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
  //  * @param { Object3D } intersects
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
  //   const moonGeometry = new SphereGeometry(1, 16, 16)
  //   const moonMaterial = new MeshPhongMaterial({
  //     shininess: 5,
  //     // map: textureLoader.load("textures/planets/moon_1024.jpg"),
  //   })
  //   const moon = new Mesh(moonGeometry, moonMaterial)
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
