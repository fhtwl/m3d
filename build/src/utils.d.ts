import { PerspectiveCamera, Vector3 } from "three";
export declare function loadShader(innerHTML: string): HTMLScriptElement;
export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}
export declare function randomColor(): RGBA;
/**
 * 看向区域
 * @param sizeToFitOnScreen
 * @param boxSize
 * @param boxCenter
 * @param camera
 */
export declare function frameArea(sizeToFitOnScreen: number, boxSize: number, boxCenter: Vector3, camera: PerspectiveCamera): void;
/**
 * 清空
 * @param elem
 */
export declare function empty(elem: HTMLElement): void;
