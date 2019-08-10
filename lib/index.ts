import Factory, { FactoryOption} from "./factory";
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
    private factory: Factory;
    constructor(container: HTMLElement) {
        this.factory = new Factory(container);
        this.batch = this.batch.bind(this);
    }

    private batch(data: any[]) {
        this.factory.sendDanmu(data);
    }

    sendDanmu(danmu: DanmuContent[] | DanmuItem | string ) {
        if (this.factory.status !== 1) {
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

    init(option?: FactoryOption) {
        this.factory.init(option);
    }

    start() {
        this.factory.start();
        addListener(this.batch);
    }

    stop() {
        this.factory.stop();
        removeListener(this.batch);
    }

    pause() {
        this.factory.pause();
    }

    continue() {
        this.factory.continue();
    }

    resize(option: FactoryOption){
        this.factory.resize(option);
    }    
}

function getDanmuManager(container: HTMLElement): DanmuManager {
    return new DanmuManager(container);
}

export default getDanmuManager;
