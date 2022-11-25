import { AnimationMixer, PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
declare type LoadType = "gltf" | "obj";
interface LoaderOptions {
    container: HTMLElement;
    scene: Scene;
    controls: OrbitControls;
    camera: PerspectiveCamera;
}
export default class LoaderManager {
    static container: HTMLElement;
    static scene: Scene;
    static mixers: AnimationMixer[];
    static controls: OrbitControls;
    static camera: PerspectiveCamera;
    static init({ container, scene, controls, camera }: LoaderOptions): void;
    static loadModel(type: LoadType, url: string, options?: LoaderOptions): Promise<Scene> | undefined;
    /**
     * 加载gltf模型
     * @param url
     * @returns
     */
    static loadGLTFModel(url: string): Promise<Scene>;
}
export {};
