export const enum Commands {
	toggle_textwrap,

	/** @param {number} fontSize `number` */
	change_fontsize,

	/** @param {string} text `string` */
	update_css_text,

	/** @param {string} text `string` */
	update_markdown_text,

	reset_inputs,

	/** @param {Event} ev `Event` */
	open_file,

	/**
	@param {Event} ev `Event`
	@param {'html' | 'css' | 'markdown'} type `'html' | 'css' | 'markdown'` */
	copy_all,

	/** @param {'html' | 'css' | 'markdown'} type `'html' | 'css' | 'markdown'` */
	download_file,
}