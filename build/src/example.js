import "@/assets/styles/common/var.css";
import "@/assets/styles/common/common.less";
import "@/assets/styles/index.less";
import "@/config";
// console.log("vite-ts")
// import { init } from "./init"
// init()
import M3d from "./M3d";
export async function init() {
    const app = document.getElementById("app");
    const m3d = new M3d(app);
    // const url = "https://static.fhtwl.cc/test/gltf/scene.gltf"
    const url = "https://static.fhtwl.cc/test/model/Sci-fi%20Vehicle%20007/scene.gltf";
    m3d.LoaderManager.loadModel("gltf", url).then((res) => {
        console.log(res);
        console.log(res.getObjectByName("Cars"));
        // const loadedCars = res.getObjectByName("Cars")
        // loadedCars!.children.forEach((element) => {
        //   element.on("click", (data) => {
        //     console.log(data)
        //   })
        // })
    });
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
init();
