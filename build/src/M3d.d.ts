import { PerspectiveCamera, Scene, Clock, WebGLRenderer, Vector3, Raycaster, Intersection, Object3D, Event } from "three";
import { PluginType } from "./Plugins";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import PopupManager from "./Manager/Popup";
import LoaderManager from "./Manager/Loader";
interface Options extends ProgramOptions {
    plugins: PluginType[];
}
interface ProgramOptions {
    vertexShaderSource: string;
    fragmentShaderSource: string;
}
export default class M3d {
    gl: WebGLRenderingContext;
    canvas: HTMLCanvasElement;
    program: WebGLProgram;
    container: HTMLElement;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: OrbitControls;
    scene: Scene;
    labelRenderer: CSS2DRenderer;
    clock: Clock;
    PopupManager: typeof PopupManager;
    LoaderManager: typeof LoaderManager;
    animationId: number;
    constructor(el: HTMLElement, options?: Options);
    get width(): number;
    get height(): number;
    /**
     * 初始化
     */
    private init;
    /**
     * 初始化插件
     */
    initPlugin(plugins?: PluginType[]): void;
    /**
     * 初始化业务管理
     */
    initManager(): void;
    /**
     * 创建半球光源，模拟户外光照
     */
    private createHemisphereLight;
    /**
     * 创建方向光，模拟太阳光
     */
    private createDirectionalLight;
    /**
     * 创建渲染器
     */
    private createRenderer;
    private createScene;
    private createCamera;
    private createControls;
    private loop;
    resize(): void;
    resizeRendererToDisplaySize(): boolean;
    private createClock;
    private render;
    /**
     * 设置相机位置
     * @param ve3
     * @param y
     * @param z
     */
    setCamera(ve3: Vector3 | number, y?: number, z?: number): void;
    destory(): void;
    /**
     * 初始化css2dRenderer渲染器
     */
    private create2DRenderer;
    /**
     * 获取射线与屏幕交叉点Intersection
     * @param event
     * @returns
     */
    getIntersection(event: MouseEvent): Intersection<Object3D<Event>> | null;
    /**
     * 获取鼠标事件获取到的元素
     * @param raycaster
     */
    raycastMeshes(raycaster: Raycaster): Intersection<Object3D<Event>> | null;
    /**
     * 过滤隐藏的元素
     * @param arr
     * @returns
     */
    filtersVisible(arr: Intersection<Object3D<Event>>[]): Intersection<Object3D<Event>>[];
}
export {};
