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
    ascending,
    descending,
    none,
}

export enum WordsRandomizerWordCase {
    uppercase,
    lowercase,
    titlecase,
    togglecase,
    none
}

export enum ColorsRandomizerColorModel {
    rgb,
    hsl,
    hex
}

export enum Commands {
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
    @param wordCase `WordsRandomizerWordCase` */
    change_settings_words_wordCase, 
    
    /** 
    @param colorModel `ColorsRandomizerColorModel` */
    change_settings_colors_colorModel,
    
    /** 
    @param list `ListItems` */
    change_settings_words_list,
    
    /** 
    @param length `number` */
    change_settings_string_length,
    
    /** 
    @param characters `string` */
    change_settings_string_characters_customCharacters,
    
    toggle_settings_string_characters_symbols,
    toggle_settings_string_characters_numbers,
    toggle_settings_string_characters_alphabetLowercase,
    toggle_settings_string_characters_alphabetUppercase,
    change_settings_string_characters_toDefault,
    
    /** 
    @param count `number` */
    change_settings_numbers_count,
    
    /** 
    @param length `number` */
    change_settings_numbers_minDecimalLength,
    
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
    change_settings_teams_namesList, 
     
    /** 
    @param list `ListItems` */
    change_settings_teams_membersList, 
     
    /** 
    @param count `number` */
    change_settings_teams_count, 

    toggle_navigation_expand,
    generate, 
    stopGenerate
}