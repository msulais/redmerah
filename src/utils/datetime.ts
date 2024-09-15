import { _format, _getDate, _getFullYear, _getHours, _getMinutes, _getMonth, _long, _numeric, _push, _toLocaleDateString, _UTC, _valueOf } from "@/constants/string"
import { mathFloor } from "./math"

export function getCurrentDate(): Date {
    return new Date()
}

export function getDate_Y(date: Date = new Date()): number {
    return date[_getFullYear]()
}

export function getDate_M(date: Date = new Date()): number {
    return date[_getMonth]()
}

export function getDate_D(date: Date = new Date()): number {
    return date[_getDate]()
}

export function getDate_H(date: Date = new Date()): number {
    return date[_getHours]()
}

export function getDate_Min(date: Date = new Date()): number {
    return date[_getMinutes]()
}

export function getDateValue(date: Date): number {
    return date[_valueOf]()
}

export function isSameDate_YMD(date1: Date, date2: Date): boolean {
    return (
        getDate_Y(date1) == getDate_Y(date2) &&
        getDate_M(date1) == getDate_M(date2) &&
        getDate_D(date1) == getDate_D(date2)
    )
}

export function isSameDate_YM(date1: Date, date2: Date): boolean {
    return (
        getDate_Y(date1) == getDate_Y(date2) &&
        getDate_M(date1) == getDate_M(date2)
    )
}

export function isSameDate_Y(date1: Date, date2: Date): boolean {
    return (
        getDate_Y(date1) == getDate_Y(date2)
    )
}

export function isInDate_YMD(date: Date, min: Date, max: Date): boolean {
    const dateValue = getDateValue(new Date(getDate_Y(date), getDate_M(date), getDate_D(date)))
    const minValue = getDateValue(new Date(getDate_Y(min), getDate_M(min), getDate_D(min)))
    const maxValue = getDateValue(new Date(getDate_Y(max), getDate_M(max), getDate_D(max)))

    return minValue <= dateValue && dateValue <= maxValue
}

export function isInDate_YMD_HM(date: Date, min: Date, max: Date): boolean {
    const dateValue = getDateValue(new Date(getDate_Y(date), getDate_M(date), getDate_D(date), getDate_H(date), getDate_Min(date)))
    const minValue = getDateValue(new Date(getDate_Y(min), getDate_M(min), getDate_D(min), getDate_H(min), getDate_Min(min)))
    const maxValue = getDateValue(new Date(getDate_Y(max), getDate_M(max), getDate_D(max), getDate_H(max), getDate_Min(max)))

    return minValue <= dateValue && dateValue <= maxValue
}

export function isOutDate_YMD(date: Date, min: Date, max: Date): boolean {
    return !isInDate_YMD(date, min, max)
}

export function isOutDate_YMD_HM(date: Date, min: Date, max: Date): boolean {
    return !isInDate_YMD_HM(date, min, max)
}

export function isInDate_YM(date: Date, min: Date, max: Date): boolean {
    const dateValue = getDateValue(new Date(getDate_Y(date), getDate_M(date)))
    const minValue = getDateValue(new Date(getDate_Y(min), getDate_M(min)))
    const maxValue = getDateValue(new Date(getDate_Y(max), getDate_M(max)))

    return minValue <= dateValue && dateValue <= maxValue
}

export function isOutDate_YM(date: Date, min: Date, max: Date): boolean {
    return !isInDate_YM(date, min, max)
}

export function isInDate_Y(date: Date, min: Date, max: Date): boolean {
    const dateValue = getDate_Y(date)
    const minValue = getDate_Y(min)
    const maxValue = getDate_Y(max)

    return minValue <= dateValue && dateValue <= maxValue
}

export function isOutDate_Y(date: Date, min: Date, max: Date): boolean {
    return !isInDate_Y(date, min, max)
}

export function getWeekdayNames(locales: Intl.LocalesArgument = 'en-US'): string[] {
    const weekdays: string[] = []
    const dateFormatter = new Intl.DateTimeFormat(locales, { weekday: _long })

    for (let i = 0; i < 7; i++) {
        const date = new Date(2024, 0, i)
        weekdays[_push](dateFormatter[_format](date))
    }

    return weekdays
}

export function getMonthNames(locales: Intl.LocalesArgument = 'en-US'): string[] {
    const months: string[] = []
    const dateFormatter = new Intl.DateTimeFormat(locales, { month: _long })

    for (let i = 0; i < 12; i++) {
        const date = new Date(2024, i)
        months[_push](dateFormatter[_format](date))
    }

    return months
}

export function getDayText(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
    return date[_toLocaleDateString](locales, { weekday: _long })
}

export function getMonthText(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
    return date[_toLocaleDateString](locales, {month: _long})
}

export function getDateString_YMD(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
    return date[_toLocaleDateString](locales, {day: _numeric, month: _long, year: _numeric})
}

export function getDateString_YMD_HM(date: Date, locales: Intl.LocalesArgument = 'en-US'): string {
    return date[_toLocaleDateString](locales, {day: _numeric, month: _long, year: _numeric, hour: '2-digit', minute: '2-digit'})
}

export function dateDifferenceInDays(date1: Date, date2: Date): number {
    const MS_PER_DAY = 1000 * 60 * 60 * 24
    const utc1 = Date[_UTC](getDate_Y(date1), getDate_M(date1), getDate_D(date1))
    const utc2 = Date[_UTC](getDate_Y(date2), getDate_M(date2), getDate_D(date2))

    return mathFloor((utc2 - utc1) / MS_PER_DAY)
}