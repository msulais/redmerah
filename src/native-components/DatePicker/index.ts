import { numberIsNotDefined } from "@/utils/number"
import { ButtonVariant, createButtonRef, createIconButtonRef, updateButtonRef, type ButtonProps, type IconButtonProps } from "../Button"
import { registerPopoverRef, repositionPopoverRef, updatePopoverRef, type PopoverProps, type PopoverUpdateOptions } from "../Popover"
import { createTooltipRef, registerTooltipRef, type TooltipProps } from "../Tooltip"
import { createDividerRef, type DividerProps } from "../Divider"
import { validEnumValue } from "@/utils/object"
import { isAnimationAllowed } from "@/utils/animation"
import { elementAnimateUpdateText } from "@/utils/element"
import { dateIsSameY, dateIsSameYM, dateIsSameYMD, dateOutRangeY, dateOutRangeYM, dateOutRangeYMD } from "@/utils/datetime"
import { AnimationEffectTiming } from "@/enums/animation"
import { IconCodes } from "@/enums/icons"

type DatePickerProps = PopoverProps & {
	DatePickerStartDate      ?: Date
	DatePickerEndDate        ?: Date
	DatePickerValue          ?: Date
	DatePickerHeaderAttr     ?: astroHTML.JSX.HTMLAttributes
	DatePickerTitleAttr      ?: ButtonProps
	DatePickerPreviousAttr   ?: Omit<IconButtonProps, 'IconButtonCode'> & { IconButtonCode?: number }
	DatePickerNextAttr       ?: Omit<IconButtonProps, 'IconButtonCode'> & { IconButtonCode?: number }
	DatePickerDaysAttr       ?: TooltipProps
	DatePickerDayAttr        ?: astroHTML.JSX.HTMLAttributes[]
	DatePickerDividerAttr    ?: DividerProps
	DatePickerYearAttr       ?: astroHTML.JSX.HTMLAttributes
	DatePickerYearButtonAttr ?: ButtonProps[]
	DatePickerMonthAttr      ?: astroHTML.JSX.HTMLAttributes
	DatePickerMonthButtonAttr?: ButtonProps[]
	DatePickerDateAttr       ?: astroHTML.JSX.HTMLAttributes
	DatePickerDateEmptyAttr  ?: astroHTML.JSX.HTMLAttributes[]
	DatePickerDateButtonAttr ?: ButtonProps[]
	DatePickerContentAttr    ?: astroHTML.JSX.HTMLAttributes
}

type DatePickerUpdateOptions = PopoverUpdateOptions & {
	DatePickerStartDate?: Date
	DatePickerEndDate  ?: Date
	DatePickerValue    ?: Date
	DatePickerChildren ?: (string | Node)[] | boolean
	DatePickerRefs     ?: {
		header     ?(ref : HTMLDivElement     ): unknown
		title      ?(ref : HTMLButtonElement  ): unknown
		previous   ?(ref : HTMLButtonElement  ): unknown
		next       ?(ref : HTMLButtonElement  ): unknown
		days       ?(ref : HTMLDivElement     ): unknown
		day        ?(refs: HTMLSpanElement[]  ): unknown
		divider    ?(ref : HTMLDivElement     ): unknown
		year       ?(ref : HTMLDivElement     ): unknown
		yearButton ?(refs: HTMLButtonElement[]): unknown
		month      ?(ref : HTMLDivElement     ): unknown
		monthButton?(refs: HTMLButtonElement[]): unknown
		date       ?(ref : HTMLDivElement     ): unknown
		dateButton ?(refs: HTMLButtonElement[]): unknown
		dateEmpty  ?(refs: HTMLDivElement[]   ): unknown
		content    ?(ref : HTMLDivElement     ): unknown
	}
}

enum DatePickerClasses {
	datepicker  = 'c-datepicker',
	header      = datepicker + '-header',
	title       = datepicker + '-title',
	previous    = datepicker + '-previous',
	next        = datepicker + '-next',
	days        = datepicker + '-days',
	day         = datepicker + '-day',
	divider     = datepicker + '-divider',
	year        = datepicker + '-year',
	month       = datepicker + '-month',
	date        = datepicker + '-date',
	content     = datepicker + '-content',
	yearButton  = year + '-button',
	monthButton = month + '-button',
	dateButton  = date + '-button',
	dateEmpty   = date + '-empty',
}

