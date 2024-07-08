import type { HEXColor } from "@/types/color"
import type { NumbersRandomizerNumberType, NumbersRandomizerSort, WordsRandomizerWordCase, ColorsRandomizerColorModel } from "./_enums"

export type Settings = {
    string: {
        length: number
        animation: boolean
        characters: {
            customCharacter: string
            symbols: boolean
            numbers: boolean
            alphabetLowercase: boolean
            alphabetUppercase: boolean
        }
    }
    numbers: {
        count: number
        animation: boolean
        numberType: NumbersRandomizerNumberType
        repeat: boolean
        sort: NumbersRandomizerSort
        prefix: string
        suffix: string
        separator: string
        minDecimalLength: number
        range: { min: number; max: number }
    }
    words: {
        count: number
        animation: boolean
        list: ListItems
        repeat: boolean
        wordCase: WordsRandomizerWordCase
        prefix: string
        suffix: string
        separator: string
    },
    selection: {
        count: number
        list: ListItems
        animation: boolean
    },
    colors: {
        count: number
        animation: boolean
        colorModel: ColorsRandomizerColorModel
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
        namesList: ListItems
        membersList: ListItems
        animation: boolean
    }
}

export type ListItems = {
    id: number
    name: string
    items: string[]
}

export type Result = {
    string: string
    numbers: string
    words: string
    selection: {
        selected: boolean
        text: string
    }[]
    colors: HEXColor[]
    teams: {
        name: string
        members: string[]
    }[]
}