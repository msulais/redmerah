import { createEffect, createMemo, createSignal, For, Match, mergeProps, onCleanup, onMount, Show, splitProps, Switch, type JSX, type VoidComponent } from 'solid-js'
import { Portal } from 'solid-js/web'

import type { ComponentEvent } from '@/types/event'
import { TimeFormat } from '@/enums/datetime'
import { getCurrentDate, getDate_M, getDate_Y, getMonthNames, getMonthText, getWeekdayNames, isOutDate_Y, isOutDate_YM, isOutDate_YMD, isSameDate_Y, isSameDate_YM, isSameDate_YMD } from '@/utils/datetime'
import { _onClose, _onToggle, _onCancel, _ref, _initialDate, _onSelectDateTime, _firstDate, _lastDate, _locales, _day, _getDay, _includes, _setMonth, _month, _setFullYear, _year, _open, _observe, _disconnect, _substring, _fill, _filled, _outlined, _auto, _currentTarget, _value, _filledTonal, _map, _getHours, _getMinutes, _padEnd, _padStart, _timeFormat, _$12hour, _AM, _PM, _$24hour, _setMinutes, _getDate, _getFullYear, _getMonth, _setDate, _setHours } from '@/data/string'
import { PopoverAttributes } from '@/enums/attributes'
import { hasAttribute } from '@/utils/attributes'
import { preventDefault } from '@/utils/event'
import { initPopover, closePopover } from '@/utils/popover'
import { clearTimeDelayed, setTimeDelayed } from '@/utils/timeout'

import Icon from '../Icon'
import Button, { ButtonVariant } from '../Button'
import Dropdown from '../Dropdown'
import './index.scss'
import { numberParse } from '@/utils/math'

enum DatePickerOption {
    year = 'y', 
    month = 'm', 
    day = 'd'
}

type DateTimePickerProps = Omit<
    JSX.DialogHtmlAttributes<HTMLDialogElement>, 
    'ref' | 'onToggle' | 'onClose' | 'onCancel' | 'children'
> & {
    value?: Date
    firstDate?: Date
    lastDate?: Date
    locales?: Intl.LocalesArgument
    ref?: (el: HTMLDialogElement) => void
    onToggle?: (value: boolean) => unknown
    onSelectDateTimeTime?: (value: Date) => unknown
    onSelectDateTime?: (value: Date) => unknown
    onClose?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
    onCancel?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
}

