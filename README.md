# 基于 threejs 的 gltf3d 模型浏览工具, 以及 3d 场景和模型常见交互方法

使用方法可详看 example.ts

```ts
const app = document.getElementById("app")!
const m3d = new M3d(app, {
  plugins: ["performance"],
})

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
```
