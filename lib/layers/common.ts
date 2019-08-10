import { measureElement, get2DTranslate } from "../util";
import Layer from "./layer";
import TraceManager from "../traceManager";
import { DanmuItem } from "../index";

export interface CommonLayerOption {
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

const DEFAULT_DANMU_CLASS = "danmu-item";
const MIN_SLIDE_LENGTH = 2.5;

class CommonLayer extends Layer {
    private frame1: HTMLDivElement;
    private frame2: HTMLDivElement;
    private sample: HTMLDivElement;
    private HEIGHT: number;
    private WIDTH: number;
    private animatingTime: number;
    private rect: ClientRect;
    private option: CommonLayerOption;
    private clearTicket: number;
    private pausedTime: number;
    private traceManager: TraceManager;

    constructor(container: HTMLElement) {
        super(container);
        this.sample = document.createElement("div");
        this.sample.className = DEFAULT_DANMU_CLASS;
        this.rect = container.getBoundingClientRect();
        this.HEIGHT = container.clientHeight;
        this.WIDTH = container.clientWidth;
        this.type = "common";
    } 

    init(option: CommonLayerOption = DEFAULT_OPTION) {
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
    }

    resize(option: CommonLayerOption) {
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
        this.frame2.style.animationDuration = option.duration * 2 + "ms";
        this.frame1.style.animationDuration = option.duration * 2 + "ms";
        // TODO:: 计算
        this.animatingTime = Date.now();

        this.option.duration = option.duration;
    }

    start() {
        if (this.frame1.classList.contains("danmu-animation-1")) {
            console.log("already started...");
            return;
        }

        this.frame1.classList.add("danmu-animation-1");
        this.animatingTime = Date.now();
        this.status = 1;
        this.traceManager.reset();
    }

    stop() {
        this.status = 0;
        this.clearTicket && clearInterval(this.clearTicket);

        if (this.frame1) {
            this.frame1.classList.remove("danmu-animation-1", "danmu-animation-2");
            this.frame1.innerHTML = "";
            // 复位
            this.frame1.getBoundingClientRect();
        }
        if (this.frame2) {
            this.frame2.classList.remove("danmu-animation-1", "danmu-animation-2");
            this.frame2.innerHTML = "";
            // 复位
            this.frame2.getBoundingClientRect();
        }
    }

    pause() {
        if (!this.frame1) {
            return;
        }
        this.frame1.style.animationPlayState = "paused";
        if (!this.frame2) {
            return;
        }
        this.frame2.style.animationPlayState = "paused";
        this.pausedTime = Date.now();
        this.status = 2;
    }

    continue() {
        if (!this.frame1) {
            return;
        }
        this.frame1.style.animationPlayState = "running";
        if (!this.frame2) {
            return;
        }
        this.frame2.style.animationPlayState = "running";
        this.animatingTime += Date.now() - this.pausedTime;
        this.pausedTime = 0;
        this.status = 1;
    }

    getCurrentX(el: HTMLElement) {
        // const { duration } = this.option;
        //const x = ((Date.now() - this.animatingTime) / (duration * 2)) * this.WIDTH * 2;
        const { x } = get2DTranslate(el);
        return -x;
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
        this.traceManager.set(traceIndex, x, len);
    }

    send(queue: DanmuItem[]) {
        if (this.status !== 1 || queue.length <= 0) {
            return;
        }

        const el = document.querySelector(".danmu-animation-1") as HTMLDivElement;
        if (!el) {
            return;
        }
        const poolItems = el.querySelectorAll(".danmu-item.hide");
        const poolLength = poolItems.length;
        const x = this.getCurrentX(el);
        // 先利用资源池
        if (poolLength > 0) {
            const realLength = Math.min(queue.length, poolLength);
            let newItem = null;
            for (let index = 0; index < realLength; index++) {
                const item = queue[index];
                const { index: traceIndex, y: top } = this.getTraceInfo(item);
                newItem = poolItems[index] as HTMLDivElement;
                newItem.class = DEFAULT_DANMU_CLASS;
                newItem.innerHTML = item.content;
                newItem.style.cssText = `top:${top}px;left:${x}px;${item.style || ""}`;
                if (item.className) {
                    newItem.classList.add(item.className);
                }
                this.setTraceInfo(traceIndex, x, this.getElementLength(item, newItem));
            }
            queue.splice(0, realLength);
        }

        // 然后创建新节点
        if (queue.length > 0) {
            // const frament = document.createDocumentFragment();
            const newItems = queue.map(item => {
                const { index: traceIndex, y: top } = this.getTraceInfo(item);
                const newItem = this.createDanmuItem(item, x, top);
                el.appendChild(newItem);
                this.setTraceInfo(traceIndex, x, this.getElementLength(item, newItem));
                return el;
                // return newItem;
            });
            // .forEach(item => frament.appendChild(item));
            // el.appendChild(frament);
            queue.splice(0);
        }
    }

