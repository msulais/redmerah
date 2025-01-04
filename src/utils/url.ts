import { array_foreach } from "./array"
import { element_create, element_click, element_remove } from "./element"

export function url_encode(text: string): string {
	return encodeURIComponent(text)
}

export function url_decode(url: string): string {
	return decodeURIComponent(url)
}

export function url_queries(url: string): {[key: string]: string} {
	const query_object: {[key: string]: string} = {}
	const url_params = new URL(url).searchParams

	array_foreach(url_params as unknown as any[], (value, key) => {
		query_object[key] = value
	})

	return query_object
}

export function url_query(url: string, key: string): string | null {
	const queries = url_queries(url)

	for (const $key in queries) {
		if ($key == key) return queries[$key]
	}

	return null
}

export function url_create(obj: Blob | MediaSource): string {
	return URL.createObjectURL(obj)
}

export function url_revoke(url: string): void {
	return URL.revokeObjectURL(url)
}

export function url_download_file(url: string, filename: string): void {
	const link = element_create("a")
	link.href = url
	link.download = filename
	element_click(link)
	element_remove(link)
}