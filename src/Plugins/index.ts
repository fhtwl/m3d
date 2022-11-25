import Performance from "./Performance"

type DevPluginType = "performance"

export type PluginType = DevPluginType | "ad"

interface PluginOptions {
  container: HTMLElement
  plugins?: PluginType[]
}
export default class Plugin {
  container!: HTMLElement
  loopList: (() => void)[] = []
  plugins: PluginType[] = []
  // devPlugins: PluginType[] = ["performance"]
  constructor(options: PluginOptions) {
    this.init(options)
  }

  // get isDev(): boolean {
  //   const MODE = import.meta.env.MODE
  //   return MODE === "development"
  // }
  init(options: PluginOptions) {
    const { container, plugins } = options
    this.container = container
    this.plugins = plugins || []
    this.initPlugins()
    this.loop()
  }

  private loop() {
    this.loopList.forEach((fun) => {
      fun()
    })
    requestAnimationFrame(this.loop.bind(this))
  }

  /**
   * 初始化插件
   */
  private initPlugins() {
    const { plugins, container, loopList } = this
    // 生产环境下排除仅dev环境才生效的插件
    // const productPlugins = plugins.filter((str) => isDev || !devPlugins.includes(str))
    plugins.forEach((plugin) => {
      switch (plugin) {
        case "performance": {
          const performance = new Performance({ container })

          loopList.push(() => {
            performance.loop()
          })
          break
        }

        default:
          console.log("该插件不存在")
      }
    })
  }
}
