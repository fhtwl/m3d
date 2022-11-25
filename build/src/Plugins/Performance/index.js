import Stats from "stats.js";
export default class Performance {
    stats;
    constructor(options) {
        this.init(options);
    }
    init(options) {
        const { container } = options;
        const stats = new Stats();
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        container.appendChild(stats.dom);
        this.stats = stats;
        [].forEach.call(this.stats.dom.children, (child) => (child.style.display = ""));
    }
    loop() {
        this.stats.update();
    }
}
