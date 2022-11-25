import { Group, Scene, Vector3 } from "three";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
interface PopupOptions {
    name: string;
}
interface PopupManagerOptions {
    container: HTMLElement;
    labelRenderer: CSS2DRenderer;
    scene: Scene;
}
export default class PopupManager {
    static popupGroup: Group;
    static container: HTMLElement;
    static labelRenderer: CSS2DRenderer;
    static scene: Scene;
    static init({ container, labelRenderer, scene }: PopupManagerOptions): void;
    /**
     * 初始化弹出层组
     */
    private static createPopupGroup;
    /**
     * 新增弹窗
     * @param dom
     * @param position
     * @param options
     * @returns
     */
    static addPopup(dom: HTMLElement | string, position: Vector3, options?: PopupOptions): CSS2DObject;
    /**
     * 清空弹出层
     */
    static clearPopups(): void;
}
export {};
