import "@/assets/styles/common/var.css"
import "@/assets/styles/common/common.less"
import "@/assets/styles/index.less"
import "@/config"
// console.log("vite-ts")
// import { init } from "./init"
// init()

import M3d from "./M3d"

export async function init() {
  const app = document.getElementById("app")!
  const m3d = new M3d(app)
  // m3d.setCamera(0, 1000, 1500)
  const controls = m3d.controls
  controls.enableZoom = true // 禁用放大
  controls.enablePan = false // 禁用双指缩放
  // controls.enableDamping = true // 开启阻尼效果
  // controls.rotateSpeed = 0.25 // 旋转方向取反，使内部拖拽旋转方向一致

  const url = "https://static.fhtwl.cc/test/gltf/scene.gltf"

  m3d.loadGLTFModel(url).then((res) => {
    console.log(res)
    console.log(res.getObjectByName("Cars"))
    // const loadedCars = res.getObjectByName("Cars")
    // loadedCars!.children.forEach((element) => {
    //   element.on("click", (data) => {
    //     console.log(data)
    //   })
    // })
  })
  // app.addEventListener("click", (e: MouseEvent) => {
  //   const intersection = m3d.getIntersection(e)

  //   if (intersection) {
  //     console.log(intersection)
  //     m3d.clearPopups()
  //     if (intersection.object?.parent.name.indexOf("Car") > -1) {
  //       const popup = m3d.addPopup(
  //         `
  //       <div style='width: 100px;height: 100px;background: #fff;'>
  //         ${intersection.object?.parent.name}
  //       </div>
  //     `,
  //         intersection.point
  //       )
  //     }
  //   }
  // })
}

init()
