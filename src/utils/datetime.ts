import { array_push } from "./array"
import { math_floor } from "./math"

/**
 * Sets the date and time value in the Date object.
 * @param time A numeric value representing the number of elapsed milliseconds since midnight, January 1, 1970 GMT.
 */
export function date_settime(date: Date, time: number): number {
	return date.setTime(time)
}

/** Gets the day of the week, using local time. */
export function date_day(date: Date = new Date()): number {
	return date.getDay()
}

/** Gets the seconds of a Date object, using local time. */
export function date_second(date: Date = new Date): number {
	return date.getSeconds()
}

/** Gets the milliseconds of a Date, using local time. */
export function date_millisecond(date: Date = new Date): number {
	return date.getMilliseconds()
}

/**
 * Sets the minutes value in the Date object using local time.
 * @param min A numeric value equal to the minutes value.
 * @param sec A numeric value equal to the seconds value.
 * @param ms A numeric value equal to the milliseconds value.
 */
export function date_set_minute(
	current_date: Date = new Date,
	min: number,
	sec?: number,
	ms?: number
): number {
	return current_date.setMinutes(
		min,
		sec ?? date_second(current_date),
		ms ?? date_millisecond(current_date)
	)
}

/**
 * Sets the hour value in the Date object using local time.
 * @param hours A numeric value equal to the hours value.
 * @param min A numeric value equal to the minutes value.
 * @param sec A numeric value equal to the seconds value.
 * @param ms A numeric value equal to the milliseconds value.
 */
export function date_set_hour(
	current_date: Date = new Date,
	hours: number,
	min?: number,
	sec?: number,
	ms?: number
): number {
	return current_date.setHours(
		hours,
		min ?? date_minute(current_date),
		sec ?? date_second(current_date),
		ms ?? date_millisecond(current_date)
	)
}

/**
 * Sets the numeric day-of-the-month value of the Date object using local time.
 * @param date A numeric value equal to the day of the month.
 */
export function date_set_date(current_date: Date = new Date, date: number): number {
	return current_date.setDate(date)
}

/**
 * Sets the month value in the Date object using local time.
 * @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
 * @param date A numeric value representing the day of the month. If this value is not supplied, the value from a call to the getDate method is used.
 */
export function date_set_month(
	current_date: Date = new Date(),
	month: number,
	date?: number
): number {
	return current_date.setMonth(month, date ?? date_date(current_date))
}

/**
 * Sets the year of the Date object using local time.
 * @param year A numeric value for the year.
 * @param month A zero-based numeric value for the month (0 for January, 11 for December). Must be specified if numDate is specified.
 * @param date A numeric value equal for the day of the month.
 */
export function date_set_year(
	current_date: Date = new Date,
	year: number,
	month?: number,
	date?: number
): number {
	return current_date.setFullYear(
		year,
		month ?? date_month(current_date),
		date ?? date_date(current_date)
	)
}

/** Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. */
export function date_gettime(date: Date): number {
	return date.getTime()
}

/** Returns a date converted to a string using Universal Coordinated Time (UTC). */
export function date_to_UTC(date: Date): string {
	return date.toUTCString()
}

export function get_current_date(): Date {
	return new Date()
}

/** Gets the year, using local time. */
export function date_year(date: Date = new Date()): number {
	return date.getFullYear()
}

/** Gets the month, using local time. */
export function date_month(date: Date = new Date()): number {
	return date.getMonth()
}

/** Gets the day-of-the-month, using local time. */
export function date_date(date: Date = new Date()): number {
	return date.getDate()
}

/** Gets the hours in a date, using local time. */
export function date_hour(date: Date = new Date()): number {
	return date.getHours()
}

/** Gets the minutes of a Date object, using local time. */
export function date_minute(date: Date = new Date()): number {
	return date.getMinutes()
}

/**
 * Parses a string containing a date, and returns the number of milliseconds between that date and midnight, January 1, 1970.
 * @param date A date string
 */
export function date_parse(date: string): number {
	return Date.parse(date)
}

/** Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC. */
export function date_valueof(date: Date): number {
	return date.valueOf()
}

/** Returns a date as a string value in ISO format. */
export function date_iso(date: Date = new Date): string {
	return date.toISOString()
}

