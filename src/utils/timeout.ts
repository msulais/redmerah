export function wait(ms: number): Promise<unknown> {
	return new Promise(resolve => startTimeout(resolve, ms));
}

export function startTimeout(handler: TimerHandler, timeout?: number | undefined): number {
	return setTimeout(handler, timeout)
}

export function startInterval(handler: TimerHandler, timeout?: number | undefined): number {
	return setInterval(handler, timeout)
}

export function endTimeout(id: number | undefined): void {
	return clearTimeout(id)
}

export function endInterval(id: number | undefined): void {
	return clearInterval(id)
}

export function setMicrotask(callback: VoidFunction): void {
	return queueMicrotask(callback)
}