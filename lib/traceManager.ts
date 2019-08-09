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
    constructor(option: TraceMangerOption) {
        this.traces = [];
        this.reset(option);
    }

    get traceCount() {
        return this.traces.length;
    }

    createTraces() {
        const { traces } = this;

        const index = this.findTraceIndex();
        const baseValue = index >=0 ? traces[index].tail : 0;

        const { height, traceHeight } = this.option;
        const count = ~~(height / traceHeight);
        for (let i = 0; i < count; i++) {
            if (!this.traces[i]) {
                traces.push({
                    tail: baseValue,
                    y: traceHeight * i
                });
            }
        }
        traces.splice(count);
        this.traces = traces;
    }

    reset(option: TraceMangerOption) {
        this.option = option;
        this.createTraces();
    }

    get() {
        const index = this.findTraceIndex();
        const trace = this.traces[index];
        return {
            index,
            y: trace.y
        };
    }

    set(index: number, len: number) {
        const trace = this.traces[index];
        trace.tail += len;
    }

    findTraceIndex() {
        // x 暂时未使用
        const tv = this.traces.map(t => t.tail);
        const min = Math.min(...tv);
        const index = this.traces.findIndex(t => t.tail === min);
        return index;
    }
}

export default TraceManager;
