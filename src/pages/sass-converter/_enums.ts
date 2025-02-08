export enum Commands {
	toggleTextWrap,

	/** @param {number} fontsize `number` */
	updateFontSize,

	/** @param {string} text `string` */
	updateSCSSText,

	/** @param {string} text `string` */
	updateSASSText,

	resetInputs,

	/** @param {Event} ev `Event` */
	openFile,

	/**
	@param {'sass' | 'scss' | 'css'} type `'sass' | 'scss' | 'css'` */
	copyAll,

	/** @param {'sass' | 'scss' | 'css'} type `'sass' | 'scss' | 'css'` */
	downloadFile,

	/** @param {InputViewOption} option `InputViewOption` */
	changeInputViewOption,

	toggleMinify
}

export enum InputViewOption {
	sass,
	scss
}