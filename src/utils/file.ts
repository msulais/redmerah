import { element_create, element_click, element_remove } from "./element"
import { url_create, url_download_file, url_revoke } from "./url"

export async function file_open(accept: string | null, multiple: boolean = false, capture?: string): Promise<FileList | null> {
	return new Promise<FileList | null>((ok) => {
		const input = element_create('input')
		input.type = 'file'
		if (accept != null) input.accept = accept
		if (capture != null) input.capture = capture

		input.multiple = multiple
		element_click(input)

		input.onchange = () => {
			ok(input.files)
			element_remove(input)
		}
		input.oncancel = () =>{
			ok(null)
			element_remove(input)
		}
	})
}

export function file_download(blob: Blob, filename: string): void {
	const url = url_create(blob)
	url_download_file(url, filename)
	url_revoke(url)
}

export function file_read_as_text(blob: Blob, encoding?: string): Promise<string> {
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