import {
  PerspectiveCamera,
  Scene,
  Group,
  Clock,
  HemisphereLight,
  DirectionalLight,
  WebGLRenderer,
  Color,
  Vector3,
  Raycaster,
  Vector2,
  Intersection,
  Object3D,
  Mesh,
  Event,
  Cache,
  Box3,
} from "three"
import Plugins, { PluginType } from "./Plugins"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer"

// import { createBackground } from "./utils/index.js"

import PopupManager from "./Manager/Popup"
import LoaderManager from "./Manager/Loader"
import { empty, frameArea } from "./utils"

Cache.enabled = true

interface Options {
  // el: HTMLElement
  plugins: PluginType[]
}

interface ProgramOptions {
  vertexShaderSource: string
  fragmentShaderSource: string
}

export default class M3d {
  public gl!: WebGLRenderingContext
  canvas!: HTMLCanvasElement
  public program!: WebGLProgram
  container: HTMLElement
  camera!: PerspectiveCamera
  renderer!: WebGLRenderer
  controls!: OrbitControls
  scene!: Scene
  labelRenderer!: CSS2DRenderer

  clock!: Clock
  PopupManager!: typeof PopupManager
  LoaderManager!: typeof LoaderManager
  animationId!: number
  constructor(el: HTMLElement, options?: Options) {
    this.container = el
    console.log(options)
    this.init(options)
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
  private init(options?: Options) {
    this.createRenderer()
    this.initPlugin(options?.plugins)
    this.createScene()
    this.createCamera()
    this.createClock()
    this.createHemisphereLight()
    this.createDirectionalLight()
    this.create2DRenderer()
    this.createControls()

    this.initManager()
    this.loop()
  }

  /**
   * 初始化插件
   */
  initPlugin(plugins?: PluginType[]) {
    new Plugins({
      container: this.container,
      plugins,
    })
  }

  /**
   * 初始化业务管理
   */
  initManager() {
    this.PopupManager = PopupManager
    PopupManager.init(this)

    this.LoaderManager = LoaderManager
    LoaderManager.init(this)
  }

  /**
   * 创建半球光源，模拟户外光照
   */
  private createHemisphereLight() {
    const { scene } = this
    const skyColor = 0xffffff
    const groundColor = 0xffffff
    const intensity = 0.7
    const light = new HemisphereLight(skyColor, groundColor, intensity)
    scene.add(light)
  }

  /**
   * 创建方向光，模拟太阳光
   */
  private createDirectionalLight() {
    const { scene } = this

    const color = 0xffffff
    const intensity = 0.7
    const light = new DirectionalLight(color, intensity)
    light.position.set(5, 10, 2)
    scene.add(light)
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
    controls.enableDamping = false // 关闭阻尼效果
    controls.dampingFactor = 0.1 // 惯性滑动
    this.controls = controls
    // controls.addEventListener("change", this.render.bind(this))
    window.addEventListener("resize", this.resize.bind(this), false)
  }

  private loop() {
    this.controls.update()
    this.render()
    this.animationId = requestAnimationFrame(this.loop.bind(this))
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
    const { scene, camera, renderer, labelRenderer, clock, resize } = this

    // if (this.resizeRendererToDisplaySize()) {
    //   const canvas = renderer.domElement
    //   camera.aspect = canvas.clientWidth / canvas.clientHeight
    //   camera.updateProjectionMatrix()
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

  public destory() {
    cancelAnimationFrame(this.animationId)
    // this.scene.traverse((child) => {
    //   if (child.material) {
    //     child.material.dispose();
    //   }
    //   if (child.geometry) {
    //     child.geometry.dispose();
    //   }
    //   child = null;
    // });
    this.container.innerHTML = ""
    this.renderer.forceContextLoss()
    this.renderer.dispose()
    this.scene.clear()
    // this.scene = undefined;
    // this.camera = null;
    // this.controls = null;
    // this.renderer.domElement = null;
    // this.renderer = null;
    empty(this.renderer.domElement)
    console.log("clearScene")
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

  /**
   * 将相机对齐到场景中心
   */
  resetCamera() {
    const { scene, camera, controls } = this
    const box = new Box3().setFromObject(scene)

    const boxSize = box.getSize(new Vector3()).length()
    const boxCenter = box.getCenter(new Vector3())
    frameArea(boxSize * 0.8, boxSize, boxCenter, camera)
    controls.maxDistance = boxSize * 10
    controls.target.copy(boxCenter)
    controls.update()
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
