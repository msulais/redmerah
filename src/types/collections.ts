export type KeyOfMap<T extends Map<unknown, unknown>> = (
	T extends Map<infer U, unknown>? U : unknown
)

export type ValueOfMap<T extends Map<unknown, unknown>> = (
	T extends Map<unknown, infer U>? U : unknown
)

export type ValueOfSet<T extends Set<unknown>> = (
	T extends Set<infer U>? U : unknown
)

export type EnumOf<T> = T[keyof T]

export type Nullable<T> = {
    [P in keyof T]: T[P] | null
}