import { arrayForEach } from "./array"
import { elementCreate, elementClick, elementRemove } from "./element"

export function urlEncode(text: string): string {
	return encodeURIComponent(text)
}

export function urlDecode(url: string): string {
	return decodeURIComponent(url)
}

export function urlQueries(url: string): {[key: string]: string} {
	const queryObject: {[key: string]: string} = {}
	const urlParams = new URL(url).searchParams

	arrayForEach(urlParams as unknown as any[], (value, key) => {
		queryObject[key] = value
	})

	return queryObject
}

export function urlQuery(url: string, key: string): string | null {
	const queries = urlQueries(url)

	for (const $key in queries) {
		if ($key == key) return queries[$key]
	}

	return null
}

export function urlCreate(obj: Blob | MediaSource): string {
	return URL.createObjectURL(obj)
}

export function urlRevoke(url: string): void {
	return URL.revokeObjectURL(url)
}

export function urlDownloadFile(url: string, filename: string): void {
	const link = elementCreate("a")
	link.href = url
	link.download = filename
	elementClick(link)
	elementRemove(link)
}

export function urlCurrent(): string {
	return document.URL
}

export function urlOrigin(): string {
	return document.location.origin
}