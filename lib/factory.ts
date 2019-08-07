// import { get2DTranslate } from "./util";

export interface FactoryOption {
    reuse: boolean;
    duration: number;
    checkPeriod: number;
}

const DEFAULT_OPTION = {
    reuse: false,
    duration: 20000,
    checkPeriod: 1000
};

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

    constructor(container: HTMLElement) {
        this.wrapper = container;
        this.sample = document.createElement("div");
        this.sample.className = "danmu-item";
        this.rect = this.wrapper.getBoundingClientRect();
        this.HEIGHT = this.wrapper.clientHeight;
        this.WIDTH = this.wrapper.clientWidth;
    }

    init(option: FactoryOption = DEFAULT_OPTION) {
        this.option = option;
        this.createFrames(this.wrapper);
        this.periodClear();
    }

    start() {
        this.frame1.classList.add("danmu-animation-1");
        this.animatingTime = Date.now();
    }

    stop() {
        this.clearTicket && clearInterval(this.clearTicket);
        if (this.frame1) {
            this.frame1.classList.remove("danmu-animation-1", "danmu-animation-2");
            this.frame1.innerHTML = "";
        }
        if (this.frame2) {
            this.frame1.classList.remove("danmu-animation-1", "danmu-animation-2");
            this.frame1.innerHTML = "";
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
    }

    continue(){
        if (!this.frame1) {
            return;
        }
        this.frame1.style.animationPlayState = "running";
        if (!this.frame2) {
            return;
        }
        this.frame2.style.animationPlayState = "running";  
    }

    sendDanmu(queue: any[]) {
        const el = document.querySelector(".danmu-animation-1");
        if (!el) {
            return;
        }

        if (queue.length <= 0) {
            return;
        }
        // console.time("batch crate");
        const { duration } = this.option;
        const poolItems = el.querySelectorAll(".danmu-item.hide");
        const poolLength = poolItems.length;

        const x = ((Date.now() - this.animatingTime) / duration) * this.WIDTH * 2;
        // const { x: x2 } = get2DTranslate(el);

        const leftValue = x;

        // 先利用资源池
        if (poolLength > 0) {
            const realLength = Math.min(queue.length, poolLength);
            let newItem = null;
            for (let index = 0; index < realLength; index++) {
                const { top, left } = this.getNewTopLeft(leftValue);
                newItem = poolItems[index];
                newItem.classList.remove("hide");
                newItem.innerHTML = queue[index];
                newItem.style.cssText = `left:${left}px;top:${top}px`;
            }
            queue.splice(0, realLength);
        }

        // 然后创建新节点
        if (queue.length > 0) {
            const frament = document.createDocumentFragment();
            queue
                .map(text => this.createDanmuItem(text, leftValue))
                .forEach(item => frament.appendChild(item));
            el.appendChild(frament);
            queue.splice(0);
        }

        // console.timeEnd("batch crate");
    }

    createFrames(wrapper: HTMLElement) {
        const { duration } = this.option;
        const frame1: HTMLDivElement = document.createElement("div");
        frame1.className = "danmu-frame ";
        frame1.style.animationDuration = duration + "ms";
        frame1.id = "frames_frame1";
        const frame2 = frame1.cloneNode() as HTMLDivElement;
        frame2.style.animationDuration = duration + "ms";
        frame2.id = "frames_frame2";

        wrapper.appendChild(frame1);
        wrapper.appendChild(frame2);

        this.frame1 = frame1;
        this.frame2 = frame2;

        this.resgisterAnimationEvents();
    }

    createDanmuItem(text: string, left: number, top?: number) {
        const { top: t, left: l } = this.getNewTopLeft(left, top);

        const el = this.sample.cloneNode() as HTMLElement;
        el.innerHTML = text;
        el.dataset.tLength = text.length + "";
        el.style.top = t + "px";
        el.style.left = l + "px";
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
            top: top || ~~(Math.random() * this.HEIGHT),
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
