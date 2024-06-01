import { _forEach, _searchParams } from "@/data/string"

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