    createFrames(wrapper: HTMLElement) {
        const { duration, slideRatio } = this.option;
        const frame1: HTMLDivElement = document.createElement("div");
        frame1.className = "danmu-frame danmu-frame-common";
        frame1.style.animationDuration = duration * 2 + "ms";
        frame1.id = "frames_frame1";
        const frame2 = frame1.cloneNode() as HTMLDivElement;
        frame2.style.animationDuration = duration * 2 + "ms";
        frame2.id = "frames_frame2";

        if (slideRatio) {
            const rate = Math.max(MIN_SLIDE_LENGTH, slideRatio);
            frame1.style.width = `${rate * 100}%`;
            frame2.style.width = `${rate * 100}%`;
        }

        wrapper.appendChild(frame1);
        wrapper.appendChild(frame2);

        this.frame1 = frame1;
        this.frame2 = frame2;

        this.resgisterAnimationEvents();
    }

    createDanmuItem(item: DanmuItem, left: number, top?: number) {
        let el = item.render && this.createDanmuWithRender(item, left, top);
        if (el) {
            return el;
        }

        const { top: t, left: l } = this.getNewTopLeft(left, top);
        el = this.sample.cloneNode() as HTMLElement;
        el.innerHTML = item.content;
        el.dataset.tLength = item.content.length + "";
        el.style.cssText = `top:${t}px;left:${l}px;${item.style || ""}`;
        if (item.className) {
            el.classList.add(item.className);
        }
        return el;
    }

    createDanmuWithRender(item: DanmuItem, left: number, top?: number) {
        const data = { left, top, class: item.className, style: item.style };
        if (typeof item.render === "function") {
            const el = item.render(data);
            if (el instanceof HTMLElement) {
                if (!el.classList.contains(DEFAULT_DANMU_CLASS)) {
                    el.classList.add(DEFAULT_DANMU_CLASS);
                }
                return el;
            }
            if (typeof el === "string") {
                return this.wrapperHTMLStringDanmu(left, top, item.render);
            }
        } else if (typeof item.render === "object" && item.render instanceof HTMLElement) {
            return item.render;
        } else if (typeof item.render === "string") {
            return this.wrapperHTMLStringDanmu(left, top, item.render);
        }
        return null;
    }

    wrapperHTMLStringDanmu(left, top, content) {
        const { top: t, left: l } = this.getNewTopLeft(left, top);
        const el = this.sample.cloneNode() as HTMLElement;
        el.innerHTML = content;
        el.style.cssText = `top:${t}px;left:${l}px;`;
        return el;
    }

    recycle() {
        const { checkPeriod } = this.option;
        this.clearTicket = setInterval(() => {
            const frame = document.querySelector(".danmu-animation-2");
            if (!frame) {
                return;
            }
            const { left, width } = this.rect;
            const right = left + width;
            console.time("recycle");
            const allItems = frame.querySelectorAll(".danmu-item:not(.hide)");
            const notInViewItems = Array.from(allItems)
                .slice(0, 120)
                .filter(function(item) {
                    const rect = item.getBoundingClientRect();
                    const b = rect.left + rect.width >= left && rect.left <= right;
                    return !b;
                });
            notInViewItems.forEach((child: HTMLElement) => {
                child.style.cssText = "";
                child.classList.add("hide");
            });
            console.timeEnd("recycle");
        }, checkPeriod);
    }

    getNewTopLeft(left: number, top?: number) {
        return {
            top: top !== undefined ? top : ~~(Math.random() * this.HEIGHT),
            left
        };
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
        const { frame1, frame2 } = this;
        this.frame1.addEventListener("animationend", (ev: AnimationEvent) => {
            switch (ev.animationName) {
                case "animation-stage-1":
                    this.animatingTime = Date.now();
                    frame1.classList.remove("danmu-animation-1");
                    frame1.classList.add("danmu-animation-2");
                    frame2.classList.add("danmu-animation-1");

                    frame1.style.zIndex = "11";
                    frame2.style.zIndex = "10";
                    this.traceManager.increasePeriod();
                    break;
                case "animation-stage-2":
                    this.clearDanmus(frame1);
                    frame1.classList.remove("danmu-animation-2");
                    break;
                default:
                    break;
            }
        });

        frame2.addEventListener("animationend", (ev: AnimationEvent) => {
            switch (ev.animationName) {
                case "animation-stage-1":
                    this.animatingTime = Date.now();
                    frame2.classList.remove("danmu-animation-1");
                    frame2.classList.add("danmu-animation-2");
                    frame1.classList.add("danmu-animation-1");

                    frame2.style.zIndex = "11";
                    frame1.style.zIndex = "10";
                    this.traceManager.increasePeriod();
                    break;
                case "animation-stage-2":
                    this.clearDanmus(frame2);
                    frame2.classList.remove("danmu-animation-2");
                    break;
                default:
                    break;
            }
        });
    }
}

export default CommonLayer;
