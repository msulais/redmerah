import type { HEXColor } from "@/types/color"
import type { NumbersRandomizerNumberType, NumbersRandomizerSort, WordsRandomizerWordCase, ColorsRandomizerColorModel } from "./_enums"

export type Settings = {
	string: {
		length: number
		animation: boolean
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
		animation: boolean
		type: NumbersRandomizerNumberType
		repeat: boolean
		sort: NumbersRandomizerSort
		prefix: string
		suffix: string
		separator: string
		min_length: number
		range: { min: number; max: number }
	}
	words: {
		count: number
		animation: boolean
		list: ItemList
		repeat: boolean
		wordcase: WordsRandomizerWordCase
		prefix: string
		suffix: string
		separator: string
	},
	selection: {
		count: number
		list: ItemList
		animation: boolean
	},
	colors: {
		count: number
		animation: boolean
		model: ColorsRandomizerColorModel
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
		list_names: ItemList
		list_members: ItemList
		animation: boolean
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