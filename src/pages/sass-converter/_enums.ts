export enum Commands {
    toggle_textWrap = 'a',

    /** @param {number} fontSize `number` */
    change_fontSize = 'b',

    /** @param {string} text `string` */
    update_scss_text = 'c',

    /** @param {string} text `string` */
    update_sass_text = 'd',

    reset_inputs = 'e',

    /** @param {Event} ev `Event` */
    open_file = 'f',

    /**
    @param {Event} ev `Event`
    @param {'sass' | 'scss' | 'css'} type `'sass' | 'scss' | 'css'` */
    copy_all = 'g',

    /** @param {'sass' | 'scss' | 'css'} type `'sass' | 'scss' | 'css'` */
    download_file = 'h',

    /** @param {InputViewOption} option `InputViewOption` */
    change_input_view_option = 'i',

    toggle_minify = 'j'
}

export enum InputViewOption {
    sass,
    scss
}