export enum Commands {
	toggleTextWrap,

	/** @param {number} fontSize `number` */
	updateFontSize,

	/**
	@param {string} text `string`
	@param {number} index `number` */
	updateLatexInput,

	resetInputs,

	/** @param {Event} ev `Event`*/
	copyAll,

	/** @param {number} index `number`*/
	addEquation,

	/** @param {number} index `number`*/
	deleteEquation,

	/** @param {string} prefix `string` */
	updatePrefix,

	/** @param {string} suffix `string` */
	updateSuffix,
}