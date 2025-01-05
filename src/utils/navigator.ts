export function navigator_share(data?: ShareData): Promise<void> | void {
	if (!navigator_can_share(data)) return;
	return navigator.share(data)
}

export function navigator_can_share(data?: ShareData): boolean {
	return navigator.canShare(data)
}

export function navigator_clipboard_writetext(data: string): Promise<void> {
	return navigator.clipboard.writeText(data)
}

export function navigator_clipboard_write(data: ClipboardItems): Promise<void> {
	return navigator.clipboard.write(data)
}

export function navigator_useragent(): string {
	return navigator.userAgent
}