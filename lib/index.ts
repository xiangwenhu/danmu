import Layer from "./layers/layer";
import CommonLayer, { CommonLayerOption } from "./layers/common";
import AccLayer from "./layers/acc"
import { enqueue, addListener, removeListener } from "./queue";

export interface DanmuItem {
    type?: "common" | "fixed" | "acc";
    content?: string;
    forceDetect?: boolean;
    render?: ((any) => HTMLElement) | HTMLElement | string;
    className?: string;
    style?: string;
    acceleration?: number;
    trace?: number;
    duration?: number;
}

type DanmuContent = string | DanmuItem;

function toDanmuItem(danmu: string | DanmuItem): DanmuItem {
    return typeof danmu === "string" ? { content: danmu } : danmu;
}

export class DanmuManager {
    private layers: Layer[] = [];
    private status: 0 | 1 | 2; // 枚举？ 0: 停止  1 运行  2 暂停
    constructor(container: HTMLElement) {
        this.layers.push(new CommonLayer(container));
        this.layers.push(new AccLayer(container));
        this.batch = this.batch.bind(this);
    }

    private batch(data: DanmuItem[]) {
        // 改进批量
        data.forEach(d => {
            const layer = this.layers.find(l => l.type === (d.type || "acc"));
            layer.send([d]);
        });
    }

    sendDanmu(danmu: DanmuContent[] | DanmuItem | string) {
        if (this.status !== 1) {
            return;
        }
        let contents: DanmuItem[] = null;
        if (Array.isArray(danmu)) {
            contents = danmu.map((d: DanmuItem | string) => toDanmuItem(d));
        } else {
            contents = [toDanmuItem(danmu)];
        }

        enqueue(contents);
    }

    init(option?: CommonLayerOption) {
        this.layers.forEach(l => l.init(option));
    }

    start() {
        if (this.status === 1) {
            return;
        }
        this.status = 1;
        this.layers.forEach(l => l.start());
        addListener(this.batch);
    }

    stop() {
        if (this.status !== 1) {
            return;
        }
        this.status = 0;
        this.layers.forEach(l => l.stop());
        removeListener(this.batch);
    }

    pause() {
        if (this.status !== 1) {
            return;
        }    
        this.layers.forEach(l => l.pause());
        this.status = 2
    }

    continue() {
        if (this.status !== 2) {
            return;
        }
        this.layers.forEach(l => l.continue());
        this.status = 1;
    }

    resize(option: CommonLayerOption) {
        this.layers.forEach(l => l.resize(option));
    }

    destory() {
        this.layers.forEach(l => l.destroy());
    }
}

function getDanmuManager(container: HTMLElement): DanmuManager {
    return new DanmuManager(container);
}

export default getDanmuManager;
