import type { EnumOf } from "@/types/collections"

export const ColorSpaces = {
	HEX: 'hex',
	HSL: 'hsl',
	RGB: 'rgb',
} as const
export type ColorSpaces = EnumOf<typeof ColorSpaces>