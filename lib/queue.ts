const queue = [];

const callBacks = [];
let requestId: number | null = null;

export function dequeue() {
    return queue.splice(0);
}

export function enqueue(data: any[]) {
    queue.push(...data);
}

function clear() {
    if (requestId) {
        cancelAnimationFrame(requestId);
        requestId = null;
    }
}

function startListen() {
    const data = dequeue();
    callBacks.forEach(cb => cb(data));
    requestId = requestAnimationFrame(() => startListen());
}

export function addListener(cb: (data: any[]) => void) {
    callBacks.push(cb);
    if(!requestId){
        startListen();
    }
}

export function removeListener(cb: Function) {
    const index = callBacks.findIndex(c => c === cb);
    if (index >= 0) {
        callBacks.splice(index, 1);
    }
    if (callBacks.length <= 0) {
        clear();
    }
}
