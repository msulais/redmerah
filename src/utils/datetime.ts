export function isDateEqual_YMD(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	)
}

export function isDateEqual_YM(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth()
	)
}

export function isDateEqual_Y(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear()
	)
}

export function isDateInRange_YMD(date: Date, min: Date, max: Date): boolean {
	const v = new Date(date.getFullYear(), date.getMonth(), date.getDate()).valueOf()
	const vMin = new Date(min.getFullYear(), min.getMonth(), min.getDate()).valueOf()
	const vMax = new Date(max.getFullYear(), max.getMonth(), max.getDate()).valueOf()

	return vMin <= v && v <= vMax
}

export function isDateInRange_YMD_HM(date: Date, min: Date, max: Date): boolean {
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

export function isDateOutRange_YMD(date: Date, min: Date, max: Date): boolean {
	return !isDateInRange_YMD(date, min, max)
}

export function isDateOutRange_YMD_HM(date: Date, min: Date, max: Date): boolean {
	return !isDateInRange_YMD_HM(date, min, max)
}

export function isDateInRange_YM(date: Date, min: Date, max: Date): boolean {
	const v = new Date(date.getFullYear(), date.getMonth()).valueOf()
	const vMin = new Date(min.getFullYear(), min.getMonth()).valueOf()
	const vMax = new Date(max.getFullYear(), max.getMonth()).valueOf()

	return vMin <= v && v <= vMax
}

export function isDateOutRange_YM(date: Date, min: Date, max: Date): boolean {
	return !isDateInRange_YM(date, min, max)
}

export function isDateInRange_Y(date: Date, min: Date, max: Date): boolean {
	const v = date.getFullYear()
	const vMin = min.getFullYear()
	const vMax = max.getFullYear()

	return vMin <= v && v <= vMax
}

export function isDateOutRange_Y(date: Date, min: Date, max: Date): boolean {
	return !isDateInRange_Y(date, min, max)
}

export function localWeekdayNames(locales: Intl.LocalesArgument = 'en-US'): string[] {
	const weekdays: string[] = []
	const formatter = new Intl.DateTimeFormat(locales, { weekday: 'long' })

	for (let i = 0; i < 7; i++) {
		const date = new Date(2024, 0, i)
		weekdays.push(formatter.format(date))
	}

	return weekdays
}

export function localMonthNames(locales: Intl.LocalesArgument = 'en-US'): string[] {
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
