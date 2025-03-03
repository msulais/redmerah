export function dateIsSameYMD(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	)
}

export function dateIsSameYM(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth()
	)
}

export function dateIsSameY(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear()
	)
}

export function dateInRangeYMD(date: Date, min: Date, max: Date): boolean {
	const v = new Date(date.getFullYear(), date.getMonth(), date.getDate()).valueOf()
	const vMin = new Date(min.getFullYear(), min.getMonth(), min.getDate()).valueOf()
	const vMax = new Date(max.getFullYear(), max.getMonth(), max.getDate()).valueOf()

	return vMin <= v && v <= vMax
}

export function dateInRangeYMD_HM(date: Date, min: Date, max: Date): boolean {
	const v = new Date(
		date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()
	).valueOf()
	const vMin = new Date(
		min.getFullYear(), min.getMonth(), min.getDate(), min.getHours(), min.getMinutes()
	).valueOf()
	const vMax = new Date(
		max.getFullYear(), max.getMonth(), max.getDate(), max.getHours(), max.getMinutes()
	).valueOf()

	return vMin <= v && v <= vMax
}

export function dateOutRangeYMD(date: Date, min: Date, max: Date): boolean {
	return !dateInRangeYMD(date, min, max)
}

export function dateOutRangeYMD_HM(date: Date, min: Date, max: Date): boolean {
	return !dateInRangeYMD_HM(date, min, max)
}

export function dateInRangeYM(date: Date, min: Date, max: Date): boolean {
	const v = new Date(date.getFullYear(), date.getMonth()).valueOf()
	const vMin = new Date(min.getFullYear(), min.getMonth()).valueOf()
	const vMax = new Date(max.getFullYear(), max.getMonth()).valueOf()

	return vMin <= v && v <= vMax
}

export function dateOutRangeYM(date: Date, min: Date, max: Date): boolean {
	return !dateInRangeYM(date, min, max)
}

export function dateInRangeY(date: Date, min: Date, max: Date): boolean {
	const v = date.getFullYear()
	const vMin = min.getFullYear()
	const vMax = max.getFullYear()

	return vMin <= v && v <= vMax
}

export function dateOutRangeY(date: Date, min: Date, max: Date): boolean {
	return !dateInRangeY(date, min, max)
}

export function dateWeekdayNames(locales: Intl.LocalesArgument = 'en-US'): string[] {
	const weekdays: string[] = []
	const formatter = new Intl.DateTimeFormat(locales, { weekday: 'long' })

	for (let i = 0; i < 7; i++) {
		const date = new Date(2024, 0, i)
		weekdays.push(formatter.format(date))
	}

	return weekdays
}

export function dateMonthNames(locales: Intl.LocalesArgument = 'en-US'): string[] {
	const months: string[] = []
	const formatter = new Intl.DateTimeFormat(locales, { month: 'long' })

	for (let i = 0; i < 12; i++) {
		const date = new Date(2024, i)
		months.push(formatter.format(date))
	}

	return months
}

export function dateDiffInDays(date1: Date, date2: Date): number {
	const MS_PER_DAY = 1000 * 60 * 60 * 24
	const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())
	const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate())

	return Math.floor((utc2 - utc1) / MS_PER_DAY)
}
