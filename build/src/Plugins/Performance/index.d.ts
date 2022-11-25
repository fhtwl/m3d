import Stats from "stats.js";
interface PerformanceOptions {
    container: HTMLElement;
}
export default class Performance {
    stats: Stats;
    constructor(options: PerformanceOptions);
    private init;
    loop(): void;
}
export {};
