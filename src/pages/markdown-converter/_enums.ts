export enum Commands {
	toggleTextWrap,

	/** @param {number} fontSize `number` */
	updateFontSize,

	/** @param {string} text `string` */
	updateCSSText,

	/** @param {string} text `string` */
	updateMarkdownText,

	resetInputs,

	/** @param {Event} ev `Event` */
	openFile,

	/**
	@param {Event} ev `Event`
	@param {'html' | 'css' | 'markdown'} type `'html' | 'css' | 'markdown'` */
	copyAll,

	/** @param {'html' | 'css' | 'markdown'} type `'html' | 'css' | 'markdown'` */
	downloadFile,
}