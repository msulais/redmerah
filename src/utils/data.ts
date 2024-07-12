import { _length } from "@/data/string"

export function isVarHasValue(data: unknown): boolean {
    return data != undefined && data != null
}

export function createObject<T>(...data: [key: keyof T, value: unknown][]): T {
    const obj = {} as Record<keyof T, unknown>

    for (const i in data) {
        obj[data[i][0]] = data[i][1]
    }

    return obj as T
}