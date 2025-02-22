export enum TextTypes {
	escape = 'esc',
	unescape = 'uesc'
}

export enum Commands {
	toggleTextWrap,

	/** @param number fontSize */
	updateFontSize,

	/** @param string text */
	updateEscapeText,

	/** @param string text */
	updatedUnescapeText,

	resetInputs,

	/**
	@param TextTypes type */
	copyAll,
}