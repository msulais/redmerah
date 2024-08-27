import { For, Match, Switch, createEffect, createMemo, createSignal, mergeProps, splitProps, type VoidComponent } from "solid-js"

import { _ref, _date, _onSelectDate, _firstDate, _lastDate, _locales, _classList, _children, _onClose, _day, _getDay, _includes, _setMonth, _month, _setFullYear, _year, _substring, _fill, _filled, _outlined } from "@/data/string"
import { getCurrentDate, getDate_Y, getDate_M, getWeekdayNames, isOutDate_YMD, isSameDate_YMD, getMonthNames, isOutDate_YM, isSameDate_YM, isOutDate_Y, isSameDate_Y, getMonthText } from "@/utils/datetime"

import Button, { ButtonVariant, IconButton } from "@/components/Button"
import { repositionModal, closeModal, openModal, focusModal, Modal, type ModalProps } from "@/components/Modal"
import './index.scss'

enum DatePickerOption {
    year,
    month,
    day
}

type DatePickerProps = ModalProps & {
    date?: Date
    firstDate?: Date
    lastDate?: Date
    locales?: Intl.LocalesArgument
    onSelectDate?: (value: Date) => unknown
}

const DatePicker: VoidComponent<DatePickerProps> = ($props) => {
    const $$props = mergeProps({
        locales:'en-US',
        date: getCurrentDate(),
        firstDate: new Date(getDate_Y() - 100, 0, 1),
        lastDate: new Date(getDate_Y() + 100, 11, 31),
    }, $props)
    const [props, other] = splitProps($$props, [
        _ref, _date, _onSelectDate,
        _firstDate, _lastDate, _locales,
        _classList, _children, _onClose
    ])
    const [value, setValue] = createSignal<Date>(getCurrentDate())
    const [dateOption, setDateOption] = createSignal<DatePickerOption>(DatePickerOption[_day])
    const [viewDate, setViewDate] = createSignal<Date>(getCurrentDate())
    const [startDay, setStartDay] = createSignal<number>(0)
    const [daysPerMonth, setDaysPerMonth] = createSignal<number>(31)
    const dateNow = getCurrentDate()
    let datePicker_ref: HTMLDialogElement

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

    createEffect(() => {
        const date = props[_date]
        
        setViewDate(date)
        setValue(date)
    })

    const DaysDate: VoidComponent = () => {
        return (<>
            <div class="date-picker-days-name">
                <For each={getWeekdayNames(props[_locales])}>{d => <p>{d[_substring](0, 2)}</p>}</For>
            </div>
            <div class="date-picker-days">
                <For each={Array(startDay())[_fill](0)}>{v => <div/>}</For>
                <For each={Array(daysPerMonth())[_fill](0)}>{(v, i) => {
                    const date = createMemo(() => new Date(getDate_Y(viewDate()), getDate_M(viewDate()), i() + 1))
                    return (<Button
                        onClick={() => {
                            setValue(date())
                            if (props[_onSelectDate]) props[_onSelectDate](date())
                                
                            closeModal(datePicker_ref)
                        }}
                        classList={{'icon-btn': true}}
                        disabled={isOutDate_YMD(date(), props[_firstDate], props[_lastDate])}
                        variant={isSameDate_YMD(date(), value())
                            ? ButtonVariant[_filled]
                            : isSameDate_YMD(date(), dateNow)
                                ? ButtonVariant[_outlined]
                                : undefined
                        }>
                        { i() + 1 }
                    </Button>)
                }}</For>
            </div>
        </>)
    }

    const MonthsDate: VoidComponent = () => {
        return (<div class="date-picker-month">
            <For each={getMonthNames(props[_locales])}>{(m, i) => {
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
        return (<div class="date-picker-year">
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

    return (<Modal
        ref={r => {
            datePicker_ref = r
            if (props[_ref]) props[_ref](r)
        }}
        classList={{
            'date-picker': true, 
            ...props[_classList]
        }}
        onClose={(ev) => {
            setDateOption(DatePickerOption[_day])
            if (props[_onClose]) props[_onClose](ev)
        }}
        {...other}>
        <div class="date-picker-header">
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
            <IconButton filled code={0xE366} onClick={() => previous()}/>
            <IconButton filled code={0xE368} onClick={() => next()}/>
        </div>
        <Switch>
            <Match when={dateOption() == DatePickerOption[_day]}><DaysDate/></Match>
            <Match when={dateOption() == DatePickerOption[_month]}><MonthsDate/></Match>
            <Match when={dateOption() == DatePickerOption[_year]}><YearsDate/></Match>
        </Switch>
        {props[_children]}
    </Modal>)
}

export {
    DatePicker, 
    openModal as openDatePicker,
    closeModal as closeDatePicker,
    focusModal as focusDatePicker, 
    repositionModal as repositionDatePicker
}
export type {
    DatePickerProps
}
export default DatePicker