const DateTimePicker: VoidComponent<DateTimePickerProps> = ($props) => {
    const $$props = mergeProps({
        locales:'en-US',
        value: getCurrentDate(),
        firstDate: new Date(getDate_Y() - 100, 0, 1),
        lastDate: new Date(getDate_Y() + 100, 11, 31),
    }, $props)
    const [props, other] = splitProps($$props, [
        _onClose, _onToggle, _onCancel, 
        _ref, _value, _onSelectDateTime,
        _firstDate, _lastDate, _locales, 
    ])
    const [value, setValue] = createSignal<Date>(getCurrentDate())
    const [dateOption, setDateOption] = createSignal<DatePickerOption>(DatePickerOption[_day])
    const [viewDate, setViewDate] = createSignal<Date>(getCurrentDate())
    const [startDay, setStartDay] = createSignal<number>(0)
    const [daysPerMonth, setDaysPerMonth] = createSignal<number>(31)
    const [isTime24HourFormat, setIsTime24HourFormat] = createSignal<boolean>(false)
    const [isTimePMFormat, setIsTimePMFormat] = createSignal<boolean>(false)
    const isTimeAMFormat = createMemo(() => !isTimePMFormat() && !isTime24HourFormat())
    const weekDays = getWeekdayNames(props[_locales])
    const months = getMonthNames(props[_locales])
    const dateNow = getCurrentDate()
    let dateTimePickerRef: HTMLDialogElement

    function updateDateView(): void {
        let daysPerMonth = 31 // reset to default
        setStartDay(new Date(getDate_Y(viewDate()), getDate_M(viewDate()), 1)[_getDay]())

        // february
        if (getDate_M(viewDate()) == 1) {
            daysPerMonth = 28
            if (getDate_Y(viewDate()) % 4 == 0) daysPerMonth = 29
        } 

        // april, june, september, november
        else if ([3, 5, 8, 10][_includes](getDate_M(viewDate()))) daysPerMonth = 30

        setDaysPerMonth(daysPerMonth)
    }

    function next(): void {
        const newDate = new Date(viewDate())
        if (dateOption() == DatePickerOption[_day]) newDate[_setMonth](getDate_M(newDate) + 1)
        else if (dateOption() == DatePickerOption[_month]) newDate[_setFullYear](getDate_Y(newDate) + 1)
        else if (dateOption() == DatePickerOption[_year]) newDate[_setFullYear](getDate_Y(newDate) + 16)

        setViewDate(newDate)
        updateDateView()
    }

    function previous(): void {
        const newDate = new Date(viewDate())
        if (dateOption() == DatePickerOption[_day]) newDate[_setMonth](getDate_M(newDate) - 1)
        else if (dateOption() == DatePickerOption[_month]) newDate[_setFullYear](getDate_Y(newDate) - 1)
        else if (dateOption() == DatePickerOption[_year]) newDate[_setFullYear](getDate_Y(newDate) - 16)

        setViewDate(newDate)
        updateDateView()
    }

    onMount(() => {
        let timeout: null | number = null
        const observer = initPopover(dateTimePickerRef)
        const isOpenObserver = new MutationObserver(() => {
            if (timeout) clearTimeDelayed(timeout)
            
            // [data-open] is not the only attribute that trigger this callback
            timeout = setTimeDelayed(() => {
                const isOpen = hasAttribute(dateTimePickerRef, PopoverAttributes[_open])
                if (props[_onToggle]) props[_onToggle](isOpen)
                if (isOpen) {
                    updateDateView()
                }
            }, 50)
        })
        isOpenObserver[_observe](dateTimePickerRef, {attributes: true})
        onCleanup(() => {
            if (observer) observer[_disconnect]()
            isOpenObserver[_disconnect]()
        })
    })

    createEffect(() => {
        setViewDate(props[_value])
        setValue(props[_value])
    })

    const DaysDate: VoidComponent = () => {
        return (<>
            <div class="datetime-picker-days-name">
                <For each={weekDays}>{d => <p>{d[_substring](0, 2)}</p>}</For>
            </div>
            <div class="datetime-picker-days">
                <For each={Array(startDay())[_fill](0)}>{v => <div/>}</For>
                <For each={Array(daysPerMonth())[_fill](0)}>{(v, i) => {
                    const date = createMemo(() => new Date(getDate_Y(viewDate()), getDate_M(viewDate()), i() + 1))
                    return (<Button
                        onClick={() => {
                            const d = new Date(value())
                            d[_setDate](date()[_getDate]())
                            d[_setMonth](date()[_getMonth]())
                            d[_setFullYear](date()[_getFullYear]())
                            setValue(d)
                        }}
                        disabled={isOutDate_YMD(date(), props[_firstDate], props[_lastDate])}
                        variant={isSameDate_YMD(date(), value())
                            ? ButtonVariant[_filled]
                            : isSameDate_YMD(date(), dateNow)
                                ? ButtonVariant[_outlined]
                                : undefined
                        }
                        iconOnly>
                        { i() + 1 }
                    </Button>)
                }}</For>
            </div>
        </>)
    }

    const MonthsDate: VoidComponent = () => {
        return (<div class="datetime-picker-month">
            <For each={months}>{(m, i) => {
                const date = createMemo(() => new Date(getDate_Y(viewDate()), i()))
                return (<Button
                    onClick={() => {
                        setViewDate(date())
                        setDateOption(DatePickerOption[_day])
                        updateDateView()
                    }}
                    disabled={isOutDate_YM(date(), props[_firstDate], props[_lastDate])}
                    variant={isSameDate_YM(date(), value())
                        ? ButtonVariant[_filled]
                        : isSameDate_YM(date(), dateNow)
                            ? ButtonVariant[_outlined]
                            : undefined
                    }>{m}</Button>)
            }}</For>
        </div>)
    }

    const YearsDate: VoidComponent = () => {
        return (<div class="datetime-picker-year">
            <For each={Array(16)[_fill](0)}>{(v, i) => {
                const date = createMemo(() => new Date(getDate_Y(viewDate()) + i(), 0))
                return (<Button
                    onClick={() => {
                        setViewDate(date())
                        setDateOption(DatePickerOption[_month])
                        updateDateView()
                    }}
                    disabled={isOutDate_Y(date(), props[_firstDate], props[_lastDate])}
                    variant={isSameDate_Y(date(), value())
                        ? ButtonVariant[_filled]
                        : isSameDate_Y(date(), dateNow)
                            ? ButtonVariant[_outlined]
                            : undefined
                    }>
                    {getDate_Y(viewDate()) + i()}
                </Button>)
            }}</For>
        </div>)
    }
    
    return (<Portal><dialog 
        class="datetime-picker" 
        ref={(r) => {
            dateTimePickerRef = r
            if (props[_ref]) props[_ref](r)
        }}
        data-popover
        data-dismiss={_auto}
        onClose={(ev) => {
            if (props[_onClose]) props[_onClose](ev)
            if (props[_onToggle]) props[_onToggle](false)
            setDateOption(DatePickerOption[_day])
        }}
        // TODO: implement onKeyDown
        onCancel={(ev) => {
            preventDefault(ev)
            if (props[_onCancel]) props[_onCancel](ev)
            if (props[_onToggle]) props[_onToggle](false)
            closePopover(ev[_currentTarget])
        }}
        {...other}>
        <div>
            <div class="datetime-picker-header">
                <Button 
                    onClick={() => setDateOption(d => {
                        if (d == DatePickerOption[_month]) return DatePickerOption[_year]
                        return DatePickerOption[_month]
                    })}>
                    <Switch>
                        <Match when={dateOption() == DatePickerOption[_day]}>
                            {getMonthText(viewDate(), props[_locales]) + ' ' + getDate_Y(viewDate())}
                        </Match>
                        <Match when={dateOption() == DatePickerOption[_month]}>
                            {getDate_Y(viewDate())}
                        </Match>
                        <Match when={dateOption() == DatePickerOption[_year]}>
                            {getDate_Y(viewDate()) + '-' + (getDate_Y(viewDate()) + 15)}
                        </Match>
                    </Switch>
                </Button>
                <Button iconOnly onClick={() => previous()}><Icon filled code={0xE366}/></Button>
                <Button iconOnly onClick={() => next()}><Icon filled code={0xE368}/></Button>
            </div>
            <Switch>
                <Match when={dateOption() == DatePickerOption[_day]}><DaysDate/></Match>
                <Match when={dateOption() == DatePickerOption[_month]}><MonthsDate/></Match>
                <Match when={dateOption() == DatePickerOption[_year]}><YearsDate/></Match>
            </Switch>
            <div class="datetime-picker-time">
                <Dropdown 
                    labelText="Hour" 
                    selectedValues={[isTime24HourFormat()
                        ? `${value()[_getHours]()}`
                        : `${value()[_getHours]() - (value()[_getHours]() > 12? 12 : 0)}`
                    ]} 
                    onValueChanged={(values) => setValue(v => (v[_setHours](numberParse(values[0], true) + (isTimePMFormat()? 12 : 0)), v))}
                    items={[
                        ['0', '00'],
                        ...new Array(isTime24HourFormat()? 23 : 11)[_fill](1)[_map]((v, i) => [`${i+1}`, `${i+1}`[_padStart](2, '0')] as [value: string, text: string]),
                    ]}
                />
                <Dropdown 
                    labelText="Minute" 
                    selectedValues={[`${value()[_getMinutes]()}`]} 
                    onValueChanged={(values) => setValue(v => (v[_setMinutes](numberParse(values[0], true)), v))}
                    items={new Array(60)[_fill](1)[_map]((v, i) => [`${i}`, `${i}`[_padStart](2, '0')] as [value: string, text: string])}
                />
                <Dropdown 
                    selectedValues={[_AM]} 
                    onValueChanged={(v) => {
                        const hour = value()[_getHours]()
                        // from AM to PM
                        if (isTimeAMFormat() && v[0] == _PM) {
                            setValue(v => (v[_setHours](hour + (hour > 0? 12 : 0)), v))
                        }

                        // from PM to AM
                        else if (!isTime24HourFormat() && isTimePMFormat() && v[0] == _AM) {
                            setValue(v => (v[_setHours](hour - (hour > 0? 12 : 0)), v))
                        }

                        // from 24hour to PM
                        else if (isTime24HourFormat() && hour < 12 && v[0] == _PM) {
                            setValue(v => (v[_setHours](hour + 12), v))
                        }

                        // from 24hour to AM
                        else if (isTime24HourFormat() && hour > 12 && v[0] == _AM) {
                            setValue(v => (v[_setHours](hour - 12), v))
                        }

                        setIsTime24HourFormat(v[0] == TimeFormat[_$24hour]) 
                        setIsTimePMFormat(v[0] == _PM)
                    }}

                    items={[[_AM, _AM], [_PM, _PM], [TimeFormat[_$24hour], '24 hour']]}
                />
            </div>
            <div class="datetime-picker-actions">
                <Button variant={ButtonVariant[_filledTonal]} onClick={() => closePopover(dateTimePickerRef)}>Cancel</Button>
                <Button 
                    variant={ButtonVariant[_filled]} 
                    onClick={() => {
                        if (props[_onSelectDateTime]) props[_onSelectDateTime](value())
                        closePopover(dateTimePickerRef)
                    }}>
                    Select
                </Button>
            </div>
        </div>
    </dialog></Portal>)
}

export default DateTimePicker