export enum RandomizerType {
	string = 'string',
	numbers = 'numbers',
	words = 'words',
	selection = 'selection',
	colors = 'colors',
	teams = 'teams'
}

export enum NumbersRandomizerNumberType {
	decimal = 10,
	hexadecimal = 16,
	octal = 8,
	binary = 2
}

export enum NumbersRandomizerSort {
	ascending = 'asc',
	descending = 'desc',
	none = 'none',
}

export enum WordsRandomizerWordCase {
	uppercase = 'upper',
	lowercase = 'lower',
	titlecase = 'title',
	togglecase = 'toggle',
	none = 'none'
}

export enum ColorsRandomizerColorSpace {
	rgb = 'rgb',
	hsl = 'hsl',
	hex = 'hex'
}

export enum Commands {
	resetList,
	addList,

	/**
	@param list `ListItems` */
	exportList,

	/**
	@param list `ListItems | undefined` */
	editList,

	/**
	@param list `ListItems` */
	viewList,

	toggleSettingsAnimation,
	toggleSettingsRepeat,

	/**
	@param sort `NumbersRandomizerSort` */
	updateSettingsNumbersSort,

	/**
	@param type `NumbersRandomizerNumberType` */
	updateSettingsNumbersType,

	/**
	@param value `string` */
	updateSettingsPrefix,

	/**
	@param value `string` */
	updateSettingsSuffix,

	/**
	@param value `string` */
	updateSettingsSeparator,

	/**
	@param wordcase `WordsRandomizerWordCase` */
	updateSettingsWordsWordcase,

	/**
	@param space `ColorsRandomizerColorSpace` */
	updateSettingsColorsSpace,

	/**
	@param list `ListItems` */
	updateSettingsWordsList,

	/**
	@param length `number` */
	updateSettingsStringLength,

	/**
	@param characters `string` */
	updateSettingsStringCharactersCustom,

	toggleSettingsStrnigCharactersSymbols,
	toggleSettingsStringCharactersNumbers,
	toggleSettingsStringCharactersLowercase,
	toggleSettingsStringCharactersUppercase,
	updateSettingsStringCharactersDefault,

	/**
	@param count `number` */
	updateSettingsNumbersCount,

	/**
	@param length `number` */
	updateSettingsNumbersMinDigits,

	/**
	@param min `number`
	@param max `number` */
	updateSettingsNumbersRange,

	/**
	@param count `number` */
	updateSettingsWordsCount,

	/**
	@param count `number` */
	updateSettingsColorsCount,

	/**
	@param min `number`
	@param max `number` */
	updateSettingsColorsRangeHex,

	/**
	@param min `number`
	@param max `number` */
	updateSettingsColorsRangeHslH,

	/**
	@param min `number`
	@param max `number` */
	updateSettingsColorsRangeHslS,

	/**
	@param min `number`
	@param max `number` */
	updateSettingsColorsRangeHslL,

	/**
	@param min `number`
	@param max `number` */
	updateSettingsColorsRangeRgbR,

	/**
	@param min `number`
	@param max `number` */
	updateSettingsColorsRangeRgbG,

	/**
	@param min `number`
	@param max `number` */
	updateSettingsColorsRangeRgbB,

	/**
	@param list `ListItems` */
	updateSettingsSelectionList,

	/**
	@param count `number` */
	updateSettingsSelectionCount,

	/**
	@param list `ListItems` */
	updateSettingsTeamsListNames,

	/**
	@param list `ListItems` */
	updateSettingsTeamsListMembers,

	/**
	@param count `number` */
	updateSettingsTeamsCount,

	toggleNavigationExpand,

	generate,
	stopGenerate
}