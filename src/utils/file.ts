import { urlDownloadFile } from "./url"

export async function fileOpen(
	accept: string | null,
	multiple: boolean = false,
	capture?: string
): Promise<FileList | null> {
	return new Promise<FileList | null>((ok) => {
		const input = document.createElement('input')
		input.type = 'file'
		if (accept != null) input.accept = accept
		if (capture != null) input.capture = capture

		input.multiple = multiple
		input.click()

		input.onchange = () => {
			ok(input.files)
			input.remove()
		}
		input.oncancel = () =>{
			ok(null)
			input.remove()
		}
	})
}

export function fileDownload(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob)
	urlDownloadFile(url, filename)
	URL.revokeObjectURL(url)
}

export function fileReadAsText(blob: Blob, encoding?: string): Promise<string> {
	return new Promise((ok) => {
		const reader = new FileReader()
		reader.readAsText(blob, encoding)
		reader.onload = (ev) => {
			const t = ev.target
			if (!t) return ok('');

			ok(t.result as string)
		}
		reader.onerror = () => ok('')
		reader.onabort = () => ok('')
	})
}