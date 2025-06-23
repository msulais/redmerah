export function urlQueries(url: string): {[key: string]: string} {
	const queryObject: {[key: string]: string} = {}
	const urlParams = new URL(url).searchParams
	urlParams.forEach((value, key) => {
		queryObject[key] = value
	})

	return queryObject
}

export function queryUrl(url: string, key: string): string | null {
	const queries = urlQueries(url)

	for (const $key in queries) {
		if ($key == key) return queries[$key]
	}

	return null
}

export function downloadFileByUrl(url: string, filename: string): void {
	const link = document.createElement("a")
	link.href = url
	link.download = filename
	link.click()
	link.remove()
}