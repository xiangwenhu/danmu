import { measureElement, get2DTranslate } from "../util";
import Layer from "./layer";
import { DanmuItem } from "../index";
import TraceManager from "../traceManager";

export interface AccLayerOption {
    reuse?: boolean;
    duration?: number;
    checkPeriod?: number;
    useMeasure?: boolean;
    slideRatio?: number;
}

const DEFAULT_OPTION = {
    reuse: false,
    duration: 10000,
    checkPeriod: 1000,
    useMeasure: false,
    slideRatio: 4
};

const DEFAULT_DANMU_CLASS = "danmu-item danmu-item-acc";
const DEFUALT_DURATION = 10000;

class AccLayer extends Layer {
    private frame: HTMLDivElement;
    private sample: HTMLDivElement;
    private HEIGHT: number;
    private WIDTH: number;
    private rect: ClientRect;
    private option: AccLayerOption;
    private clearTicket: number;
    private traceManager: TraceManager;
    private recycleQueue: HTMLElement[];

    constructor(container: HTMLElement) {
        super(container);
        this.sample = document.createElement("div");
        this.sample.className = DEFAULT_DANMU_CLASS;
        this.rect = container.getBoundingClientRect();
        this.HEIGHT = container.clientHeight;
        this.WIDTH = container.clientWidth;
        this.type = "acc";
    }

    init(option: AccLayerOption = DEFAULT_OPTION) {
        const { HEIGHT, WIDTH } = this;
        this.option = Object.assign(DEFAULT_OPTION, option);
        this.createFrames(this.container);
        this.recycle();
        const traceHeight = this.getTraceHeight(DEFAULT_DANMU_CLASS);
        this.traceManager = new TraceManager({
            height: HEIGHT,
            width: (WIDTH * this.option.slideRatio) / 2,
            traceHeight
        });
        this.recycleQueue = [];
    }

    resize(option: AccLayerOption) {
        const { container } = this;
        window.getComputedStyle(container).height;
        this.rect = container.getBoundingClientRect();
        this.HEIGHT = container.clientHeight;
        this.WIDTH = container.clientWidth;
        const traceHeight = this.getTraceHeight(DEFAULT_DANMU_CLASS);
        this.traceManager.resize({
            height: this.HEIGHT,
            width: (this.WIDTH * this.option.slideRatio) / 2,
            traceHeight
        });
        this.option.duration = option.duration;
    }

    start() {
        this.status = 1;
        this.traceManager.reset();
    }

    stop() {
        this.status = 0;
        this.frame.innerHTML = "";
        this.clearTicket && clearInterval(this.clearTicket);
        this.recycleQueue = [];
    }

    pause() {
        this.frame
            .querySelectorAll(".danmu-item-acc")
            .forEach((el: HTMLElement) => (el.style.animationPlayState = "paused"));
        this.status = 2;
    }

    continue() {
        this.frame
            .querySelectorAll(".danmu-item-acc")
            .forEach((el: HTMLElement) => (el.style.animationPlayState = "running"));
        this.status = 1;
    }

    getCurrentX(el: HTMLElement) {
        const { x } = get2DTranslate(el);
        return -x;
    }

    getTraceInfo(item: DanmuItem) {
        if (item.trace) {
            const index = Math.min(item.trace, this.traceManager.traceCount - 1);
            return {
                index,
                y: this.traceManager.traces[index].y
            };
        }

        return this.traceManager.get();
    }

    setTraceInfo(traceIndex: number, x: number, len) {
        // this.traceManager.set(traceIndex, x, len);
    }

    send(queue: DanmuItem[]) {
        if (this.status !== 1 || queue.length <= 0) {
            return;
        }
        const { frame, WIDTH } = this;

        const newItems = queue.map(item => {
            const { index: traceIndex, y: top } = this.getTraceInfo(item);
            const newItem = this.createDanmuItem(item, "100%", top);
            newItem.style.animationDuration = (item.duration || DEFUALT_DURATION) + "ms";
            frame.appendChild(newItem);
            const len = this.getElementLength(item, newItem);
            const animationName = this.getAnimationName(len);
            newItem.style.animationName = animationName;
            newItem.classList.add("block", "fullWidth");
            this.setTraceInfo(traceIndex, 0, len);
            return newItem;
        });

        // window.getComputedStyle(this.frame).height;
        // newItems.forEach((el, index)=>{
        //     el.classList.add();
        // })
    }

