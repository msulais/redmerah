export enum Pages {
	String = 'string',
	Words = 'words',
	Numbers = 'numbers',
	Colors = 'colors',
	Selection = 'selection',
	Teams = 'teams'
}

export class NumbersRandomizerType {
	static readonly decimal = 10
	static readonly hexadecimal = 16
	static readonly octal = 8
	static readonly binary = 2
}

export enum NumbersRandomizerSort {
	Ascending = 'asc',
	Descending = 'desc',
	None = 'none',
}

export enum WordsRandomizerCase {
	Uppercase = 'upper',
	Lowercase = 'lower',
	Titlecase = 'title',
	Togglecase = 'toggle',
	None = 'none'
}

export enum ColorsRandomizerSpace {
	RGB = 'rgb',
	HSL = 'hsl',
	HEX = 'hex'
}