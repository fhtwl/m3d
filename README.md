# 基于 threejs 的 gltf3d 模型浏览工具, 以及 3d 场景和模型常见交互方法

使用方法可详看 example.ts

```ts
const app = document.getElementById("app")!
const m3d = new M3d(app, {
  plugins: ["performance"],
})

const url = "https://static.fhtwl.cc/test/gltf/scene.gltf"

m3d.LoaderManager.loadModel("gltf", url)!.then((res) => {
  // ...
})
```
