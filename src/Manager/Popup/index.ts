import { Group, Scene, Vector3 } from "three"
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer"
interface PopupOptions {
  name: string
}

interface PopupManagerOptions {
  container: HTMLElement
  labelRenderer: CSS2DRenderer
  scene: Scene
}

export default class PopupManager {
  static popupGroup: Group

  static container: HTMLElement

  static labelRenderer: CSS2DRenderer

  static scene: Scene

  static init({ container, labelRenderer, scene }: PopupManagerOptions) {
    this.container = container
    this.labelRenderer = labelRenderer
    this.scene = scene
    this.createPopupGroup()
  }

  /**
   * 初始化弹出层组
   */
  private static createPopupGroup() {
    const { scene } = this
    const group = new Group()
    scene.add(group)
    this.popupGroup = group
  }

  /**
   * 新增弹窗
   * @param dom
   * @param position
   * @param options
   * @returns
   */
  static addPopup(dom: HTMLElement | string, position: Vector3, options?: PopupOptions): CSS2DObject {
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

  /**
   * 清空弹出层
   */
  static clearPopups() {
    const { popupGroup, labelRenderer } = this
    popupGroup.children.forEach((object) => [popupGroup.remove(object)])
    labelRenderer.domElement.innerHTML = ""
  }
}
