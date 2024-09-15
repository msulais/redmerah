import { _length } from "@/constants/string"

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

export function deepClone<T = unknown>(value: T, options?: StructuredSerializeOptions): T {
    return structuredClone(value, options)
}