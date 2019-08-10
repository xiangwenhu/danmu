import { DanmuItem } from "../index";
import { ElementRect } from "../types";
import { measureElement } from "../util";

export default abstract class Layer {
    protected container: HTMLElement;
    protected status: number;
    protected baseMeasure: ElementRect;

    public type = "common";

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

    getTraceHeight(className, tagName: string = "div") {
        this.baseMeasure = measureElement(tagName, className, this.container);
        return this.baseMeasure.outerHeight + this.baseMeasure.height;
    }

    remove(itemId: string | number) {
        const el = this.container.querySelector(`[danmu-id='${itemId}']`);
        if (el) {
            el.parentNode.removeChild(el);
        }
    }

    destroy() {
        this.container = null;
    }
}
