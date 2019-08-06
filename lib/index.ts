import Factory from "./factory";
import { enqueue, startListen } from "./queue";

export class DanmuManager {
    private factory: Factory;
    constructor(videoElement: HTMLVideoElement) {
        this.factory = new Factory(videoElement);
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

function getDanmuManager(videoElement: HTMLVideoElement): DanmuManager {
    return new DanmuManager(videoElement);
}

export default getDanmuManager;
