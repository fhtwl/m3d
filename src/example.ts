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
  app.addEventListener("click", (e: MouseEvent) => {
    const intersection = m3d.getIntersection(e)

    if (intersection) {
      console.log(intersection)
      m3d.clearPopups()
      console.log(intersection)
      if (intersection.object?.parent!.name?.toLocaleLowerCase().indexOf("car") > -1) {
        const popup = m3d.addPopup(
          `
        <div style='width: 100px;height: 100px;background: #fff;'>
          ${intersection.object?.parent!.name}
        </div>
      `,
          intersection.point
        )
      }
    }
  })
}

init()
