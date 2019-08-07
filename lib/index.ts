import Factory from "./factory";
import { enqueue, startListen } from "./queue";

export class DanmuManager {
    private factory: Factory;
    constructor(container: HTMLElement) {
        this.factory = new Factory(container);
        this.factory.init();
        startListen(this.batch.bind(this));
    }

    private batch(data: any[]) {
        this.factory.sendDanmu(data);
    }

    sendDanmu(text: string | string[]) {
        const contents = Array.isArray(text) ? text : [text];
        enqueue(contents);
    }
}

function getDanmuManager(container: HTMLElement): DanmuManager {
    return new DanmuManager(container);
}

export default getDanmuManager;
