import { arrayPush } from "./array"
import { mathFloor } from "./math"

/**
 * Sets the date and time value in the Date object.
 * @param time A numeric value representing the number of elapsed milliseconds since midnight,
 * January 1, 1970 GMT.
 */
export function dateTimeSet(date: Date, time: number): number {
	return date.setTime(time)
}

/** Gets the day of the week, using local time. */
export function dateDay(date: Date = new Date()): number {
	return date.getDay()
}

/** Gets the seconds of a Date object, using local time. */
export function dateSeconds(date: Date = new Date): number {
	return date.getSeconds()
}

/** Gets the milliseconds of a Date, using local time. */
export function dateMilliseconds(date: Date = new Date): number {
	return date.getMilliseconds()
}

/**
 * Sets the minutes value in the Date object using local time.
 * @param min A numeric value equal to the minutes value.
 * @param sec A numeric value equal to the seconds value.
 * @param ms A numeric value equal to the milliseconds value.
 */
export function dateMinuteSet(
	currentDate: Date = new Date,
	min: number,
	sec?: number,
	ms?: number
): number {
	return currentDate.setMinutes(
		min,
		sec ?? dateSeconds(currentDate),
		ms ?? dateMilliseconds(currentDate)
	)
}

/**
 * Sets the hour value in the Date object using local time.
 * @param hours A numeric value equal to the hours value.
 * @param min A numeric value equal to the minutes value.
 * @param sec A numeric value equal to the seconds value.
 * @param ms A numeric value equal to the milliseconds value.
 */
export function dateHourSet(
	currentDate: Date = new Date,
	hours: number,
	min?: number,
	sec?: number,
	ms?: number
): number {
	return currentDate.setHours(
		hours,
		min ?? dateMinutes(currentDate),
		sec ?? dateSeconds(currentDate),
		ms ?? dateMilliseconds(currentDate)
	)
}

/**
 * Sets the numeric day-of-the-month value of the Date object using local time.
 * @param date A numeric value equal to the day of the month.
 */
export function dateDateSet(currentDate: Date = new Date, date: number): number {
	return currentDate.setDate(date)
}

/**
 * Sets the month value in the Date object using local time.
 * @param month A numeric value equal to the month. The value for January is 0, and other month
 * values follow consecutively.
 * @param date A numeric value representing the day of the month. If this value is not supplied,
 * the value from a call to the getDate method is used.
 */
export function dateMonthSet(
	currentDate: Date = new Date(),
	month: number,
	date?: number
): number {
	return currentDate.setMonth(month, date ?? dateDate(currentDate))
}

/**
 * Sets the year of the Date object using local time.
 * @param year A numeric value for the year.
 * @param month A zero-based numeric value for the month (0 for January, 11 for December). Must be
 * specified if numDate is specified.
 * @param date A numeric value equal for the day of the month.
 */
export function dateYearSet(
	currentDate: Date = new Date,
	year: number,
	month?: number,
	date?: number
): number {
	return currentDate.setFullYear(
		year,
		month ?? dateMonth(currentDate),
		date ?? dateDate(currentDate)
	)
}

/** Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. */
export function dateTime(date: Date): number {
	return date.getTime()
}

/** Returns a date converted to a string using Universal Coordinated Time (UTC). */
export function dateToUTC(date: Date): string {
	return date.toUTCString()
}

export function dateCurrent(): Date {
	return new Date()
}

/** Gets the year, using local time. */
export function dateYear(date: Date = new Date()): number {
	return date.getFullYear()
}

/** Gets the month, using local time. */
export function dateMonth(date: Date = new Date()): number {
	return date.getMonth()
}

/** Gets the day-of-the-month, using local time. */
export function dateDate(date: Date = new Date()): number {
	return date.getDate()
}

/** Gets the hours in a date, using local time. */
export function dateHours(date: Date = new Date()): number {
	return date.getHours()
}

/** Gets the minutes of a Date object, using local time. */
export function dateMinutes(date: Date = new Date()): number {
	return date.getMinutes()
}

/**
 * Parses a string containing a date, and returns the number of milliseconds between that date and
 * midnight, January 1, 1970.
 * @param date A date string
 */
export function dateParse(date: string): number {
	return Date.parse(date)
}

/** Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. */
export function dateValueOf(date: Date): number {
	return date.valueOf()
}

/** Returns a date as a string value in ISO format. */
export function dateISO(date: Date = new Date): string {
	return date.toISOString()
}

