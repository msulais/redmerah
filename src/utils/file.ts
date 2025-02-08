import { elementCreate, elementClick, elementRemove } from "./element"
import { eventTarget } from "./event"
import { urlCreate, urlDownloadFile, urlRevoke } from "./url"

export async function fileOpen(
	accept: string | null,
	multiple: boolean = false,
	capture?: string
): Promise<FileList | null> {
	return new Promise<FileList | null>((ok) => {
		const input = elementCreate('input')
		input.type = 'file'
		if (accept != null) input.accept = accept
		if (capture != null) input.capture = capture

		input.multiple = multiple
		elementClick(input)

		input.onchange = () => {
			ok(input.files)
			elementRemove(input)
		}
		input.oncancel = () =>{
			ok(null)
			elementRemove(input)
		}
	})
}

export function fileDownload(blob: Blob, filename: string): void {
	const url = urlCreate(blob)
	urlDownloadFile(url, filename)
	urlRevoke(url)
}

export function fileReadAsText(blob: Blob, encoding?: string): Promise<string> {
	return new Promise((ok) => {
		const reader = new FileReader()
		reader.readAsText(blob, encoding)
		reader.onload = (ev) => {
			const t = eventTarget(ev)
			if (!t) return ok('');

			ok(t.result as string)
		}
		reader.onerror = () => ok('')
		reader.onabort = () => ok('')
	})
}