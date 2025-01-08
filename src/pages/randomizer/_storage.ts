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

export const enum ObjectStoreNames {
	settings = 'settings',
	lists = 'lists',
	last_output = 'last_output'
}

export const enum ObjectStoreKeys {
	lastoutput_string = 'string',
	lastoutput_numbers = 'numbers',
	lastoutput_words = 'words',
	lastoutput_selection = 'selection',
	lastoutput_colors = 'colors',
	lastoutput_teams = 'teams',

	settings_lastpage = 'last_page',
	settings_string_length = 'string/length',
	settings_string_animation = 'string/animation',
	settings_string_characters_custom = 'string/characters/custom',
	settings_string_characters_symbols = 'string/characters/symbols',
	settings_string_characters_numbers = 'string/characters/numbers',
	settings_string_characters_lowercase = 'string/characters/lowercase',
	settings_string_characters_uppercase = 'string/characters/uppercase',
	settings_numbers_count = 'numbers/count',
	settings_numbers_animation = 'numbers/animation',
	settings_numbers_type = 'numbers/type',
	settings_numbers_repeat = 'numbers/repeat',
	settings_numbers_sort = 'numbers/sort',
	settings_numbers_prefix = 'numbers/prefix',
	settings_numbers_suffix = 'numbers/suffix',
	settings_numbers_separator = 'numbers/separator',
	settings_numbers_minlength = 'numbers/min_length',
	settings_numbers_range_min = 'numbers/range/min',
	settings_numbers_range_max = 'numbers/range/max',
	settings_words_count = 'words/count',
	settings_words_animation = 'words/animation',
	settings_words_listid = 'words/list_id',
	settings_words_repeat = 'words/repeat',
	settings_words_wordcase = 'words/word_case',
	settings_words_prefix = 'words/prefix',
	settings_words_suffix = 'words/suffix',
	settings_words_separator = 'words/separator',
	settings_selection_count = 'selection/count',
	settings_selection_listid = 'selection/list_id',
	settings_selection_animation = 'selection/animation',
	settings_colors_count = 'colors/count',
	settings_colors_animation = 'colors/animation',
	settings_colors_model = 'colors/model',
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
	settings_teams_listnamesid = 'teams/list_names_id',
	settings_teams_listmembersid = 'teams/list_member_id',
	settings_teams_animation = 'teams/animation',
}