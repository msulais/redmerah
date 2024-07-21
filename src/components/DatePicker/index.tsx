import { For, Index, Match, Switch, createEffect, createMemo, createSignal, mergeProps, onCleanup, onMount, splitProps, type JSX, type VoidComponent } from "solid-js"
import { Portal } from "solid-js/web"

import type { ComponentEvent } from "@/types/event"
import { _auto, _onClose, _onToggle, _onCancel, _dismiss, _children, _ref, _open, _observe, _disconnect, _currentTarget, _manual, _initialDate, _firstDate, _lastDate, _getFullYear, _day, _locales, _month, _year, _getDay, _includes, _setFullYear, _setMonth, _fill, _onSubmit, _outlined, _filled, _onSelectDate, _substring } from "@/data/string"
import { PopoverAttributes } from "@/enums/attributes"
import { hasAttribute } from "@/utils/attributes"
import { preventDefault } from "@/utils/event"
import { closePopover, initPopover } from "@/utils/popover"
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout"
import { mathMax } from "@/utils/math"
import { getWeekdayNames, getMonthNames, getDate_Y, getCurrentDate, getDate_M, getMonthText, isOutDate_YMD, isSameDate_YMD, isSameDate_YM, isOutDate_YM, isOutDate_Y, isSameDate_Y } from "@/utils/datetime"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import './index.scss'

enum DatePickerOption {
    year = 'y', 
    month = 'm', 
    day = 'd'
}

type DatePickerProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'ref' | 'onToggle' | 'onClose' | 'onCancel'> & {
    initialDate?: Date
    firstDate?: Date
    lastDate?: Date
    locales?: Intl.LocalesArgument
    ref?: (el: HTMLDialogElement) => void
    onToggle?: (value: boolean) => unknown
    onSelectDate?: (value: Date) => unknown
    onClose?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
    onCancel?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
}

