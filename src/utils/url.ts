import { _click, _remove, _createObjectURL, _download, _forEach, _href, _id, _revokeObjectURL, _searchParams } from "@/constants/string"
import { createElement } from "./element"

export function encodeURL(text: string): string {
    return encodeURIComponent(text)
}

export function decodeURL(url: string): string {
    return decodeURIComponent(url)
}

export function getUrlQueries(url: string): {[key: string]: string} {
    let queryObject: {[key: string]: string} = {}
    const urlParams = new URL(url)[_searchParams]

    urlParams[_forEach]((value, key) => {
        queryObject[key] = value
    })

    return queryObject
}

export function getUrlQuery(url: string, key: string): string | null {
    const queries = getUrlQueries(url)

    for (const $key in queries) {
        if ($key == key) return queries[$key]
    }

    return null
}

export function createObjectURL(obj: Blob | MediaSource): string {
    return URL[_createObjectURL](obj)
}

export function revokeObjectURL(url: string): void {
    return URL[_revokeObjectURL](url)
}

export function downloadFileByURL(url: string, filename: string): void {
    const link = createElement("a")
    link[_href] = url
    link[_download] = filename
    link[_click]()
    link[_remove]()
}