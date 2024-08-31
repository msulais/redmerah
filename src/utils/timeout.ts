export function timeout(ms: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function setTimeDelayed(handler: TimerHandler, timeout?: number | undefined): number {
    return setTimeout(handler, timeout)
}

export function setTimeInterval(handler: TimerHandler, timeout?: number | undefined): number {
    return setInterval(handler, timeout)
}

export function clearTimeDelayed(id: number | undefined): void {
    return clearTimeout(id)
}

export function clearTimeInterval(id: number | undefined): void {
    return clearInterval(id)
}

export function setMicrotask(callback: VoidFunction): void {
    return queueMicrotask(callback)
}