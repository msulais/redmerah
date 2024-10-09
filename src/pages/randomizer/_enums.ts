export enum RandomizerType {
	string = 'string',
	numbers = 'numbers',
	words = 'words',
	selection = 'selection',
	colors = 'colors',
	teams = 'teams'
}

export enum NumbersRandomizerNumberType {
	decimal = 10,
	hexadecimal = 16,
	octal = 8,
	binary = 2
}

export enum NumbersRandomizerSort {
	ascending = 'asc',
	descending = 'desc',
	none = 'none',
}

export enum WordsRandomizerWordCase {
	uppercase = 'upper',
	lowercase = 'lower',
	titlecase = 'title',
	togglecase = 'toggle',
	none = 'none'
}

export enum ColorsRandomizerColorModel {
	rgb = 'rgb',
	hsl = 'hsl',
	hex = 'hex'
}

export enum Commands {
	/**
	@param event `Event` */
	reset_list = 'a',

	/**
	@param event `Event` */
	add_list = 'b',

	/**
	@param list `ListItems` */
	export_list = 'c',

	/**
	@param event `Event`
	@param list `ListItems | undefined` */
	edit_list = 'd',

	/**
	@param event `Event`
	@param list `ListItems` */
	view_list = 'e',

	/**
	@param event `Event`
	@param list `ListItems` */
	delete_list = 'f',

	toggle_settings_animation = 'g',
	toggle_settings_repeat = 'h',

	/**
	@param sort `NumbersRandomizerSort` */
	change_settings_numbers_sort = 'i',

	/**
	@param type `NumbersRandomizerNumberType` */
	change_settings_numbers_type = 'j',

	/**
	@param value `string` */
	change_settings_prefix = 'k',

	/**
	@param value `string` */
	change_settings_suffix = 'l',

	/**
	@param value `string` */
	change_settings_separator = 'm',

	/**
	@param wordCase `WordsRandomizerWordCase` */
	change_settings_words_wordCase = 'n',

	/**
	@param colorModel `ColorsRandomizerColorModel` */
	change_settings_colors_colorModel = 'o',

	/**
	@param list `ListItems` */
	change_settings_words_list = 'p',

	/**
	@param length `number` */
	change_settings_string_length = 'q',

	/**
	@param characters `string` */
	change_settings_string_characters_customCharacters = 'r',

	toggle_settings_string_characters_symbols = 's',
	toggle_settings_string_characters_numbers = 't',
	toggle_settings_string_characters_alphabetLowercase = 'u',
	toggle_settings_string_characters_alphabetUppercase = 'v',
	change_settings_string_characters_toDefault = 'w',

	/**
	@param count `number` */
	change_settings_numbers_count = 'x',

	/**
	@param length `number` */
	change_settings_numbers_minDecimalLength = 'y',

	/**
	@param min `number`
	@param max `number` */
	change_settings_numbers_range = 'z',

	/**
	@param count `number` */
	change_settings_words_count = 'aa',

	/**
	@param count `number` */
	change_settings_colors_count = 'ab',

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_hex = 'ac',

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_hsl_h = 'ad',

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_hsl_s = 'ae',

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_hsl_l = 'af',

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_rgb_r = 'ag',

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_rgb_g = 'ah',

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_rgb_b = 'ai',

	/**
	@param list `ListItems` */
	change_settings_selection_list = 'aj',

	/**
	@param count `number` */
	change_settings_selection_count = 'ak',

	/**
	@param list `ListItems` */
	change_settings_teams_namesList = 'al',

	/**
	@param list `ListItems` */
	change_settings_teams_membersList = 'am',

	/**
	@param count `number` */
	change_settings_teams_count = 'an',

	toggle_navigation_expand = 'ao',

	/**
	@param event `Event` */
	generate = 'ap',
	stopGenerate = 'aq'
}