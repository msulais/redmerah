import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ColorsRandomizerSpace, NumbersRandomizerType, NumbersRandomizerSort, Pages, WordsRandomizerCase } from "./_enums"
import type { HEXColor } from "@/types/color"
import { pxToRem } from "@/utils/css"

export const HIDE_NAVIGATION = pxToRem(900)
export const DEVICE_WIDTH_SMALL = pxToRem(650)
export const DEFAULT_PAGE: Pages = Pages.string
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
export const DEFAULT_INSTANT_RESULT = false
export const ANIMALS = ["Anoa", "Bear", "Chimpanzee", "Dolphin", "Eagle", "Elephant", "Giraffe", "Gorilla", "Kangaroo", "Koala", "Komodo", "Lion", "Orangutan", "Owl", "Panda", "Parrot", "Snake", "Tiger", "Whale", "Wolf", "Zebra"]
export const COLORS = ["Black", "Blue", "Gray", "Green", "Orange", "Pink", "Purple", "Red", "White", "Yellow"]
export const TEAMS_NAMES = ['Alpha', 'Beta', 'Delta']
export const PERSON_NAMES = ["Alice", "Ava", "Bob", "Charlotte", "Charlie", "David", "Emily", "Frank", "Grace", "Henry", "Isabella", "Jack", "James", "Kevin", "Lily", "Luna", "Mia", "Michael", "Noah", "Olivia", "Owen", "Peter", "Sophia", "Sophia", "William"]
export const LOREM_IPSUM = ["Ad", "Adipiscing", "Aliqua", "Aliquip", "Amet", "Anim", "Aute", "Cillum", "Commodo", "Consectetur", "Consequat", "Culpa", "Cupidatat", "Deserunt", "Do", "Dolor", "Dolore", "Duis", "Ea", "Eiusmod", "Elit", "Enim", "Esse", "Et", "Eu", "Ex", "Excepteur", "Exercitation", "Est", "Fugiat", "Id", "Incididunt", "In", "Ipsum", "Irure", "Laboris", "Laborum", "Labore", "Lorem", "Magna", "Minim", "Mollit", "Nisi", "Non", "Nostrud", "Nulla", "Occaecat", "Officia", "Pariatur", "Proident", "Qui", "Quis", "Reprehenderit", "Sed", "Sit", "Sint", "Sunt", "Tempor", "Ullamco", "Ut", "Velit", "Veniam", "Voluptate"]
export const DEFAULT_LISTS = [
	{ id: 1, name: 'Animals'     , items: [...ANIMALS     ] },
	{ id: 2, name: 'Colors'      , items: [...COLORS      ] },
	{ id: 3, name: 'Lorem Ipsum' , items: [...LOREM_IPSUM ] },
	{ id: 4, name: 'Person Names', items: [...PERSON_NAMES] },
	{ id: 5, name: 'Teams Names' , items: [...TEAMS_NAMES ] },
]
export const DEFAULT_STRING_OUTPUT = 'g0fRLm9Z'
export const DEFAULT_STRING_LENGTH = 8
export const DEFAULT_STRING_CUSTOM = ''
export const DEFAULT_STRING_LOWERCASE = true
export const DEFAULT_STRING_UPPERCASE = true
export const DEFAULT_STRING_NUMBERS = true
export const DEFAULT_STRING_SYMBOLS = false
export const DEFAULT_WORDS_COUNT = 8
export const DEFAULT_WORDS_LIST_ID = DEFAULT_LISTS[2].id
export const DEFAULT_WORDS_PREFIX = ''
export const DEFAULT_WORDS_SUFFIX = ''
export const DEFAULT_WORDS_SEPARATOR = ' '
export const DEFAULT_WORDS_CASE = WordsRandomizerCase.none
export const DEFAULT_WORDS_REPEAT = true
export const DEFAULT_WORDS_OUTPUT = 'Minim Pariatur Consequat Voluptate Non Laboris Qui Adipiscing'
export const DEFAULT_NUMBERS_COUNT = 8
export const DEFAULT_NUMBERS_DIGITS = 0
export const DEFAULT_NUMBERS_TYPE = NumbersRandomizerType.decimal
export const DEFAULT_NUMBERS_PREFIX = ''
export const DEFAULT_NUMBERS_SUFFIX = ''
export const DEFAULT_NUMBERS_SEPARATOR = ', '
export const DEFAULT_NUMBERS_MIN = 0
export const DEFAULT_NUMBERS_MAX = 0xffff
export const DEFAULT_NUMBERS_REPEAT = true
export const DEFAULT_NUMBERS_SORT = NumbersRandomizerSort.none
export const DEFAULT_NUMBERS_OUTPUT = '19783, 3086, 42351, 3081, 5264, 38401, 24394, 19826'
export const DEFAULT_COLORS_SPACE: ColorsRandomizerSpace = ColorsRandomizerSpace.rgb
export const DEFAULT_COLORS_COUNT = 5
export const DEFAULT_COLORS_HEX_MIN = 0
export const DEFAULT_COLORS_HEX_MAX = 0xffffff
export const DEFAULT_COLORS_HSL_H_MIN = 0
export const DEFAULT_COLORS_HSL_H_MAX = 360
export const DEFAULT_COLORS_HSL_S_MIN = 0
export const DEFAULT_COLORS_HSL_S_MAX = 100
export const DEFAULT_COLORS_HSL_L_MIN = 0
export const DEFAULT_COLORS_HSL_L_MAX = 100
export const DEFAULT_COLORS_RGB_R_MIN = 0
export const DEFAULT_COLORS_RGB_R_MAX = 0xff
export const DEFAULT_COLORS_RGB_G_MIN = 0
export const DEFAULT_COLORS_RGB_G_MAX = 0xff
export const DEFAULT_COLORS_RGB_B_MIN = 0
export const DEFAULT_COLORS_RGB_B_MAX = 0xff
export const DEFAULT_COLORS_OUTPUT: HEXColor[] = ['#4CA185', '#7F7821', '#6CCF92', '#4ED532', '#A9A163']
export const DEFAULT_SELECTION_COUNT = 4
export const DEFAULT_SELECTION_LIST = DEFAULT_LISTS[0]
export const DEFAULT_SELECTION_LIST_ID = DEFAULT_SELECTION_LIST.id
export const DEFAULT_SELECTION_OUTPUT = [
	DEFAULT_SELECTION_LIST.items[0],
	DEFAULT_SELECTION_LIST.items[5],
	DEFAULT_SELECTION_LIST.items[2],
	DEFAULT_SELECTION_LIST.items[8],
]
export const DEFAULT_TEAMS_COUNT = 3
export const DEFAULT_TEAMS_MEMBERS = DEFAULT_LISTS[3]
export const DEFAULT_TEAMS_MEMBERS_ID = DEFAULT_TEAMS_MEMBERS.id
export const DEFAULT_TEAMS_NAMES = DEFAULT_LISTS[4]
export const DEFAULT_TEAMS_NAMES_ID = DEFAULT_TEAMS_NAMES.id
export const DEFAULT_TEAMS_OUTPUT = [
	[
		DEFAULT_TEAMS_NAMES.items[0],
		...DEFAULT_TEAMS_MEMBERS.items.slice(
			0,
			Math.ceil(DEFAULT_TEAMS_MEMBERS.items.length / 3)
		)
	],
	[
		DEFAULT_TEAMS_NAMES.items[1],
		...DEFAULT_TEAMS_MEMBERS.items.slice(
			Math.ceil(DEFAULT_TEAMS_MEMBERS.items.length / 3),
			Math.ceil(DEFAULT_TEAMS_MEMBERS.items.length / 3) * 2
		)
	],
	[
		DEFAULT_TEAMS_NAMES.items[2],
		...DEFAULT_TEAMS_MEMBERS.items.slice(
			Math.ceil(DEFAULT_TEAMS_MEMBERS.items.length / 3) * 2
		)
	],
]