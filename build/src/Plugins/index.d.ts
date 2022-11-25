declare type DevPluginType = "performance";
export declare type PluginType = DevPluginType | "ad";
interface PluginOptions {
    container: HTMLElement;
    plugins?: PluginType[];
}
export default class Plugin {
    container: HTMLElement;
    loopList: (() => void)[];
    plugins: PluginType[];
    constructor(options: PluginOptions);
    init(options: PluginOptions): void;
    private loop;
    /**
     * 初始化插件
     */
    private initPlugins;
}
export {};
