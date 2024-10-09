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
	lastResult = 'lastResult'
}

export enum ObjectStoreKeys {
	lastResult_string = 'string',
	lastResult_numbers = 'numbers',
	lastResult_words = 'words',
	lastResult_selection = 'selection',
	lastResult_colors = 'colors',
	lastResult_teams = 'teams',

	settings_lastPage = 'lastPage',
	settings_string_length = 'string/length',
	settings_string_animation = 'string/animation',
	settings_string_characters_customCharacter = 'string/characters/customCharacter',
	settings_string_characters_symbols = 'string/characters/symbols',
	settings_string_characters_numbers = 'string/characters/numbers',
	settings_string_characters_alphabetLowercase = 'string/characters/alphabetLowercase',
	settings_string_characters_alphabetUppercase = 'string/characters/alphabetUppercase',
	settings_numbers_count = 'numbers/count',
	settings_numbers_animation = 'numbers/animation',
	settings_numbers_numberType = 'numbers/numberType',
	settings_numbers_repeat = 'numbers/repeat',
	settings_numbers_sort = 'numbers/sort',
	settings_numbers_prefix = 'numbers/prefix',
	settings_numbers_suffix = 'numbers/suffix',
	settings_numbers_separator = 'numbers/separator',
	settings_numbers_minDecimalLength = 'numbers/minDecimalLength',
	settings_numbers_range_min = 'numbers/range/min',
	settings_numbers_range_max = 'numbers/range/max',
	settings_words_count = 'words/count',
	settings_words_animation = 'words/animation',
	settings_words_listId = 'words/listId',
	settings_words_repeat = 'words/repeat',
	settings_words_wordCase = 'words/wordCase',
	settings_words_prefix = 'words/prefix',
	settings_words_suffix = 'words/suffix',
	settings_words_separator = 'words/separator',
	settings_selection_count = 'selection/count',
	settings_selection_listId = 'selection/listId',
	settings_selection_animation = 'selection/animation',
	settings_colors_count = 'colors/count',
	settings_colors_animation = 'colors/animation',
	settings_colors_colorModel = 'colors/colorModel',
	settings_colors_range_hex_min = 'colors/range/hex/min',
	settings_colors_range_hex_max = 'colors/range/hex/max',
	settings_colors_range_hsl_h_min = 'colors/range/hsl/h/min',
	settings_colors_range_hsl_h_max = 'colors/range/hsl/h/max',
	settings_colors_range_hsl_s_min = 'colors/range/hsl/s/min',
	settings_colors_range_hsl_s_max = 'colors/range/hsl/s/max',
	settings_colors_range_hsl_l_min = 'colors/range/hsl/l/min',
	settings_colors_range_hsl_l_max = 'colors/range/hsl/l/max',
	settings_colors_range_rgb_r_min = 'colors/range/rgb/r/min',
	settings_colors_range_rgb_r_max = 'colors/range/rgb/r/max',
	settings_colors_range_rgb_g_min = 'colors/range/rgb/g/min',
	settings_colors_range_rgb_g_max = 'colors/range/rgb/g/max',
	settings_colors_range_rgb_b_min = 'colors/range/rgb/b/min',
	settings_colors_range_rgb_b_max = 'colors/range/rgb/b/max',
	settings_teams_count = 'teams/count',
	settings_teams_namesListId = 'teams/namesListId',
	settings_teams_membersListId = 'teams/membersListId',
	settings_teams_animation = 'teams/animation',
}