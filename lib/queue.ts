const queue = [];

export function dequeue() {
    return queue.splice(0);
}

export function dequeueWithCallback(cb) {
    const d = dequeue();
    cb && cb(d);
    requestAnimationFrame(() => dequeueWithCallback(cb));
}

export function enqueue(data: any[]) {
    queue.push(...data);
}

export function startListen(cb: (data: any[]) => void) {
    requestAnimationFrame(() => {
        dequeueWithCallback(cb);      
    });
}
