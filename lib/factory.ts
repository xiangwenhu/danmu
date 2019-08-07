import { get2DTranslate } from "./util";

class Factory {
    private wrapper: HTMLElement;
    private frame1: HTMLDivElement;
    private frame2: HTMLDivElement;
    private sample: HTMLDivElement;
    private HEIGHT: number;
    private WIDTH: number;

    constructor(container: HTMLElement) {
        this.wrapper = container;
        this.sample = document.createElement("div");
        this.sample.className = "danmu-item";
    }


    init() {
        this.HEIGHT = this.wrapper.clientHeight;
        this.WIDTH = this.wrapper.clientWidth;
        this.createFrames(this.wrapper);
        this.periodClear();
    }

    setPosition(videoElement: HTMLElement, wrapper: HTMLElement) {
        const height = videoElement.offsetHeight;
        const width = videoElement.offsetWidth;
        const offsetTop = videoElement.offsetTop;
        const offsetLeft = videoElement.offsetLeft;
        this.HEIGHT = height;
        this.WIDTH = width;
        wrapper.style.cssText = `top:${offsetTop}px;left:${offsetLeft}px;height:${height}px;width:${width}px`;
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
        const poolItems = el.querySelectorAll(".danmu-item.hide");
        const poolLength = poolItems.length;

        const { x } = get2DTranslate(el);
        const leftValue = -x;

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

    createWrapper() {
        const w = document.createElement("div");
        w.className = "slide-danmu";
        this.wrapper = w;
        return w;
    }

    createFrames(wrapper: HTMLElement) {
        const frame1: HTMLDivElement = document.createElement("div");
        frame1.className = "danmu-frame ";
        frame1.id = "frames_frame1";
        const frame2 = frame1.cloneNode() as HTMLDivElement;
        frame2.id = "frames_frame2";

        wrapper.appendChild(frame1);
        wrapper.appendChild(frame2);

        this.frame1 = frame1;
        this.frame2 = frame2;

        this.resgisterAnimationEvents();

        frame1.classList.add("danmu-animation-1");
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
        // setInterval(() => {
        //     const frame = document.querySelector(".danmu-animation-2");
        //     if (!frame) {
        //         return;
        //     }
        //     console.time("periodClear");
        //     const allItems = frame.querySelectorAll(".danmu-item:not(.hide)");
        //     const notInViewItems = Array.from(allItems)
        //         .slice(0, 200)
        //         .filter(function(item) {
        //             const rect = item.getBoundingClientRect();
        //             const b = rect.left + rect.width > 200 && rect.left < 1549;
        //             return !b;
        //         });
        //     notInViewItems.forEach(child => child.classList.add(".hide"));
        //     console.timeEnd("periodClear");
        // }, 1000);
    }

    getNewTopLeft(left: number, top?: number) {
        return {
            top: top || ~~(Math.random() * this.HEIGHT),
            left
        };
    }

    clearDanmus(el: HTMLDivElement) {
        el.innerHTML = "";
        // el.querySelectorAll(".danmu-item:not(.hide)").forEach(child => child.classList.add("hide"));
    }

    resgisterAnimationEvents() {
        const { frame1, frame2, clearDanmus } = this;

        this.frame1.addEventListener("animationend", (ev: AnimationEvent) => {
            switch (ev.animationName) {
                case "animation-stage-1":
                    frame1.classList.remove("danmu-animation-1");
                    frame1.classList.add("danmu-animation-2");
                    frame2.classList.add("danmu-animation-1");
                    break;
                case "animation-stage-2":
                    clearDanmus(frame1);
                    frame1.classList.remove("danmu-animation-2");
                    break;
                default:
                    break;
            }
        });

        frame2.addEventListener("animationend", (ev: AnimationEvent) => {
            switch (ev.animationName) {
                case "animation-stage-1":
                    frame2.classList.remove("danmu-animation-1");
                    frame2.classList.add("danmu-animation-2");
                    frame1.classList.add("danmu-animation-1");
                    break;
                case "animation-stage-2":
                    clearDanmus(frame2);
                    frame2.classList.remove("danmu-animation-2");
                    break;
                default:
                    break;
            }
        });
    }
}

export default Factory;
