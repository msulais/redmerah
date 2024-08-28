import { createEffect, createMemo, createSignal, For, Match, mergeProps, splitProps, Switch, type VoidComponent } from 'solid-js'

import { _ref, _datetime, _onSelectDateTime, _firstDate, _lastDate, _locales, _children, _classList, _onClose, _day, _getDay, _includes, _setMonth, _month, _setFullYear, _year, _substring, _fill, _setDate, _getDate, _getMonth, _getFullYear, _filled, _outlined, _getHours, _setHours, _map, _padStart, _getMinutes, _setMinutes, _AM, _PM, _$24hour, _tonal } from '@/data/string'
import { getCurrentDate, getDate_Y, getDate_M, getWeekdayNames, isOutDate_YMD, isSameDate_YMD, getMonthNames, isOutDate_YM, isSameDate_YM, isOutDate_Y, isSameDate_Y, getMonthText } from '@/utils/datetime'
import { TimeFormat } from '@/enums/datetime'
import { numberParse } from '@/utils/math'

import Button, { ButtonVariant, IconButton } from '@/components/Button'
import Dropdown from '@/components/Dropdown'
import { closeModal, openModal, focusModal, Modal, type ModalProps, repositionModal, ModalPosition as DateTimePickerPosition } from '@/components/Modal'
import './index.scss'

enum DatePickerOption {
    year, 
    month, 
    day
}

type DateTimePickerProps = ModalProps & {
    datetime?: Date
    firstDate?: Date
    lastDate?: Date
    locales?: Intl.LocalesArgument
    onSelectDateTime?: (value: Date) => unknown
}

const DateTimePicker: VoidComponent<DateTimePickerProps> = ($props) => {
    const $$props = mergeProps({
        locales:'en-US',
        datetime: getCurrentDate(),
        firstDate: new Date(getDate_Y() - 100, 0, 1),
        lastDate: new Date(getDate_Y() + 100, 11, 31),
    }, $props)
    const [props, other] = splitProps($$props, [
        _ref, _datetime, _onSelectDateTime,
        _firstDate, _lastDate, _locales, 
        _children, _classList, _onClose
    ])
    const [value, setValue] = createSignal<Date>(getCurrentDate())
    const [dateOption, setDateOption] = createSignal<DatePickerOption>(DatePickerOption[_day])
    const [viewDate, setViewDate] = createSignal<Date>(getCurrentDate())
    const [startDay, setStartDay] = createSignal<number>(0)
    const [daysPerMonth, setDaysPerMonth] = createSignal<number>(31)
    const [isTime24HourFormat, setIsTime24HourFormat] = createSignal<boolean>(false)
    const [isTimePMFormat, setIsTimePMFormat] = createSignal<boolean>(false)
    const isTimeAMFormat = createMemo(() => !isTimePMFormat() && !isTime24HourFormat())
    const dateNow = getCurrentDate()
    let dateTimePicker_ref: HTMLDialogElement

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
        const datetime = props[_datetime]
        
        setViewDate(datetime)
        setValue(datetime)
    })

    const DaysDate: VoidComponent = () => {
        return (<>
            <div class="datetime-picker-days-name">
                <For each={getWeekdayNames(props[_locales])}>{d => <p>{d[_substring](0, 2)}</p>}</For>
            </div>
            <div class="datetime-picker-days">
                <For each={Array(startDay())[_fill](0)}>{_v => <div/>}</For>
                <For each={Array(daysPerMonth())[_fill](0)}>{(_v, i) => {
                    const date = createMemo(() => new Date(getDate_Y(viewDate()), getDate_M(viewDate()), i() + 1))
                    return (<Button
                        onClick={() => {
                            const d = new Date(value())
                            d[_setDate](date()[_getDate]())
                            d[_setMonth](date()[_getMonth]())
                            d[_setFullYear](date()[_getFullYear]())
                            setValue(d)
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
        return (<div class="datetime-picker-month">
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
        return (<div class="datetime-picker-year">
            <For each={Array(16)[_fill](0)}>{(_v, i) => {
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
            dateTimePicker_ref = r
            if (props[_ref]) props[_ref](r)
        }}
        classList={{
            'datetime-picker': true, 
            ...props[_classList]
        }}
        onClose={(ev) => {
            setDateOption(DatePickerOption[_day])
            if (props[_onClose]) props[_onClose](ev)
        }}
        {...other}>
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
            <IconButton filled code={0xE366} onClick={() => previous()}/>
            <IconButton filled code={0xE368} onClick={() => next()}/>
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
                onSelectedItemsChanged={(items) => setValue(v => (v[_setHours](numberParse(items[0][0] as string, true) + (isTimePMFormat()? 12 : 0)), v))}
                items={[
                    ['0', '00'],
                    ...new Array(isTime24HourFormat()? 23 : 11)[_fill](1)[_map]((_v, i) => [`${i+1}`, `${i+1}`[_padStart](2, '0')] as [value: string, text: string]),
                ]}
            />
            <Dropdown 
                labelText="Minute" 
                selectedValues={[`${value()[_getMinutes]()}`]} 
                onSelectedItemsChanged={(items) => setValue(v => (v[_setMinutes](numberParse(items[0][0] as string, true)), v))}
                items={new Array(60)[_fill](1)[_map]((_v, i) => [`${i}`, `${i}`[_padStart](2, '0')] as [value: string, text: string])}
            />
            <Dropdown 
                selectedValues={[_AM]} 
                onSelectedItemsChanged={(items) => {
                    const hour = value()[_getHours]()
                    // from AM to PM
                    if (isTimeAMFormat() && items[0][0] == _PM) {
                        setValue(v => (v[_setHours](hour + (hour > 0? 12 : 0)), v))
                    }

                    // from PM to AM
                    else if (!isTime24HourFormat() && isTimePMFormat() && items[0][0] == _AM) {
                        setValue(v => (v[_setHours](hour - (hour > 0? 12 : 0)), v))
                    }

                    // from 24hour to PM
                    else if (isTime24HourFormat() && hour < 12 && items[0][0] == _PM) {
                        setValue(v => (v[_setHours](hour + 12), v))
                    }

                    // from 24hour to AM
                    else if (isTime24HourFormat() && hour > 12 && items[0][0] == _AM) {
                        setValue(v => (v[_setHours](hour - 12), v))
                    }

                    setIsTime24HourFormat(items[0][0] == TimeFormat[_$24hour]) 
                    setIsTimePMFormat(items[0][0] == _PM)
                }}

                items={[[_AM, _AM], [_PM, _PM], [TimeFormat[_$24hour], '24 hour']]}
            />
        </div>
        {props[_children]}
        <div class="datetime-picker-actions">
            <Button variant={ButtonVariant[_tonal]} onClick={() => closeModal(dateTimePicker_ref)}>Cancel</Button>
            <Button 
                variant={ButtonVariant[_filled]} 
                onClick={() => {
                    if (props[_onSelectDateTime]) props[_onSelectDateTime](value())
                    closeModal(dateTimePicker_ref)
                }}>
                Select
            </Button>
        </div>
    </Modal>)
}

export {
    DateTimePicker, 
    focusModal as focusDateTimePicker,
    openModal as openDateTimePicker,
    closeModal as closeDateTimePicker,
    repositionModal as repositionDateTimePicker,
    DateTimePickerPosition
}
export type {
    DateTimePickerProps
}
export default DateTimePicker