export function dateIsSameYMD(date1: Date, date2: Date): boolean {
	return (
		dateYear(date1) == dateYear(date2) &&
		dateMonth(date1) == dateMonth(date2) &&
		dateDate(date1) == dateDate(date2)
	)
}

export function dateIsSameYM(date1: Date, date2: Date): boolean {
	return (
		dateYear(date1) == dateYear(date2) &&
		dateMonth(date1) == dateMonth(date2)
	)
}

export function dateIsSameY(date1: Date, date2: Date): boolean {
	return (
		dateYear(date1) == dateYear(date2)
	)
}

export function dateInRangeYMD(date: Date, min: Date, max: Date): boolean {
	const v = dateValueOf(new Date(dateYear(date), dateMonth(date), dateDate(date)))
	const vMin = dateValueOf(new Date(dateYear(min), dateMonth(min), dateDate(min)))
	const vMax = dateValueOf(new Date(dateYear(max), dateMonth(max), dateDate(max)))

	return vMin <= v && v <= vMax
}

export function dateInRangeYMD_HM(date: Date, min: Date, max: Date): boolean {
	const v = dateValueOf(new Date(
		dateYear(date), dateMonth(date), dateDate(date), dateHours(date), dateMinutes(date)
	))
	const vMin = dateValueOf(new Date(
		dateYear(min), dateMonth(min), dateDate(min), dateHours(min), dateMinutes(min)
	))
	const vMax = dateValueOf(new Date(
		dateYear(max), dateMonth(max), dateDate(max), dateHours(max), dateMinutes(max)
	))

	return vMin <= v && v <= vMax
}

export function dateOutRangeYMD(date: Date, min: Date, max: Date): boolean {
	return !dateInRangeYMD(date, min, max)
}

export function dateOutRangeYMD_HM(date: Date, min: Date, max: Date): boolean {
	return !dateInRangeYMD_HM(date, min, max)
}

export function dateInRangeYM(date: Date, min: Date, max: Date): boolean {
	const v = dateValueOf(new Date(dateYear(date), dateMonth(date)))
	const vMin = dateValueOf(new Date(dateYear(min), dateMonth(min)))
	const vMax = dateValueOf(new Date(dateYear(max), dateMonth(max)))

	return vMin <= v && v <= vMax
}

export function dateOutRangeYM(date: Date, min: Date, max: Date): boolean {
	return !dateInRangeYM(date, min, max)
}

export function dateInRangeY(date: Date, min: Date, max: Date): boolean {
	const v = dateYear(date)
	const v_min = dateYear(min)
	const v_max = dateYear(max)

	return v_min <= v && v <= v_max
}

export function dateOutRangeY(date: Date, min: Date, max: Date): boolean {
	return !dateInRangeY(date, min, max)
}

export function dateWeekdayNames(locales: Intl.LocalesArgument = 'en-US'): string[] {
	const weekdays: string[] = []
	const formatter = new Intl.DateTimeFormat(locales, { weekday: 'long' })

	for (let i = 0; i < 7; i++) {
		const date = new Date(2024, 0, i)
		arrayPush(weekdays, formatter.format(date))
	}

	return weekdays
}

export function dateMonthNames(locales: Intl.LocalesArgument = 'en-US'): string[] {
	const months: string[] = []
	const formatter = new Intl.DateTimeFormat(locales, { month: 'long' })

	for (let i = 0; i < 12; i++) {
		const date = new Date(2024, i)
		arrayPush(months, formatter.format(date))
	}

	return months
}

export function dateTextDate(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
	return date.toLocaleDateString(locales, { weekday: 'long' })
}

export function dateTextMonth(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
	return date.toLocaleDateString(locales, {month: 'long'})
}

export function dateTextYMD(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
	return date.toLocaleDateString(locales, {day: 'numeric', month: 'long', year: 'numeric'})
}

export function dateTextYMD_HM(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
	return date.toLocaleDateString(locales, {
		day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
	})
}

export function dateDiffInDays(date1: Date, date2: Date): number {
	const MS_PER_DAY = 1000 * 60 * 60 * 24
	const utc1 = Date.UTC(dateYear(date1), dateMonth(date1), dateDate(date1))
	const utc2 = Date.UTC(dateYear(date2), dateMonth(date2), dateDate(date2))

	return mathFloor((utc2 - utc1) / MS_PER_DAY)
}
