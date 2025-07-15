export enum Pages {
	string = 'string',
	words = 'words',
	numbers = 'numbers',
	colors = 'colors',
	selection = 'selection',
	teams = 'teams'
}

export class NumbersRandomizerType {
	static readonly decimal = 10
	static readonly hexadecimal = 16
	static readonly octal = 8
	static readonly binary = 2
}

export enum NumbersRandomizerSort {
	ascending = 'asc',
	descending = 'desc',
	none = 'none',
}

export enum WordsRandomizerCase {
	uppercase = 'upper',
	lowercase = 'lower',
	titlecase = 'title',
	togglecase = 'toggle',
	none = 'none'
}

export enum ColorsRandomizerSpace {
	rgb = 'rgb',
	hsl = 'hsl',
	hex = 'hex'
}