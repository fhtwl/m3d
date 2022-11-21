import Stats from "stats.js"
interface PerformanceOptions {
  container: HTMLElement
}

export default class Performance {
  stats!: Stats
  constructor(options: PerformanceOptions) {
    this.init(options)
  }

  private init(options: PerformanceOptions) {
    const { container } = options
    const stats = new Stats()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom

    container.appendChild(stats.dom)
    this.stats = stats
    ;[].forEach.call(this.stats.dom.children, (child: HTMLDivElement) => (child.style.display = ""))
  }

  loop() {
    this.stats.update()
  }
}
