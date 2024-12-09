export enum Commands {
	toggle_textwrap = 'a',

	/** @param {number} fontSize `number` */
	change_fontsize = 'b',

	/**
	@param {string} text `string`
	@param {number} index `number` */
	update_latex_input = 'd',

	reset_inputs = 'e',

	/** @param {Event} ev `Event`*/
	copy_all = 'g',

	/** @param {number} index `number`*/
	add_equation = 'h',

	/** @param {number} index `number`*/
	delete_equation = 'i',

	/** @param {string} prefix `string` */
	change_prefix = 'j',

	/** @param {string} suffix `string` */
	change_suffix = 'k',
}