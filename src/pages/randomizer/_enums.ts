export const enum RandomizerType {
	string = 'string',
	numbers = 'numbers',
	words = 'words',
	selection = 'selection',
	colors = 'colors',
	teams = 'teams'
}

export const enum NumbersRandomizerNumberType {
	decimal = 10,
	hexadecimal = 16,
	octal = 8,
	binary = 2
}
export const all_NumbersRandomizerNumberType = [
	NumbersRandomizerNumberType.decimal,
	NumbersRandomizerNumberType.hexadecimal,
	NumbersRandomizerNumberType.octal,
	NumbersRandomizerNumberType.binary
]

export const enum NumbersRandomizerSort {
	ascending = 'asc',
	descending = 'desc',
	none = 'none',
}
export const all_NumbersRandomizerSort = [
	NumbersRandomizerSort.ascending,
	NumbersRandomizerSort.descending,
	NumbersRandomizerSort.none,
]

export const enum WordsRandomizerWordCase {
	uppercase = 'upper',
	lowercase = 'lower',
	titlecase = 'title',
	togglecase = 'toggle',
	none = 'none'
}
export const all_WordsRandomizerWordCase = [
	WordsRandomizerWordCase.uppercase,
	WordsRandomizerWordCase.lowercase,
	WordsRandomizerWordCase.titlecase,
	WordsRandomizerWordCase.togglecase,
	WordsRandomizerWordCase.none
]

export const enum ColorsRandomizerColorModel {
	rgb = 'rgb',
	hsl = 'hsl',
	hex = 'hex'
}
export const all_ColorsRandomizerColorModel = [
	ColorsRandomizerColorModel.rgb,
	ColorsRandomizerColorModel.hsl,
	ColorsRandomizerColorModel.hex
]

export const enum Commands {
	/**
	@param event `Event` */
	reset_list,

	/**
	@param event `Event` */
	add_list,

	/**
	@param list `ListItems` */
	export_list,

	/**
	@param event `Event`
	@param list `ListItems | undefined` */
	edit_list,

	/**
	@param event `Event`
	@param list `ListItems` */
	view_list,

	/**
	@param event `Event`
	@param list `ListItems` */
	delete_list,

	toggle_settings_animation,
	toggle_settings_repeat,

	/**
	@param sort `NumbersRandomizerSort` */
	change_settings_numbers_sort,

	/**
	@param type `NumbersRandomizerNumberType` */
	change_settings_numbers_type,

	/**
	@param value `string` */
	change_settings_prefix,

	/**
	@param value `string` */
	change_settings_suffix,

	/**
	@param value `string` */
	change_settings_separator,

	/**
	@param wordcase `WordsRandomizerWordCase` */
	change_settings_words_wordcase,

	/**
	@param model `ColorsRandomizerColorModel` */
	change_settings_colors_model,

	/**
	@param list `ListItems` */
	change_settings_words_list,

	/**
	@param length `number` */
	change_settings_string_length,

	/**
	@param characters `string` */
	change_settings_string_characters_custom,

	toggle_settings_string_characters_symbols,
	toggle_settings_string_characters_numbers,
	toggle_settings_string_characters_lowercase,
	toggle_settings_string_characters_uppercase,
	change_settings_string_characters_default,

	/**
	@param count `number` */
	change_settings_numbers_count,

	/**
	@param length `number` */
	change_settings_numbers_minlength,

	/**
	@param min `number`
	@param max `number` */
	change_settings_numbers_range,

	/**
	@param count `number` */
	change_settings_words_count,

	/**
	@param count `number` */
	change_settings_colors_count,

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_hex,

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_hsl_h,

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_hsl_s,

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_hsl_l,

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_rgb_r,

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_rgb_g,

	/**
	@param min `number`
	@param max `number` */
	change_settings_colors_range_rgb_b,

	/**
	@param list `ListItems` */
	change_settings_selection_list,

	/**
	@param count `number` */
	change_settings_selection_count,

	/**
	@param list `ListItems` */
	change_settings_teams_listnames,

	/**
	@param list `ListItems` */
	change_settings_teams_listmembers,

	/**
	@param count `number` */
	change_settings_teams_count,

	toggle_navigation_expand,

	/**
	@param event `Event` */
	generate,
	stop_generate
}