export function is_same_date_YMD(date1: Date, date2: Date): boolean {
	return (
		date_year(date1) == date_year(date2) &&
		date_month(date1) == date_month(date2) &&
		date_date(date1) == date_date(date2)
	)
}

export function is_same_date_YM(date1: Date, date2: Date): boolean {
	return (
		date_year(date1) == date_year(date2) &&
		date_month(date1) == date_month(date2)
	)
}

export function is_same_date_Y(date1: Date, date2: Date): boolean {
	return (
		date_year(date1) == date_year(date2)
	)
}

export function date_in_range_YMD(date: Date, min: Date, max: Date): boolean {
	const dateValue = date_valueof(new Date(date_year(date), date_month(date), date_date(date)))
	const minValue = date_valueof(new Date(date_year(min), date_month(min), date_date(min)))
	const maxValue = date_valueof(new Date(date_year(max), date_month(max), date_date(max)))

	return minValue <= dateValue && dateValue <= maxValue
}

export function date_in_range_YMD_HM(date: Date, min: Date, max: Date): boolean {
	const dateValue = date_valueof(new Date(date_year(date), date_month(date), date_date(date), date_hour(date), date_minute(date)))
	const minValue = date_valueof(new Date(date_year(min), date_month(min), date_date(min), date_hour(min), date_minute(min)))
	const maxValue = date_valueof(new Date(date_year(max), date_month(max), date_date(max), date_hour(max), date_minute(max)))

	return minValue <= dateValue && dateValue <= maxValue
}

export function date_out_range_YMD(date: Date, min: Date, max: Date): boolean {
	return !date_in_range_YMD(date, min, max)
}

export function date_out_range_YMD_HM(date: Date, min: Date, max: Date): boolean {
	return !date_in_range_YMD_HM(date, min, max)
}

export function date_in_range_YM(date: Date, min: Date, max: Date): boolean {
	const dateValue = date_valueof(new Date(date_year(date), date_month(date)))
	const minValue = date_valueof(new Date(date_year(min), date_month(min)))
	const maxValue = date_valueof(new Date(date_year(max), date_month(max)))

	return minValue <= dateValue && dateValue <= maxValue
}

export function date_out_range_YM(date: Date, min: Date, max: Date): boolean {
	return !date_in_range_YM(date, min, max)
}

export function date_in_range_Y(date: Date, min: Date, max: Date): boolean {
	const dateValue = date_year(date)
	const minValue = date_year(min)
	const maxValue = date_year(max)

	return minValue <= dateValue && dateValue <= maxValue
}

export function date_out_range_Y(date: Date, min: Date, max: Date): boolean {
	return !date_in_range_Y(date, min, max)
}

export function date_weekday_names(locales: Intl.LocalesArgument = 'en-US'): string[] {
	const weekdays: string[] = []
	const formatter = new Intl.DateTimeFormat(locales, { weekday: 'long' })

	for (let i = 0; i < 7; i++) {
		const date = new Date(2024, 0, i)
		array_push(weekdays, formatter.format(date))
	}

	return weekdays
}

export function date_month_names(locales: Intl.LocalesArgument = 'en-US'): string[] {
	const months: string[] = []
	const formatter = new Intl.DateTimeFormat(locales, { month: 'long' })

	for (let i = 0; i < 12; i++) {
		const date = new Date(2024, i)
		array_push(months, formatter.format(date))
	}

	return months
}

export function date_text_date(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
	return date.toLocaleDateString(locales, { weekday: 'long' })
}

export function date_text_month(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
	return date.toLocaleDateString(locales, {month: 'long'})
}

export function date_text_YMD(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
	return date.toLocaleDateString(locales, {day: 'numeric', month: 'long', year: 'numeric'})
}

export function date_text_YMD_HM(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
	return date.toLocaleDateString(locales, {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'})
}

export function date_diff_in_days(date1: Date, date2: Date): number {
	const MS_PER_DAY = 1000 * 60 * 60 * 24
	const utc1 = Date.UTC(date_year(date1), date_month(date1), date_date(date1))
	const utc2 = Date.UTC(date_year(date2), date_month(date2), date_date(date2))

	return math_floor((utc2 - utc1) / MS_PER_DAY)
}