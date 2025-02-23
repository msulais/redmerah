export enum TextTypes {
	input = 'input',
	output = 'output'
}

export enum Commands {
	toggleTextWrap,

	/** @param number fontSize */
	updateFontSize,

	/** @param boolean value */
	updateSupportIE8,

	/** @param boolean value */
	updateSupportSafari10,

	/** @param boolean value */
	updateModule,

	/** @param boolean value */
	updateKeepClassNames,

	/** @param boolean value */
	updateKeepFunctionNames,

	/** @param boolean value */
	updateTopLevel,

	/** @param boolean value */
	updateBeautify,

	/** @param Ecma value */
	updateEcma,

	/** @param string text */
	updateInputText,

	resetInputs,
	openFile,

	/** @param CopyAllTypes type */
	copyAll,

	/** @param CopyAllTypes type */
	downloadFile,
}