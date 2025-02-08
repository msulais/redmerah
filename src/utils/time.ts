export function timeWait(ms: number): Promise<unknown> {
	return new Promise(resolve => timeTimerSet(resolve, ms))
}

export function timeTimerSet(
	handler: TimerHandler,
	timeout?: number | undefined
): number {
	return setTimeout(handler, timeout)
}

export function timeIntervalSet(
	handler: TimerHandler,
	timeout?: number | undefined
): number {
	return setInterval(handler, timeout)
}

export function timeTimerClear(id: number | undefined): void {
	return clearTimeout(id)
}

export function timeIntervalClear(id: number | undefined): void {
	return clearInterval(id)
}

export function timeMicrotaskSet(callback: VoidFunction): void {
	return queueMicrotask(callback)
}