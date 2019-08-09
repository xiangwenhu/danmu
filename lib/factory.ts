import { measureElement, get2DTranslate } from "./util";
import TraceManager from "./traceManager";

export interface DanmuItem {
    content: string;
    forceDetect?: boolean;
    render?: Function;
    className?: string;
    style?: string;
}

export interface FactoryOption {
    reuse?: boolean;
    duration?: number;
    checkPeriod?: number;
    useMeasure?: boolean;
}

const DEFAULT_OPTION = {
    reuse: false,
    duration: 10000,
    checkPeriod: 1000,
    useMeasure: false
};

const DEFAULT_DANMU_CLASS = "danmu-item";

class Factory {
    private wrapper: HTMLElement;
    private frame1: HTMLDivElement;
    private frame2: HTMLDivElement;
    private sample: HTMLDivElement;
    private HEIGHT: number;
    private WIDTH: number;
    private animatingTime: number;
    private rect: ClientRect;
    private option: FactoryOption;
    private clearTicket: number;
    private pausedTime: number;
    public status: number;
    private traceManager: TraceManager;
    private baseMeasure: any;

    constructor(container: HTMLElement) {
        this.wrapper = container;
        this.sample = document.createElement("div");
        this.sample.className = DEFAULT_DANMU_CLASS;
        this.rect = this.wrapper.getBoundingClientRect();
        this.HEIGHT = this.wrapper.clientHeight;
        this.WIDTH = this.wrapper.clientWidth;
    }

    getTraceHeight() {
        this.baseMeasure = measureElement("div", DEFAULT_DANMU_CLASS, this.wrapper);
        return this.baseMeasure.outerHeight + this.baseMeasure.height;
    }

    init(option: FactoryOption = DEFAULT_OPTION) {
        const { HEIGHT, WIDTH } = this;
        this.option = Object.assign(DEFAULT_OPTION, option);
        this.createFrames(this.wrapper);
        this.periodClear();
        const traceHeight = this.getTraceHeight();
        this.traceManager = new TraceManager({
            height: HEIGHT,
            width: WIDTH,
            traceHeight
        });
    }

    start() {
        if (this.frame1.classList.contains("danmu-animation-1")) {
            console.log("already started...");
            return;
        }

        this.frame1.classList.add("danmu-animation-1");
        this.animatingTime = Date.now();
        this.status = 1;
    }

    stop() {
        this.status = 0;
        this.clearTicket && clearInterval(this.clearTicket);
        this.traceManager.reset();
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
        this.status = 3;
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

    getCurrentX() {
        const { duration } = this.option;
        const x = ((Date.now() - this.animatingTime) / (duration * 2)) * this.WIDTH * 2;
        // const { x } = get2DTranslate(el);
        return x;
    }

    getElementLength(item: DanmuItem, el: HTMLElement) {
        const { useMeasure } = this.option;
        const { forceDetect, content } = item;
        if (forceDetect) {
            return el.getBoundingClientRect().width;
        }
        if (useMeasure) {
            const { baseMeasure } = this;
            return content.length * baseMeasure.letterWidth + baseMeasure.outerWidth;
        }
        return el.getBoundingClientRect().width;
    }

    sendDanmu(queue: DanmuItem[]) {
        if (this.status !== 1 || queue.length <= 0) {
            return;
        }

        const el = document.querySelector(".danmu-animation-1") as HTMLDivElement;
        if (!el) {
            return;
        }
        const { traceManager } = this;
        const poolItems = el.querySelectorAll(".danmu-item.hide");
        const poolLength = poolItems.length;
        const x = this.getCurrentX();
        // 先利用资源池
        if (poolLength > 0) {
            const realLength = Math.min(queue.length, poolLength);
            let newItem = null;
            for (let index = 0; index < realLength; index++) {
                const item = queue[index];
                const { index: traceIndex, y: top } = traceManager.get(x);
                newItem = poolItems[index] as HTMLDivElement;
                newItem.class = DEFAULT_DANMU_CLASS;
                newItem.innerHTML = item.content;
                newItem.style.cssText = `top:${top}px;left:${x}px;${item.style || ""}`;
                if (item.className) {
                    newItem.classList.add(item.className);
                }
                traceManager.set(traceIndex, this.getElementLength(item, newItem));
            }
            queue.splice(0, realLength);
        }

        // 然后创建新节点
        if (queue.length > 0) {
            // const frament = document.createDocumentFragment();
            queue.map(item => {
                const { index: traceIndex, y: top } = traceManager.get(x);
                const newItem = this.createDanmuItem(item, x, top);
                el.appendChild(newItem);
                traceManager.set(traceIndex, this.getElementLength(item, newItem));
                // return newItem;
            });
            // .forEach(item => frament.appendChild(item));
            // el.appendChild(frament);
            queue.splice(0);
        }
    }

    createFrames(wrapper: HTMLElement) {
        const { duration } = this.option;
        const frame1: HTMLDivElement = document.createElement("div");
        frame1.className = "danmu-frame ";
        frame1.style.animationDuration = duration * 2 + "ms";
        frame1.id = "frames_frame1";
        const frame2 = frame1.cloneNode() as HTMLDivElement;
        frame2.style.animationDuration = duration * 2 + "ms";
        frame2.id = "frames_frame2";

        wrapper.appendChild(frame1);
        wrapper.appendChild(frame2);

        this.frame1 = frame1;
        this.frame2 = frame2;

        this.resgisterAnimationEvents();
    }

    createDanmuItem(item: DanmuItem, left: number, top?: number) {
        const { top: t, left: l } = this.getNewTopLeft(left, top);

        const el = this.sample.cloneNode() as HTMLElement;
        el.innerHTML = item.content;
        el.dataset.tLength = item.content.length + "";
        el.style.cssText = `top:${t}px;left:${l}px;${item.style || ""}`;
        if (item.className) {
            el.classList.add(item.className);
        }
        return el;
    }

    periodClear() {
        const { checkPeriod } = this.option;
        this.clearTicket = setInterval(() => {
            const frame = document.querySelector(".danmu-animation-2");
            if (!frame) {
                return;
            }
            const { left, width } = this.rect;
            const right = left + width;
            console.time("periodClear");
            const allItems = frame.querySelectorAll(".danmu-item:not(.hide)");
            const notInViewItems = Array.from(allItems)
                .slice(0, 200)
                .filter(function(item) {
                    const rect = item.getBoundingClientRect();
                    const b = rect.left + rect.width >= left && rect.left <= right;
                    return !b;
                });
            notInViewItems.forEach(child => child.classList.add("hide"));
            console.timeEnd("periodClear");
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
            el.querySelectorAll(".danmu-item:not(.hide)").forEach(child =>
                child.classList.add("hide")
            );
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

export default Factory;
