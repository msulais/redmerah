import type { ListItems } from "./_types"

export type ObjectStoreSettings = {
    key: string
    value: unknown
}

export type ObjectStoreLists = ListItems

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
    lastResult_string = 'lastResult_string',
    lastResult_numbers = 'lastResult_numbers',
    lastResult_words = 'lastResult_words',
    lastResult_selection = 'lastResult_selection',
    lastResult_colors = 'lastResult_colors',
    lastResult_teams = 'lastResult_teams',

    settings_lastPage = 'settings_lastPage',
    settings_string_length = 'settings_string_length', 
    settings_string_animation = 'settings_string_animation',
    settings_string_characters_customCharacter = 'settings_string_characters_customCharacter',
    settings_string_characters_symbols = 'settings_string_characters_symbols',
    settings_string_characters_numbers = 'settings_string_characters_numbers',
    settings_string_characters_alphabetLowercase = 'settings_string_characters_alphabetLowercase',
    settings_string_characters_alphabetUppercase = 'settings_string_characters_alphabetUppercase',
    settings_numbers_count = 'settings_numbers_count',
    settings_numbers_animation = 'settings_numbers_animation',
    settings_numbers_numberType = 'settings_numbers_numberType',
    settings_numbers_repeat = 'settings_numbers_repeat',
    settings_numbers_sort = 'settings_numbers_sort',
    settings_numbers_prefix = 'settings_numbers_prefix',
    settings_numbers_suffix = 'settings_numbers_suffix',
    settings_numbers_separator = 'settings_numbers_separator',
    settings_numbers_minDecimalLength = 'settings_numbers_minDecimalLength',
    settings_numbers_range_min = 'settings_numbers_range_min',
    settings_numbers_range_max = 'settings_numbers_range_max',
    settings_words_count = 'settings_words_count',
    settings_words_animation = 'settings_words_animation',
    settings_words_listId = 'settings_words_listId',
    settings_words_repeat = 'settings_words_repeat',
    settings_words_wordCase = 'settings_words_wordCase',
    settings_words_prefix = 'settings_words_prefix',
    settings_words_suffix = 'settings_words_suffix',
    settings_words_separator = 'settings_words_separator',
    settings_selection_count = 'settings_selection_count',
    settings_selection_listId = 'settings_selection_listId',
    settings_selection_animation = 'settings_selection_animation',
    settings_colors_count = 'settings_colors_count',
    settings_colors_animation = 'settings_colors_animation',
    settings_colors_colorModel = 'settings_colors_colorModel',
    settings_colors_range_hex_min = 'settings_colors_range_hex_min',
    settings_colors_range_hex_max = 'settings_colors_range_hex_max',
    settings_colors_range_hsl_h_min = 'settings_colors_range_hsl_h_min',
    settings_colors_range_hsl_h_max = 'settings_colors_range_hsl_h_max',
    settings_colors_range_hsl_s_min = 'settings_colors_range_hsl_s_min',
    settings_colors_range_hsl_s_max = 'settings_colors_range_hsl_s_max',
    settings_colors_range_hsl_l_min = 'settings_colors_range_hsl_l_min',
    settings_colors_range_hsl_l_max = 'settings_colors_range_hsl_l_max',
    settings_colors_range_rgb_r_min = 'settings_colors_range_rgb_r_min',
    settings_colors_range_rgb_r_max = 'settings_colors_range_rgb_r_max',
    settings_colors_range_rgb_g_min = 'settings_colors_range_rgb_g_min',
    settings_colors_range_rgb_g_max = 'settings_colors_range_rgb_g_max',
    settings_colors_range_rgb_b_min = 'settings_colors_range_rgb_b_min',
    settings_colors_range_rgb_b_max = 'settings_colors_range_rgb_b_max',
    settings_teams_count = 'settings_teams_count',
    settings_teams_namesListId = 'settings_teams_namesListId',
    settings_teams_membersListId = 'settings_teams_membersListId',
    settings_teams_animation = 'settings_teams_animation',
}