enum DatePickerViewType {
	day  = 'day',
	month = 'month',
	year  = 'year'
}

enum DatePickerAttributes {
	start     = 'data-c-datepicker-start',
	end       = 'data-c-datepicker-end',
	value     = 'data-c-datepicker-value',

	/** @param value `DatePickerViewType` */
	viewType  = 'data-c-datepicker-viewtype'
}

enum _DatePickerButtonAttributes {
	date = 'data-date'
}

enum DatePickerEvents {
	/** `!bubbles | !cancelable | !detail` */
	change = 'datepicker:change'
}

const REGISTERED_DATEPICKER: Set<HTMLDivElement> = new Set<HTMLDivElement>()

function _initDatePickerRef(datePickerRef: HTMLDivElement): void {
	const attributes = {
		get startDate(): Date | null {
			const startDate = datePickerRef.getAttribute(DatePickerAttributes.start)
			if (!startDate) return null

			const date = Date.parse(startDate)
			if (numberIsNotDefined(date)) return null

			return new Date(date)
		},
		get endDate(): Date | null {
			const endDate = datePickerRef.getAttribute(DatePickerAttributes.end)
			if (!endDate) return null

			const date = Date.parse(endDate)
			if (numberIsNotDefined(date)) return null

			return new Date(date)
		},
		get value(): Date | null {
			const valueDate = datePickerRef.getAttribute(DatePickerAttributes.value)
			if (!valueDate) return null

			const date = Date.parse(valueDate)
			if (numberIsNotDefined(date)) return null

			return new Date(date)
		},
		get viewtype(): DatePickerViewType {
			const type = datePickerRef.getAttribute(DatePickerAttributes.viewType)
			if (!type || !validEnumValue(type, DatePickerViewType)) return DatePickerViewType.day

			return type as DatePickerViewType
		}
	}
	let currentView = new Date()

	function next(): void {
		const newDate = new Date(currentView)
		switch (attributes.viewtype) {
		case DatePickerViewType.day: newDate.setMonth(newDate.getMonth() + 1); break
		case DatePickerViewType.month: newDate.setFullYear(newDate.getFullYear() + 1); break
		case DatePickerViewType.year: newDate.setFullYear(newDate.getFullYear() + 16); break
		}

		updateView(newDate)
		repositionPopoverRef(datePickerRef)
	}

	function previous(): void {
		const newDate = new Date(currentView)
		switch (attributes.viewtype) {
		case DatePickerViewType.day: newDate.setMonth(newDate.getMonth() - 1); break
		case DatePickerViewType.month: newDate.setFullYear(newDate.getFullYear() - 1); break
		case DatePickerViewType.year: newDate.setFullYear(newDate.getFullYear() - 16); break
		}

		updateView(newDate)
		repositionPopoverRef(datePickerRef)
	}

	function updateView(date: Date, animate = true): void {
		currentView = date

		let daysPerMonth = 31 // default
		let startDay = new Date(currentView.getFullYear(), currentView.getMonth(), 1).getDay()

		// february
		if (currentView.getMonth() === 1) {
			daysPerMonth = 28
			if (currentView.getFullYear() % 4 === 0) daysPerMonth = 29
		}

		// april, june, september, november
		else if ([3, 5, 8, 10].includes(currentView.getMonth())) daysPerMonth = 30

		const titleRef = datePickerRef.querySelector<HTMLDivElement>('.' + DatePickerClasses.title)!
		const value = attributes.value!
		const now = new Date()
		const startDate = attributes.startDate!
		const endDate = attributes.endDate!
		switch (attributes.viewtype) {
		case DatePickerViewType.day: {
			const titleText = currentView.toLocaleDateString('en', {month: 'long', year: 'numeric'})
			if (isAnimationAllowed() && animate) {
				elementAnimateUpdateText(titleRef, titleText)
			}
			else {
				titleRef.textContent = titleText
			}

			const emptyDate = datePickerRef.querySelectorAll<HTMLDivElement>('.' + DatePickerClasses.dateEmpty)
			const dates = datePickerRef.querySelectorAll<HTMLButtonElement>('.' + DatePickerClasses.dateButton)
			for (let i = 0; i < emptyDate.length; i++) {
				const item = emptyDate.item(i)
				if (i < startDay) {
					item.style.removeProperty('display')
				} else {
					item.style.setProperty('display', 'none')
				}
			}

			for (let i = 0; i < dates.length; i++) {
				const item = dates.item(i)
				if (i < daysPerMonth) {
					item.style.removeProperty('display')
				} else {
					item.style.setProperty('display', 'none')
				}
				const date = new Date(
					currentView.getFullYear(),
					currentView.getMonth(),
					i + 1
				)
				item.setAttribute(
					_DatePickerButtonAttributes.date,
					date.toISOString()
				)
				item.disabled = dateOutRangeYMD(date, startDate, endDate)

				if (dateIsSameYMD(date, value)) {
					updateButtonRef(item, {
						ButtonVariant: ButtonVariant.filled
					})
				}
				else if (dateIsSameYMD(date, now)) {
					updateButtonRef(item, {
						ButtonVariant: ButtonVariant.outlined
					})
				} else {
					updateButtonRef(item, {
						ButtonVariant: ButtonVariant.transparent
					})
				}
			}
			break
		}
		case DatePickerViewType.month: {
			const year = currentView.getFullYear()
			const titleText = currentView.toLocaleDateString('en', {year: 'numeric'})
			if (isAnimationAllowed() && animate) {
				elementAnimateUpdateText(titleRef, titleText)
			}
			else {
				titleRef.textContent = titleText
			}

			const monthButtonRefs = datePickerRef.querySelectorAll<HTMLButtonElement>('.' + DatePickerClasses.monthButton)
			for (let i = 0; i < monthButtonRefs.length; i++) {
				const buttonRef = monthButtonRefs.item(i)
				const date = new Date(year, i, 1)
				buttonRef.setAttribute(_DatePickerButtonAttributes.date, date.toISOString())
				buttonRef.disabled = dateOutRangeYM(date, startDate, endDate)
				if (dateIsSameYM(date, value)) {
					updateButtonRef(buttonRef, {
						ButtonVariant: ButtonVariant.filled
					})
				}
				else if (dateIsSameYM(date, now)) {
					updateButtonRef(buttonRef, {
						ButtonVariant: ButtonVariant.outlined
					})
				} else {
					updateButtonRef(buttonRef, {
						ButtonVariant: ButtonVariant.transparent
					})
				}
			}
			break
		}
		case DatePickerViewType.year: {
			const year = currentView.getFullYear()
			const titleText = year + '-' + (year + 15)
			const allowAnimation = isAnimationAllowed() && animate
			if (allowAnimation) {
				elementAnimateUpdateText(titleRef, titleText)
			}
			else {
				titleRef.textContent = titleText
			}

			const yearButtonRefs = datePickerRef.querySelectorAll<HTMLButtonElement>('.' + DatePickerClasses.yearButton)
			for (let i = 0; i < yearButtonRefs.length; i++) {
				const buttonRef = yearButtonRefs.item(i)
				const date = new Date(year + i, 0, 1)
				buttonRef.textContent = year + i + ''
				buttonRef.setAttribute(_DatePickerButtonAttributes.date, date.toISOString())
				buttonRef.disabled = dateOutRangeY(date, startDate, endDate)
				if (dateIsSameY(date, value)) {
					updateButtonRef(buttonRef, {
						ButtonVariant: ButtonVariant.filled
					})
				}
				else if (dateIsSameY(date, now)) {
					updateButtonRef(buttonRef, {
						ButtonVariant: ButtonVariant.outlined
					})
				} else {
					updateButtonRef(buttonRef, {
						ButtonVariant: ButtonVariant.transparent
					})
				}
			}
			break
		}}
	}

	function initDates(): void {
		datePickerRef.setAttribute(DatePickerAttributes.viewType, DatePickerViewType.day)
		if (attributes.startDate === null) datePickerRef.setAttribute(
			DatePickerAttributes.start,
			new Date(0).toISOString()
		)

		if (attributes.endDate === null) datePickerRef.setAttribute(
			DatePickerAttributes.end,
			new Date(new Date().getFullYear() + 200, 0, 1).toISOString()
		)

		if (attributes.value === null) datePickerRef.setAttribute(
			DatePickerAttributes.value,
			new Date().toISOString()
		)
	}

	function changeViewType(type: DatePickerViewType): void {
		switch (type) {
		case DatePickerViewType.day:
			datePickerRef.setAttribute(DatePickerAttributes.viewType, DatePickerViewType.day)
			if (isAnimationAllowed()) {
				const dateRef = datePickerRef.querySelector<HTMLDivElement>('.' + DatePickerClasses.date)
				dateRef?.animate({
					scale: [0.85, 1],
					opacity: [0, 1]
				}, {duration: 250, easing: AnimationEffectTiming.spring})
			}
			break
		case DatePickerViewType.month:
			datePickerRef.setAttribute(DatePickerAttributes.viewType, DatePickerViewType.month)
			if (isAnimationAllowed()) {
				const monthRef = datePickerRef.querySelector<HTMLDivElement>('.' + DatePickerClasses.month)
				monthRef?.animate({
					scale: [0.85, 1],
					opacity: [0, 1]
				}, {duration: 250, easing: AnimationEffectTiming.spring})
			}
			break
		case DatePickerViewType.year:
			datePickerRef.setAttribute(DatePickerAttributes.viewType, DatePickerViewType.year)
			if (isAnimationAllowed()) {
				const yearRef = datePickerRef.querySelector<HTMLDivElement>('.' + DatePickerClasses.year)
				yearRef?.animate({
					scale: [0.85, 1],
					opacity: [0, 1]
				}, {duration: 250, easing: AnimationEffectTiming.spring})
			}
			break
		}

		updateView(currentView)
		repositionPopoverRef(datePickerRef)
	}

	function selectDate(date: Date): void {
		updateView(date)
		switch (attributes.viewtype) {
		case DatePickerViewType.day: {
			datePickerRef.setAttribute(DatePickerAttributes.value, date.toISOString())
			datePickerRef.dispatchEvent(new CustomEvent(DatePickerEvents.change))
			datePickerRef.hidePopover()
			break
		}
		case DatePickerViewType.month: changeViewType(DatePickerViewType.day); break
		case DatePickerViewType.year: changeViewType(DatePickerViewType.month); break
		}
	}

	function datePickerRefOnClick(): void {
		const button = document.activeElement
		if (!button) return

		const classList = button.classList
		if (classList.contains(DatePickerClasses.next)) {
			next()
		}
		else if (classList.contains(DatePickerClasses.previous)) {
			previous()
		}
		else if (classList.contains(DatePickerClasses.title)) {
			const viewtype = attributes.viewtype
			changeViewType(viewtype === DatePickerViewType.month? DatePickerViewType.year : DatePickerViewType.month)
		}
		else if (button.hasAttribute(_DatePickerButtonAttributes.date)) {
			const parsed = Date.parse(button.getAttribute(_DatePickerButtonAttributes.date)!)
			if (numberIsNotDefined(parsed)) return

			const date = new Date(parsed)
			selectDate(date)
		}
	}

	function initEvents(): void {
		datePickerRef.addEventListener('beforetoggle', ev => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {
				initDates()
				updateView(attributes.value!, false)
			}
		})

		datePickerRef.addEventListener('toggle', ev => {
			const isOpen = (ev as ToggleEvent).newState === 'open'
			if (isOpen) {
				repositionPopoverRef(datePickerRef)
				datePickerRef.addEventListener('click', datePickerRefOnClick)
			}
			else {
				datePickerRef.removeEventListener('click', datePickerRefOnClick)
			}
		})
	}

	initDates()
	initEvents()
}