const DatePicker: VoidComponent<DatePickerProps> = ($props) => {
    const $$props = mergeProps({
        locales:'en-US',
        initialDate: getCurrentDate(),
        firstDate: new Date(getDate_Y() - 100, 0, 1),
        lastDate: new Date(getDate_Y() + 100, 11, 31),
    }, $props)
    const [props, other] = splitProps($$props, [
        _onClose, _onToggle, _onCancel, 
        _ref, _initialDate, _onSelectDate,
        _firstDate, _lastDate, _locales
    ])
    const [dateOption, setDateOption] = createSignal<DatePickerOption>(DatePickerOption[_day])
    const [currentDate, setCurrentDate] = createSignal<Date>(getCurrentDate())
    const [startDay, setStartDay] = createSignal<number>(0)
    const [daysPerMonth, setDaysPerMonth] = createSignal<number>(31)
    const weekDays = getWeekdayNames(props[_locales])
    const months = getMonthNames(props[_locales])
    const dateNow = getCurrentDate()
    let datePickerRef: HTMLDialogElement

    function updateDateView(): void {
        let daysPerMonth = 31 // reset to default
        setStartDay(new Date(getDate_Y(currentDate()), getDate_M(currentDate()), 1)[_getDay]())

        // february
        if (getDate_M(currentDate()) == 1) {
            daysPerMonth = 28
            if (getDate_Y(currentDate()) % 4 == 0) daysPerMonth = 29
        } 

        // april, june, september, november
        else if ([3, 5, 8, 10][_includes](getDate_M(currentDate()))) daysPerMonth = 30

        setDaysPerMonth(daysPerMonth)
    }

    function next(): void {
        const newDate = new Date(currentDate())
        if (dateOption() == DatePickerOption[_day]) newDate[_setMonth](getDate_M(newDate) + 1)
        else if (dateOption() == DatePickerOption[_month]) newDate[_setFullYear](getDate_Y(newDate) + 1)
        else if (dateOption() == DatePickerOption[_year]) newDate[_setFullYear](getDate_Y(newDate) + 16)

        setCurrentDate(newDate)
        updateDateView()
    }

    function previous(): void {
        const newDate = new Date(currentDate())
        if (dateOption() == DatePickerOption[_day]) newDate[_setMonth](getDate_M(newDate) - 1)
        else if (dateOption() == DatePickerOption[_month]) newDate[_setFullYear](getDate_Y(newDate) - 1)
        else if (dateOption() == DatePickerOption[_year]) newDate[_setFullYear](getDate_Y(newDate) - 16)

        setCurrentDate(newDate)
        updateDateView()
    }

    onMount(() => {
        let timeout: null | number = null
        const observer = initPopover(datePickerRef)
        const isOpenObserver = new MutationObserver(() => {
            if (timeout) clearTimeDelayed(timeout)
            
            // [data-open] is not the only attribute that trigger this callback
            timeout = setTimeDelayed(() => {
                const isOpen = hasAttribute(datePickerRef, PopoverAttributes[_open])
                if (props[_onToggle]) props[_onToggle](isOpen)
                if (isOpen) {
                    updateDateView()
                }
            }, 50)
        })
        isOpenObserver[_observe](datePickerRef, {attributes: true})
        onCleanup(() => {
            if (observer) observer[_disconnect]()
            isOpenObserver[_disconnect]()
        })
    })

    createEffect(() => {
        setCurrentDate(props[_initialDate])
    })

    const DaysDate: VoidComponent = () => {
        return (<>
            <div class="date-picker-days-name">
                <For each={weekDays}>{d => <p>{d[_substring](0, 2)}</p>}</For>
            </div>
            <div class="date-picker-days">
                <For each={Array(startDay())[_fill](0)}>{v => <div/>}</For>
                <For each={Array(daysPerMonth())[_fill](0)}>{(v, i) => {
                    const date = createMemo(() => new Date(getDate_Y(currentDate()), getDate_M(currentDate()), i() + 1))
                    return (<Button
                        onClick={() => {
                            if (props[_onSelectDate]) props[_onSelectDate](date())
                            closePopover(datePickerRef)
                        }}
                        disabled={isOutDate_YMD(date(), props[_firstDate], props[_lastDate])}
                        variant={isSameDate_YMD(date(), props[_initialDate])
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
        return (<div class="date-picker-month">
            <For each={months}>{(m, i) => {
                const date = createMemo(() => new Date(getDate_Y(currentDate()), i()))
                return (<Button
                    onClick={() => {
                        setCurrentDate(date())
                        setDateOption(DatePickerOption[_day])
                        updateDateView()
                    }}
                    disabled={isOutDate_YM(date(), props[_firstDate], props[_lastDate])}
                    variant={isSameDate_YM(date(), props[_initialDate])
                        ? ButtonVariant[_filled]
                        : isSameDate_YM(date(), dateNow)
                            ? ButtonVariant[_outlined]
                            : undefined
                    }>{m}</Button>)
            }}</For>
        </div>)
    }

    const YearsDate: VoidComponent = () => {
        return (<div class="date-picker-year">
            <For each={Array(16)[_fill](0)}>{(v, i) => {
                const date = createMemo(() => new Date(getDate_Y(currentDate()) + i(), 0))
                return (<Button
                    onClick={() => {
                        setCurrentDate(date())
                        setDateOption(DatePickerOption[_month])
                        updateDateView()
                    }}
                    disabled={isOutDate_Y(date(), props[_firstDate], props[_lastDate])}
                    variant={isSameDate_Y(date(), props[_initialDate])
                        ? ButtonVariant[_filled]
                        : isSameDate_Y(date(), dateNow)
                            ? ButtonVariant[_outlined]
                            : undefined
                    }>
                    {getDate_Y(currentDate()) + i()}
                </Button>)
            }}</For>
        </div>)
    }
    
    return (<Portal><dialog 
        class="date-picker" 
        ref={(r) => {
            datePickerRef = r
            if (props[_ref]) props[_ref](r)
        }}
        data-popover
        data-dismiss={_auto}
        onClose={(ev) => {
            if (props[_onClose]) props[_onClose](ev)
            if (props[_onToggle]) props[_onToggle](false)
            setDateOption(DatePickerOption[_day])
        }}
        onCancel={(ev) => {
            preventDefault(ev)
            if (props[_onCancel]) props[_onCancel](ev)
            if (props[_onToggle]) props[_onToggle](false)
            closePopover(ev[_currentTarget])
        }}
        {...other}>
        <div>
            <div class="date-picker-header">
                <Button 
                    onClick={() => setDateOption(d => {
                        if (d == DatePickerOption[_month]) return DatePickerOption[_year]
                        return DatePickerOption[_month]
                    })}>
                    <Switch>
                        <Match when={dateOption() == DatePickerOption[_day]}>
                            {getMonthText(currentDate(), props[_locales]) + ' ' + getDate_Y(currentDate())}
                        </Match>
                        <Match when={dateOption() == DatePickerOption[_month]}>
                            {getDate_Y(currentDate())}
                        </Match>
                        <Match when={dateOption() == DatePickerOption[_year]}>
                            {getDate_Y(currentDate()) + '-' + (getDate_Y(currentDate()) + 15)}
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
        </div>
    </dialog></Portal>)
}

export default DatePicker