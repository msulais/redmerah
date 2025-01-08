export const enum Commands {
	toggle_textwrap,

	/** @param {number} fontSize `number` */
	change_fontsize,

	/**
	@param {string} text `string`
	@param {number} index `number` */
	update_latex_input,

	reset_inputs,

	/** @param {Event} ev `Event`*/
	copy_all,

	/** @param {number} index `number`*/
	add_equation,

	/** @param {number} index `number`*/
	delete_equation,

	/** @param {string} prefix `string` */
	change_prefix,

	/** @param {string} suffix `string` */
	change_suffix,
}