export enum Commands {
    toggle_textWrap = 'a',

    /** @param {number} fontSize `number` */
    change_fontSize = 'b',

    /** @param {string} text `string` */
    update_css_text = 'c',

    /** @param {string} text `string` */
    update_markdown_text = 'd',

    reset_inputs = 'e',

    /** @param {Event} ev `Event` */
    open_file = 'f',

    /**
    @param {Event} ev `Event`
    @param {'html' | 'css' | 'markdown'} type `'html' | 'css' | 'markdown'` */
    copy_all = 'g',

    /** @param {'html' | 'css' | 'markdown'} type `'html' | 'css' | 'markdown'` */
    download_file = 'h',
}