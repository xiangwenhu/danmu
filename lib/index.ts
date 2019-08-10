import CommonLayer, { CommonLayerOption } from "./layers/common";
import { enqueue, addListener, removeListener } from "./queue";


export interface DanmuItem {
    type?: "common" | "fixed" | "acc",
    content?: string;
    forceDetect?: boolean;
    render?: ((any) => HTMLElement) | HTMLElement | string;
    className?: string;
    style?: string;
    acceleration?: number;
    trace?: number;
}


type DanmuContent = string | DanmuItem;

function toDanmuItem(danmu: string | DanmuItem): DanmuItem {
    return typeof danmu === "string" ? { content: danmu } : danmu;
}

export class DanmuManager {
    private commonLayer: CommonLayer;
    constructor(container: HTMLElement) {
        this.commonLayer = new CommonLayer(container);
        this.batch = this.batch.bind(this);
    }

    private batch(data: DanmuItem[]) {
        this.commonLayer.send(data);
    }

    sendDanmu(danmu: DanmuContent[] | DanmuItem | string ) {
        if (this.commonLayer.status !== 1) {
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
        this.commonLayer.init(option);
    }

    start() {
        this.commonLayer.start();
        addListener(this.batch);
    }

    stop() {
        this.commonLayer.stop();
        removeListener(this.batch);
    }

    pause() {
        this.commonLayer.pause();
    }

    continue() {
        this.commonLayer.continue();
    }

    resize(option: CommonLayerOption){
        this.commonLayer.resize(option);
    }    
}

function getDanmuManager(container: HTMLElement): DanmuManager {
    return new DanmuManager(container);
}

export default getDanmuManager;
