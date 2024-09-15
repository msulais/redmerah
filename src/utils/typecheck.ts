import { _bigint, _boolean, _function, _isArray, _number, _object, _string, _symbol } from "@/constants/string";

export function isArray(arg: unknown): boolean {
    return Array[_isArray](arg)
}

export function isNumber(arg: unknown): boolean {
    return typeof arg == _number
}

export function isString(arg: unknown): boolean {
    return typeof arg == _string
}

export function isBoolean(arg: unknown): boolean {
    return typeof arg == _boolean
}

export function isFunction(arg: unknown): boolean {
    return typeof arg == _function
}

export function isBigInt(arg: unknown): boolean {
    return typeof arg == _bigint
}

export function isObject(arg: unknown): boolean {
    return typeof arg == _object
}

export function isSymbol(arg: unknown): boolean {
    return typeof arg == _symbol
}