function registerDatePickerRef(...datePickerRefs: HTMLDivElement[]): void {
	if (datePickerRefs.length === 0) {
		datePickerRefs = [...document.querySelectorAll<HTMLDivElement>('.' + DatePickerClasses.datepicker)]
	}

	registerPopoverRef(...datePickerRefs)
	for (const popover of datePickerRefs){
		if (REGISTERED_DATEPICKER.has(popover)) {
			continue
		}

		REGISTERED_DATEPICKER.add(popover)
		_initDatePickerRef(popover)
	}
}

function unregisterDatePickerRef(...datePickerRefs: HTMLDivElement[]): void {
	for (const emojiPickerRef of datePickerRefs) {
		REGISTERED_DATEPICKER.delete(emojiPickerRef)
	}
}

function createDatePickerRef(options?: DatePickerUpdateOptions): HTMLDivElement {
	const datePickerRef = document.createElement('div')
	return updateDatePickerRef(datePickerRef, options)
}

function updateDatePickerRef(datePickerRef: HTMLDivElement, options?: DatePickerUpdateOptions): HTMLDivElement {
	updatePopoverRef(datePickerRef, options)
	datePickerRef.classList.add(DatePickerClasses.datepicker)
	datePickerRef.setAttribute(DatePickerAttributes.viewType, DatePickerViewType.day)

	if (!datePickerRef.hasAttribute(DatePickerAttributes.start)) {
		datePickerRef.setAttribute(DatePickerAttributes.start, new Date(0).toISOString())
	}

	if (!datePickerRef.hasAttribute(DatePickerAttributes.value)) {
		datePickerRef.setAttribute(DatePickerAttributes.value, new Date().toISOString())
	}

	if (!datePickerRef.hasAttribute(DatePickerAttributes.end)) {
		datePickerRef.setAttribute(DatePickerAttributes.end, new Date(new Date().getFullYear() + 200, 0, 1).toISOString())
	}

	const startDateOption = options?.DatePickerStartDate
	if (startDateOption) {
		datePickerRef.setAttribute(DatePickerAttributes.start, startDateOption.toISOString())
	}

	const endDateOption = options?.DatePickerEndDate
	if (endDateOption) {
		datePickerRef.setAttribute(DatePickerAttributes.end, endDateOption.toISOString())
	}

	const valueDateOption = options?.DatePickerValue
	if (valueDateOption) {
		datePickerRef.setAttribute(DatePickerAttributes.value, valueDateOption.toISOString())
	}

	// header
	let headerRef = datePickerRef.querySelector<HTMLDivElement>('.' + DatePickerClasses.header)
	if (!headerRef) {
		headerRef = document.createElement('div')
		headerRef.classList.add(DatePickerClasses.header)
	}

	// header -> title
	let titleRef = headerRef.querySelector<HTMLButtonElement>('.' + DatePickerClasses.title)
	if (!titleRef) {
		titleRef = createButtonRef({ButtonVariant: ButtonVariant.filled})
		titleRef.classList.add(DatePickerClasses.title)
	}

	// header -> previous
	let previousRef = headerRef.querySelector<HTMLButtonElement>('.' + DatePickerClasses.previous)
	if (!previousRef) {
		previousRef = createIconButtonRef({
			IconButtonIcon: { IconCode: IconCodes.chevronLeft },
			ButtonVariant: ButtonVariant.tonal
		})
		previousRef.classList.add(DatePickerClasses.previous)
	}

	// header -> next
	let nextRef = headerRef.querySelector<HTMLButtonElement>('.' + DatePickerClasses.next)
	if (!nextRef) {
		nextRef = createIconButtonRef({
			IconButtonIcon: { IconCode: IconCodes.chevronRight },
			ButtonVariant: ButtonVariant.tonal
		})
		nextRef.classList.add(DatePickerClasses.next)
	}

	// days
	let daysRef = datePickerRef.querySelector<HTMLDivElement>('.' + DatePickerClasses.days)
	if (!daysRef) {
		daysRef = createTooltipRef()
		daysRef.classList.add(DatePickerClasses.days)
		registerTooltipRef(daysRef)
	}

	// days -> day[]
	let dayRefs = [...daysRef.querySelectorAll<HTMLSpanElement>('.' + DatePickerClasses.day)]
	if (dayRefs.length < 7) {
		dayRefs.length = 0
		for (const day of ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']) {
			const span = document.createElement('span')
			span.textContent = day.substring(0, 3)
			span.setAttribute('data-tooltip', day)
			span.classList.add(DatePickerClasses.day)
			dayRefs.push(span)
		}
	}

	// divider
	let dividerRef = datePickerRef.querySelector<HTMLDivElement>('.' + DatePickerClasses.divider)
	if (!dividerRef) {
		dividerRef = createDividerRef()
		dividerRef.classList.add(DatePickerClasses.divider)
	}

	// year
	let yearRef = datePickerRef.querySelector<HTMLDivElement>('.' + DatePickerClasses.year)
	if (!yearRef) {
		yearRef = document.createElement('div')
		yearRef.classList.add(DatePickerClasses.year)
	}

	// year -> yearButton[]
	let yearButtonRefs = [...yearRef.querySelectorAll<HTMLButtonElement>('.' + DatePickerClasses.yearButton)]
	if (yearButtonRefs.length < 16) {
		yearButtonRefs.length = 0
		for (let i = 0; i < 16; i++) {
			const yearButtonRef = createButtonRef()
			yearButtonRef.classList.add(DatePickerClasses.yearButton)
			yearButtonRefs.push(yearButtonRef)
		}
	}

	// month
	let monthRef = datePickerRef.querySelector<HTMLDivElement>('.' + DatePickerClasses.month)
	if (!monthRef) {
		monthRef = document.createElement('div')
		monthRef.classList.add(DatePickerClasses.month)
	}

	// month -> monthButton[]
	let monthButtonRefs = [...monthRef.querySelectorAll<HTMLButtonElement>('.' + DatePickerClasses.monthButton)]
	if (monthButtonRefs.length < 12) {
		monthButtonRefs.length = 0
		for (const monthName of [
			'January', 'February', 'March', 'April',
			'May', 'June', 'July', 'August', 'September',
			'October', 'November', 'December'
		]) {
			const monthButtonRef = createButtonRef({
				ButtonChildren: [monthName]
			})
			monthButtonRef.classList.add(DatePickerClasses.monthButton)
			monthButtonRefs.push(monthButtonRef)
		}
	}

	// date
	let dateRef = datePickerRef.querySelector<HTMLDivElement>('.' + DatePickerClasses.date)
	if (!dateRef) {
		dateRef = document.createElement('div')
		dateRef.classList.add(DatePickerClasses.date)
	}

	// date -> dateEmpty[]
	let dateEmptyRefs = [...dateRef.querySelectorAll<HTMLDivElement>('.' + DatePickerClasses.dateEmpty)]
	if (dateEmptyRefs.length < 6) {
		dateEmptyRefs.length = 0
		for (let i = 0; i < 6; i++) {
			const dateEmptyRef = document.createElement('div')
			dateEmptyRef.classList.add(DatePickerClasses.dateEmpty)
			dateEmptyRefs.push(dateEmptyRef)
		}
	}

	// date -> dateButton[]
	let dateButtonRefs = [...dateRef.querySelectorAll<HTMLButtonElement>('.' + DatePickerClasses.dateButton)]
	if (dateButtonRefs.length < 31) {
		dateButtonRefs.length = 0
		for (let i = 0; i < 31; i++) {
			const btnRef = createButtonRef({
				ButtonChildren: [`${i + 1}`]
			})
			btnRef.classList.add(DatePickerClasses.dateButton)
			dateButtonRefs.push(btnRef)
		}
	}

	// content
	let contentRef = datePickerRef.querySelector<HTMLDivElement>('.' + DatePickerClasses.content)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(DatePickerClasses.content)
	}

	const childrenOption = options?.DatePickerChildren
	if (childrenOption === false) {
		contentRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		contentRef.replaceChildren(...childrenOption)
	}

	headerRef.replaceChildren(titleRef, previousRef, nextRef)
	daysRef.replaceChildren(...dayRefs)
	yearRef.replaceChildren(...yearButtonRefs)
	monthRef.replaceChildren(...monthButtonRefs)
	dateRef.replaceChildren(...dateEmptyRefs, ...dateButtonRefs)
	datePickerRef.replaceChildren(
		headerRef, dividerRef, daysRef,
		yearRef, monthRef, dateRef,
		contentRef
	)

	const refs = options?.DatePickerRefs
	refs?.content?.(contentRef)
	refs?.date?.(dateRef)
	refs?.dateButton?.(dateButtonRefs)
	refs?.dateEmpty?.(dateEmptyRefs)
	refs?.day?.(dayRefs)
	refs?.days?.(daysRef)
	refs?.divider?.(dividerRef)
	refs?.header?.(headerRef)
	refs?.month?.(monthRef)
	refs?.monthButton?.(monthButtonRefs)
	refs?.next?.(nextRef)
	refs?.previous?.(previousRef)
	refs?.title?.(titleRef)
	refs?.year?.(yearRef)
	refs?.yearButton?.(yearButtonRefs)
	return datePickerRef
}

export {
	type DatePickerProps,
	type DatePickerUpdateOptions,
	DatePickerEvents,
	DatePickerViewType,
	DatePickerClasses,
	DatePickerAttributes,
	registerDatePickerRef,
	unregisterDatePickerRef,
	createDatePickerRef,
	updateDatePickerRef
}