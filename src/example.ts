import M3d from "./M3d"
import { ModalLoadOption } from "./Manager/Loader"

export async function init() {
  const app = document.getElementById("app")!
  const m3d = new M3d(app, {
    plugins: ["performance"],
  })

  // const url = "https://static.fhtwl.cc/test/gltf/scene.gltf"

  // const url = "https://static.fhtwl.cc/test/model/Sci-fi%20Vehicle%20007/scene.gltf"
  // const url = "https://static.fhtwl.cc/test/gltf/test/car-t-3-3.gltf"
  const urls: ModalLoadOption[] = [
    {
      url: "https://static.fhtwl.cc/test/gltf/test/car-t-3-3.gltf",
      position: [2, 0, 2],
      callback: (scene) => {
        const newScene = scene.clone()
        newScene.position.set(5, 0, 5)
        m3d.scene.add(newScene)
      },
    },
    {
      url: "https://static.fhtwl.cc/test/gltf/test/20221017115603_parent_directory_%E8%B7%AF%E6%A0%8771.gltf",
      position: [-2, 0, 2],
    },
    {
      url: "https://static.fhtwl.cc/test/gltf/test/20221018105852_parent_directory_%E8%B7%AF%E7%81%AF04.gltf",
      position: [2, 0, -2],
    },
    {
      url: "https://static.fhtwl.cc/test/gltf/test/20221018161525_parent_directory_%E7%BA%A2%E7%BB%BF%E7%81%AF01.gltf",
      position: [-2, 0, -2],
    },
    {
      url: "https://static.fhtwl.cc/test/gltf/test/20221018161920_parent_directory_%E7%BA%A2%E7%BB%BF%E7%81%AF09.gltf",
    },
  ]
  const { LoaderManager } = m3d

  LoaderManager.loadGLTFModels(urls)!.then((res) => {
    console.log(res)
    // console.log(res.getObjectByName("Cars"))
    // const loadedCars = res.getObjectByName("Cars")
    // loadedCars!.children.forEach((element) => {
    //   element.on("click", (data) => {
    //     console.log(data)
    //   })
    // })

    // update the Trackball controls to handle the new size
    m3d.resetCamera()
  })

  LoaderManager.loadManager.onStart = (url, loaded, total) => {
    console.log(url, loaded, total)
  }

  LoaderManager.loadManager.onProgress = (url, loaded, total) => {
    // console.log(url, loaded, total)
    console.log(`进度: ${((loaded / total) * 100).toFixed(2)}%`)
  }

  LoaderManager.loadManager.onError = (e) => {
    console.log(e)
  }

  LoaderManager.loadManager.onLoad = () => {
    console.log("加载完成")
  }
  // app.addEventListener("click", (e: MouseEvent) => {
  //   const intersection = m3d.getIntersection(e)

  //   if (intersection) {
  //     console.log(intersection)
  //     m3d.PopupManager.clearPopups()
  //     console.log(intersection)
  //     if (intersection.object?.parent!.name?.toLocaleLowerCase().indexOf("car") > -1) {
  //       const popup = m3d.PopupManager.addPopup(
  //         `
  //       <div style='width: 100px;height: 100px;background: #0C215A; color: #fff;font-size:12px'>
  //         <div style="height: 32px;line-height: 32px;background: #0C215A">${intersection.object?.parent!.name}</div>
  //         <div>
  //           重量: ${Math.floor(Math.random() * 3)}
  //         </div>
  //       </div>
  //     `,
  //         intersection.point
  //       )
  //     }
  //   }
  // })
}

init()
