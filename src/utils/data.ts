import { _length } from "@/data/string"

export function isVarHasValue(data: unknown): boolean {
    return data != undefined && data != null
}

export function createObject<T>(...data: [keyof T, unknown][]): T {
    const obj = {} as Record<keyof T, unknown>

    for (let i = 0; i < data[_length]; i++) {
        obj[data[i][0]] = data[i][1]
    }

    return obj as T
}