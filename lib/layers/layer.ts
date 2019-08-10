import { DanmuItem } from "../index";

export default abstract class Layer {
    protected container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    abstract init(option: any): void;

    abstract start(): void;

    abstract stop(): void;

    abstract pause(): void;

    abstract continue(): void;

    abstract recycle(): void;

    abstract resize(option: any): void;

    abstract send(items: DanmuItem[]): void;

    remove(itemId: string | number){  
        const el = this.container.querySelector(`[danmu-id='${itemId}']`);
        if(el){
            el.parentNode.removeChild(el);
        }
    };

    destroy() {
        this.container = null;
    }
}
