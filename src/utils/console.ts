export function consoleAssert(condition?: boolean, ...data: any[]): void {
	return console.assert(condition, ...data)
}