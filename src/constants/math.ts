import { _PI, _E } from "./string"

export const getMath = Math
export const getNumber = Number
export const mathPI = getMath[_PI]
export const mathE = getMath[_E]
export const positiveInfinity = getNumber.POSITIVE_INFINITY
export const negativeInfinity = getNumber.NEGATIVE_INFINITY