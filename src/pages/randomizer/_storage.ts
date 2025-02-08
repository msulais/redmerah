import type { ItemList } from "./_types"

export type ObjectStoreSettings = {
	key: string
	value: unknown
}

export type ObjectStoreLists = ItemList

export type ObjectStoreLastResult = {
	key: string
	value: unknown
}

export enum ObjectStoreNames {
	settings = 'settings',
	lists = 'lists',
	lastOutput = 'last-output'
}

export enum ObjectStoreKeys {
	lastOutput_string = 'string',
	lastOutput_numbers = 'numbers',
	lastOutput_words = 'words',
	lastOutput_selection = 'selection',
	lastOutput_colors = 'colors',
	lastOutput_teams = 'teams',

	settings_lastPage = 'last_page',
	settings_stringLength = 'string-length',
	settings_stringAnimation = 'string-animation',
	settings_stringCharactersCustom = 'string-characters-custom',
	settings_stringCharactersSymbols = 'string-characters-symbols',
	settings_stringCharactersNumbers = 'string-characters-numbers',
	settings_stringCharactersLowercase = 'string-characters-lowercase',
	settings_stringCharactersUppercase = 'string-characters-uppercase',
	settings_numbersCount = 'numbers-count',
	settings_numbersAnimation = 'numbers-animation',
	settings_numbersType = 'numbers-type',
	settings_numbersRepeat = 'numbers-repeat',
	settings_numbersSort = 'numbers-sort',
	settings_numbersPrefix = 'numbers-prefix',
	settings_numbersSuffix = 'numbers-suffix',
	settings_numbersSeparator = 'numbers-separator',
	settings_numbersMinDigits = 'numbers-min-digits',
	settings_numbersRangeMin = 'numbers-range-min',
	settings_numbersRangeMax = 'numbers-range-max',
	settings_wordsCount = 'words-count',
	settings_wordsAnimation = 'words-animation',
	settings_wordsListId = 'words-listId',
	settings_wordsRepeat = 'words-repeat',
	settings_wordsWordCase = 'words-word-case',
	settings_wordsPrefix = 'words-prefix',
	settings_wordsSuffix = 'words-suffix',
	settings_wordsSeparator = 'words-separator',
	settings_selectionCount = 'selection-count',
	settings_selectionListId = 'selection-list-id',
	settings_selectionAnimation = 'selection-animation',
	settings_colorsCount = 'colors-count',
	settings_colorsAnimation = 'colors-animation',
	settings_colorsModel = 'colors-model',
	settings_colorsRangeHexMin = 'colors-range-hex-min',
	settings_colorsRangeHexMax = 'colors-range-hex-max',
	settings_colorsRangeHslHMin = 'colors-range-hsl-h-min',
	settings_colorsRangeHslHMax = 'colors-range-hsl-h-max',
	settings_colorsRangeHslSMin = 'colors-range-hsl-s-min',
	settings_colorsRangeHslSMax = 'colors-range-hsl-s-max',
	settings_colorsRangeHslLMin = 'colors-range-hsl-l-min',
	settings_colorsRangeHslLMax = 'colors-range-hsl-l-max',
	settings_colorsRangeRgbRMin = 'colors-range-rgb-r-min',
	settings_colorsRangeRgbRMax = 'colors-range-rgb-r-max',
	settings_colorsRangeRgbGMin = 'colors-range-rgb-g-min',
	settings_colorsRangeRgbGMax = 'colors-range-rgb-g-max',
	settings_colorsRangeRgbBMin = 'colors-range-rgb-b-min',
	settings_colorsRangeRgbBMax = 'colors-range-rgb-b-max',
	settings_teamsCount = 'teams-count',
	settings_teamsListNamesId = 'teams-list-names-id',
	settings_teamsListMembersId = 'teams-list-members-id',
	settings_teamsAnimation = 'teams-animation',
}