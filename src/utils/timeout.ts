export function wait(ms: number): Promise<unknown> {
	return new Promise(resolve => timeout_set(resolve, ms))
}

export function timeout_set(
	handler: TimerHandler,
	timeout?: number | undefined
): number {
	return setTimeout(handler, timeout)
}

export function interval_set(
	handler: TimerHandler,
	timeout?: number | undefined
): number {
	return setInterval(handler, timeout)
}

export function timeout_clear(id: number | undefined): void {
	return clearTimeout(id)
}

export function interval_clear(id: number | undefined): void {
	return clearInterval(id)
}

export function microtask_set(callback: VoidFunction): void {
	return queueMicrotask(callback)
}