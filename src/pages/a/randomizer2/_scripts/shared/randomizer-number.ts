import type { EnumOf } from "@/types/collections"

export const NumberTypes = {
	Hexadecimal: 16,
	Decimal: 10,
	Octal: 6,
	Binary: 2
} as const
export type NumberTypes = EnumOf<typeof NumberTypes>

export const SortDirection = {
	Ascending: 'ascending',
	Descending: 'descending',
	None: 'none'
} as const
export type SortDirection = EnumOf<typeof SortDirection>