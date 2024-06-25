import { _floor, _isNaN, _max, _min, _pow, _random, _round } from "@/data/string"
import { isVarHasValue } from "./data"

export function numberParse(num: string, isInt?: boolean, radix?: number): number {
    return isInt? parseInt(num, radix) : parseFloat(num)
}

export function mathPow(x: number, y: number): number {
    return Math[_pow](x, y)
}

export function mathMin(...values: number[]): number {
    return Math[_min](...values)
}

export function mathMax(...values: number[]): number {
    return Math[_max](...values)
}

export function mathRound(x: number): number {
    return Math[_round](x)
}

export function mathFloor(x: number): number {
    return Math[_floor](x)
}

export function mathRandom(): number {
    return Math[_random]()
}

export function numberIsNaN(x: number, fallback?: number): boolean | number {
    if (isVarHasValue(fallback)){
        if (Number[_isNaN](x)) return fallback!
        return x
    }
    return Number[_isNaN](x)
}