    getAnimationName(len: number) {
        const percent = +Math.ceil((len * 10) / this.WIDTH).toFixed(1) * 10;
        const totalPercent = 100 + percent;
        return "animation-acc-" + totalPercent;
    }

    getElementLength(item: DanmuItem, el: HTMLElement) {
        const { useMeasure } = this.option;
        const { forceDetect, render, content } = item;
        if (!useMeasure || forceDetect || render) {
            return el.getBoundingClientRect().width;
        }
        if (useMeasure) {
            const { baseMeasure } = this;
            return content.length * baseMeasure.letterWidth + baseMeasure.outerWidth;
        }
    }

    createFrames(wrapper: HTMLElement) {
        const frame: HTMLDivElement = document.createElement("div");
        frame.className = "danmu-frame danmu-frame-acc";
        frame.id = "frames_frame_acc";

        wrapper.appendChild(frame);
        this.frame = frame;
        this.resgisterAnimationEvents();
    }

    createDanmuItem(item: DanmuItem, left: number | string, top?: number) {
        let el = item.render && this.createDanmuWithRender(item, left, top);
        if (el) {
            return el;
        }

        top = top || ~~(Math.random() * this.HEIGHT);
        el = this.sample.cloneNode() as HTMLElement;
        el.innerHTML = item.content;
        el.dataset.tLength = item.content.length + "";
        el.style.cssText = `top:${top}px;${item.style || ""}`;
        if (item.className) {
            el.classList.add(item.className);
        }
        return el;
    }

    createDanmuWithRender(item: DanmuItem, left: number | string, top?: number) {
        const data = { left, top, class: item.className, style: item.style };
        if (typeof item.render === "function") {
            const el = item.render(data);
            if (el instanceof HTMLElement) {
                DEFAULT_DANMU_CLASS.split(" ").forEach(cn => {
                    if (!el.classList.contains(DEFAULT_DANMU_CLASS)) {
                        el.classList.add(cn);
                    }
                });

                return el;
            }
            if (typeof el === "string") {
                return this.wrapperHTMLStringDanmu(left, top + "px", item.render);
            }
        } else if (typeof item.render === "object" && item.render instanceof HTMLElement) {
            return item.render;
        } else if (typeof item.render === "string") {
            return this.wrapperHTMLStringDanmu(left, top + "px", item.render);
        }
        return null;
    }

    wrapperHTMLStringDanmu(left, top, content) {
        top = top || ~~(Math.random() * this.HEIGHT);
        const el = this.sample.cloneNode() as HTMLElement;
        el.innerHTML = content;
        el.style.cssText = `top:${top};left:${left}`;
        return el;
    }

    recycle() {
        return true;
    }

    pushQueue(el: HTMLElement) {
        this.recycleQueue.push(el);
        if (this.recycleQueue.length > 40) {
            const len = this.recycleQueue.length;
            for (let i = 0; i < len; i++) {
                const el = this.recycleQueue[i];
                if (el.isConnected) {
                    this.frame.removeChild(el);
                }
            }
            this.recycleQueue.splice(0);
        }
    }

    clearDanmus(el: HTMLDivElement) {
        if (this.option.reuse) {
            el.querySelectorAll(".danmu-item:not(.hide)").forEach((child: HTMLElement) => {
                child.classList.add("hide");
                if (child.style.transition) {
                    child.style.transition = null;
                    child.style.transform = null;
                }
            });
            return;
        }
        el.innerHTML = "";
    }

    resgisterAnimationEvents() {
        // 可以标记，之后批量删除
        this.frame.addEventListener("animationend", (ev: AnimationEvent) => {
            const el = ev.target as HTMLElement;
            this.pushQueue(el);
        });
    }
}

export default AccLayer;
