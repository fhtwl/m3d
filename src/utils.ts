import { MathUtils, PerspectiveCamera, Vector3 } from "three"

export function loadShader(innerHTML: string) {
  const script = document.createElement("script")
  script.setAttribute("type", "shader-source")
  script.innerHTML = innerHTML
  return script
}

export interface RGBA {
  r: number
  g: number
  b: number
  a: number
}
export function randomColor(): RGBA {
  const random = Math.random
  return {
    r: random() * 255,
    g: random() * 255,
    b: random() * 255,
    a: random() * 1,
  }
}

/**
 * 看向区域
 * @param sizeToFitOnScreen
 * @param boxSize
 * @param boxCenter
 * @param camera
 */
export function frameArea(sizeToFitOnScreen: number, boxSize: number, boxCenter: Vector3, camera: PerspectiveCamera) {
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
