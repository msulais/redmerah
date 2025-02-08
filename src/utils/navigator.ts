import type { USB } from "@/interfaces/usb";

export function navigatorShare(data?: ShareData): Promise<void> | void {
	if (!navigatorCanShare(data)) return;
	return navigator.share(data)
}

export function navigatorCanShare(data?: ShareData): boolean {
	return navigator.canShare(data)
}

export function navigatorClipboardWriteText(data: string): Promise<void> {
	return navigator.clipboard.writeText(data)
}

export function navigatorClipboardWrite(data: ClipboardItems): Promise<void> {
	return navigator.clipboard.write(data)
}

export function navigatorUserAgent(): string {
	return navigator.userAgent
}

export function navigatorUSB(): USB {
	return (navigator as any).usb as USB
}