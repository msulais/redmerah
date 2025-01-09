export enum Commands {
	toggle_textwrap,

	/** @param {number} fontsize `number` */
	change_fontsize,

	/** @param {string} text `string` */
	update_scss_text,

	/** @param {string} text `string` */
	update_sass_text,

	reset_inputs,

	/** @param {Event} ev `Event` */
	open_file,

	/**
	@param {Event} ev `Event`
	@param {'sass' | 'scss' | 'css'} type `'sass' | 'scss' | 'css'` */
	copy_all,

	/** @param {'sass' | 'scss' | 'css'} type `'sass' | 'scss' | 'css'` */
	download_file,

	/** @param {InputViewOption} option `InputViewOption` */
	change_input_view_option,

	toggle_minify
}

export enum InputViewOption {
	sass,
	scss
}