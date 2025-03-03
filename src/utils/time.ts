export function timeWait(ms: number): Promise<unknown> {
	return new Promise(resolve => setTimeout(resolve, ms))
}