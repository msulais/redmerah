import { _raw } from "@/data/string"

export const NUMBER_REGEX = String[_raw]`\d+(?:\.\d+)?`
export const WORD_OPERATOR_REGEX = String[_raw]`(?:or|xor|and|lsh|rsh|mod)`
export const FUNCTION_REGEX = String[_raw]`(?:sqrt|not|abs|log|ln|ceil|floor|round|sin|cos|tan|csc|sec|cot|sinh|cosh|tanh|csch|sech|coth|asin|acos|atan|acsc|asec|acot|asinh|acosh|atanh|acsch|asech|acoth)`