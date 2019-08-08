import Factory, { FactoryOption } from "./factory";
import { enqueue, addListener, removeListener } from "./queue";

export class DanmuManager {
    private factory: Factory;
    constructor(container: HTMLElement) {
        this.factory = new Factory(container);
        this.batch = this.batch.bind(this);
    }

    private batch(data: any[]) {
        this.factory.sendDanmu(data);
    }

    sendDanmu(text: string | string[]) {
        if (this.factory.status !== 1) {
            return;
        }
        const contents = Array.isArray(text) ? text : [text];
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
}

function getDanmuManager(container: HTMLElement): DanmuManager {
    return new DanmuManager(container);
}

export default getDanmuManager;
