export enum TraceStrategy {
    radom = "random",
    quque = "queque"
}

export interface TraceMangerOption {
    height: number;
    width: number;
    traceHeight: number;
}

interface Trace {
    tail: number;
    y: number;
}

class TraceManager {
    private option: TraceMangerOption;
    public traces: Trace[];
    private period: number;
    private xaxis: number;
    constructor(option: TraceMangerOption) {
        this.option = option;
        this.period = 0;
        this.traces = [];
        this.createTraces();
        this.xaxis = 0;
    }

    increasePeriod() {
        this.period++;
        this.xaxis += this.option.width;
    }

    get traceCount() {
        return this.traces.length;
    }

    createTraces() {
        const traces = [];

        const { height, traceHeight } = this.option;
        const count = ~~(height / traceHeight);
        for (let i = 0; i < count; i++) {
            traces.push({
                tail: 0,
                y: traceHeight * i
            });
        }
        this.traces = traces;
    }

    reset() {
        this.period = 0;
        this.traces = [];
        this.createTraces();
        this.xaxis = 0;
    }

    resize(option: TraceMangerOption) {
        this.option = option;
        const { traces } = this;
        const oldTraceCount = traces.length;
        const { height, traceHeight } = this.option;
        const count = ~~(height / traceHeight);

        if (count === oldTraceCount) {
            return;
        }

        if (count < oldTraceCount) {
            traces.splice(count);
            return;
        }

        const index = this.findTraceIndex();
        const baseValue = index >= 0 ? traces[index].tail : 0;

        for (let i = oldTraceCount - 1; i < count; i++) {
            traces.push({
                tail: baseValue,
                y: traceHeight * i
            });
        }
    }

    get() {
        const index = this.findTraceIndex();
        const trace = this.traces[index];
        console.log("trace index:", index);
        return {
            index,
            y: trace.y
        };
    }

    set(index: number, x: number, len: number) {
        const trace = this.traces[index];
        trace.tail = this.xaxis + x + len;
    }

    findTraceIndex() {
        const tv = this.traces.map(t => t.tail);
        const min = Math.min(...tv);
        const index = this.traces.findIndex(t => t.tail === min);
        return index;
    }
}

export default TraceManager;
