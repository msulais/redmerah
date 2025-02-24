import type { HEXColor } from "@/types/color"
import type { NumbersRandomizerNumberType, NumbersRandomizerSort, WordsRandomizerWordCase, ColorsRandomizerColorSpace } from "./_enums"

export type Settings = {
	string: {
		length: number
		instant: boolean
		characters: {
			custom: string
			symbols: boolean
			numbers: boolean
			lowercase: boolean
			uppercase: boolean
		}
	}
	numbers: {
		count: number
		instant: boolean
		type: NumbersRandomizerNumberType
		repeat: boolean
		sort: NumbersRandomizerSort
		prefix: string
		suffix: string
		separator: string
		minDigits: number
		range: { min: number; max: number }
	}
	words: {
		count: number
		instant: boolean
		list: ItemList
		repeat: boolean
		wordCase: WordsRandomizerWordCase
		prefix: string
		suffix: string
		separator: string
	},
	selection: {
		count: number
		list: ItemList
		instant: boolean
	},
	colors: {
		count: number
		instant: boolean
		space: ColorsRandomizerColorSpace
		range: {
			hex: { min: number; max: number }
			hsl: {
				h: { min: number; max: number }
				s: { min: number; max: number }
				l: { min: number; max: number }
			}
			rgb: {
				r: { min: number; max: number }
				g: { min: number; max: number }
				b: { min: number; max: number }
			}
		}
	},
	teams: {
		count: number
		listNames: ItemList
		listMembers: ItemList
		instant: boolean
	}
}

export type ItemList = {
	id: number
	name: string
	items: string[]
}

export type Result = {
	string: string
	numbers: string
	words: string
	selection: string[]
	colors: HEXColor[]
	teams: {
		name: string
		members: string[]
	}[]
}