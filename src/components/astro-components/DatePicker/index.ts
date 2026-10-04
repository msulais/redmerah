import { isNumberDefined, isNumberNotDefined } from "@/utils/number"
import { isValidEnumValue } from "@/utils/object"
import { isAnimationAllowed } from "@/utils/animation"
import { isDateEqual_Y, isDateEqual_YM, isDateEqual_YMD, isDateOutRange_Y, isDateOutRange_YM, isDateOutRange_YMD } from "@/utils/datetime"
import { AnimationEasing } from "@/enums/animation"
import { IconCodes } from "@/enums/icons"
import { CPopover as GCPopover, type PopoverProps } from "../Popover"
import { CButton as GCButton, type ButtonProps, type IconButtonProps } from "../Button"
import { CDivider as GCDivider, type DividerProps } from "../Divider"
import { $add_event, $children, $classlist, $create, $get_attr, $has_attr, $is_array, $is_false, $parse_date, $query, $query_all, $rm_event, $rm_style, $set_attr, $set_style } from "../utils"
import { TooltipAttributes } from "@/layouts/Tooltip/_scripts/enums"

export namespace CDatePicker {
	export type CElement = GCPopover.CElement
	export type UpdateOptions = GCPopover.UpdateOptions & {
		DatePicker?: {
			startDate?: Date
			endDate  ?: Date
			value    ?: Date
			children ?: (string | Node)[] | boolean
			refs     ?: {
				header     ?(ref : HTMLDivElement         ): unknown
				title      ?(ref : GCButton.CElement      ): unknown
				previous   ?(ref : GCButton.CIcon.CElement): unknown
				next       ?(ref : GCButton.CIcon.CElement): unknown
				days       ?(ref : HTMLDivElement         ): unknown
				day        ?(refs: HTMLSpanElement[]      ): unknown
				divider    ?(ref : GCDivider.CElement     ): unknown
				year       ?(ref : HTMLDivElement         ): unknown
				yearButton ?(refs: GCButton.CElement[]    ): unknown
				month      ?(ref : HTMLDivElement         ): unknown
				monthButton?(refs: GCButton.CElement[]    ): unknown
				date       ?(ref : HTMLDivElement         ): unknown
				dateButton ?(refs: GCButton.CElement[]    ): unknown
				dateEmpty  ?(refs: HTMLDivElement[]       ): unknown
				content    ?(ref : HTMLDivElement         ): unknown
			}
		}
	}

	export enum Classes {
		Datepicker  = 'c-datepicker',
		Header      = Datepicker + '-header',
		Title       = Datepicker + '-title',
		Previous    = Datepicker + '-previous',
		Next        = Datepicker + '-next',
		Days        = Datepicker + '-days',
		Day         = Datepicker + '-day',
		Divider     = Datepicker + '-divider',
		Year        = Datepicker + '-year',
		Month       = Datepicker + '-month',
		Date        = Datepicker + '-date',
		Content     = Datepicker + '-content',
		YearButton  = Year + '-button',
		MonthButton = Month + '-button',
		DateButton  = Date + '-button',
		DateEmpty   = Date + '-empty',
	}

	export enum ViewType {
		Day  = 'day',
		Month = 'month',
		Year  = 'year'
	}

	export enum Attributes {
		Start     = 'data-c-datepicker-start',
		End       = 'data-c-datepicker-end',
		Value     = 'data-c-datepicker-value',

		/** @param value `ViewType` */
		viewType  = 'data-c-datepicker-viewtype'
	}

	enum ButtonAttributes {
		Date = 'data-date'
	}

	export enum Events {
		/** `!bubbles | !cancelable | !detail` */
		Change = 'datepicker:change'
	}

	const REGISTERED_DATEPICKER: Set<CElement> = new Set<CElement>()

	function initDatePicker(ref_datepicker: CElement): void {
		const attributes = {
			get startDate(): Date | null {
				const startDate = $get_attr(ref_datepicker, Attributes.Start)
				if (!startDate) return null

				const date = $parse_date(startDate)
				if (isNumberNotDefined(date)) return null

				return new Date(date)
			},
			get endDate(): Date | null {
				const endDate = $get_attr(ref_datepicker, Attributes.End)
				if (!endDate) return null

				const date = $parse_date(endDate)
				if (isNumberNotDefined(date)) return null

				return new Date(date)
			},
			get value(): Date | null {
				const valueDate = $get_attr(ref_datepicker, Attributes.Value)
				if (!valueDate) return null

				const date = $parse_date(valueDate)
				if (isNumberNotDefined(date)) return null

				return new Date(date)
			},
			get viewtype(): ViewType {
				const type = $get_attr(ref_datepicker, Attributes.viewType)
				if (!type || !isValidEnumValue(type, ViewType)) return ViewType.Day

				return type as ViewType
			}
		}
		let currentView = new Date()

		function next(): void {
			const newDate = new Date(currentView)
			switch (attributes.viewtype) {
			case ViewType.Day: newDate.setMonth(newDate.getMonth() + 1); break
			case ViewType.Month: newDate.setFullYear(newDate.getFullYear() + 1); break
			case ViewType.Year: newDate.setFullYear(newDate.getFullYear() + 16); break
			}

			updateView(newDate)
			GCPopover.reposition(ref_datepicker)
		}

		function previous(): void {
			const newDate = new Date(currentView)
			switch (attributes.viewtype) {
			case ViewType.Day: newDate.setMonth(newDate.getMonth() - 1); break
			case ViewType.Month: newDate.setFullYear(newDate.getFullYear() - 1); break
			case ViewType.Year: newDate.setFullYear(newDate.getFullYear() - 16); break
			}

			updateView(newDate)
			GCPopover.reposition(ref_datepicker)
		}

		function updateView(date: Date): void {
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

			const ref_title = $query<GCButton.CElement>('.' + Classes.Title, ref_datepicker)!
			const value = attributes.value!
			const now = new Date()
			const startDate = attributes.startDate!
			const endDate = attributes.endDate!
			const variant = GCButton.Variant
			switch (attributes.viewtype) {
			case ViewType.Day: {
				const titleText = currentView.toLocaleDateString('en', {month: 'long', year: 'numeric'})
				ref_title.textContent = titleText

				const refs_empty = $query_all<HTMLDivElement>('.' + Classes.DateEmpty, ref_datepicker)
				const refs_date = $query_all<GCButton.CElement>('.' + Classes.DateButton, ref_datepicker)
				for (let i = 0; i < refs_empty.length; i++) {
					const ref = refs_empty[i]
					if (i < startDay) {
						$rm_style(ref, 'display')
					} else {
						$set_style(ref, 'display', 'none')
					}
				}

				for (let i = 0; i < refs_date.length; i++) {
					const ref = refs_date[i]!
					if (i < daysPerMonth) {
						$rm_style(ref, 'display')
					} else {
						$set_style(ref, 'display', 'none')
					}
					const date = new Date(
						currentView.getFullYear(),
						currentView.getMonth(),
						i + 1
					)
					$set_attr(ref, ButtonAttributes.Date, date.toISOString())
					ref.disabled = isDateOutRange_YMD(date, startDate, endDate)

					GCButton.update(ref, {Button: {variant: isDateEqual_YMD(date, value)
						? variant.Filled
						: isDateEqual_YMD(date, now)
							? variant.Tonal
							: variant.Transparent
					}})
				}
				break
			}
			case ViewType.Month: {
				const year = currentView.getFullYear()
				const titleText = currentView.toLocaleDateString('en', {year: 'numeric'})
				ref_title.textContent = titleText

				const refs_month = $query_all<GCButton.CElement>('.' + Classes.MonthButton, ref_datepicker)
				for (let i = 0; i < refs_month.length; i++) {
					const ref = refs_month[i]!
					const date = new Date(year, i, 1)
					$set_attr(ref, ButtonAttributes.Date, date.toISOString())
					ref.disabled = isDateOutRange_YM(date, startDate, endDate)
					GCButton.update(ref, {Button: {variant: isDateEqual_YM(date, value)
						? variant.Filled
						: isDateEqual_YM(date, now)
							? variant.Tonal
							: variant.Transparent
					}})
				}
				break
			}
			case ViewType.Year: {
				const year = currentView.getFullYear()
				const titleText = year + '-' + (year + 15)
				ref_title.textContent = titleText

				const refs_year = $query_all<GCButton.CElement>('.' + Classes.YearButton, ref_datepicker)
				for (let i = 0; i < refs_year.length; i++) {
					const ref = refs_year[i]!
					const date = new Date(year + i, 0, 1)
					ref.textContent = year + i + ''
					ref.setAttribute(ButtonAttributes.Date, date.toISOString())
					ref.disabled = isDateOutRange_Y(date, startDate, endDate)
					GCButton.update(ref, {Button: {variant: isDateEqual_Y(date, value)
						? variant.Filled
						: isDateEqual_Y(date, now)
							? variant.Tonal
							: variant.Transparent
					}})
				}
				break
			}}
		}

		function initDates(): void {
			$set_attr(ref_datepicker, Attributes.viewType, ViewType.Day)
			if (attributes.startDate === null) {
				$set_attr(ref_datepicker, Attributes.Start, new Date(0).toISOString())
			}

			if (attributes.endDate === null) {
				$set_attr(
					ref_datepicker,
					Attributes.End,
					new Date(new Date().getFullYear() + 200, 0, 1).toISOString()
				)
			}

			if (attributes.value === null) {
				$set_attr(
					ref_datepicker,
					Attributes.Value,
					new Date().toISOString()
				)
			}
		}

		function changeViewType(type: ViewType): void {
			switch (type) {
			case ViewType.Day:
				$set_attr(ref_datepicker, Attributes.viewType, ViewType.Day)
				if (isAnimationAllowed()) {
					const ref_date = $query<HTMLDivElement>('.' + Classes.Date, ref_datepicker)
					ref_date?.animate({
						scale: [0.85, 1],
						opacity: [0, 1]
					}, {duration: 250, easing: AnimationEasing.Spring})
				}
				break
			case ViewType.Month:
				$set_attr(ref_datepicker, Attributes.viewType, ViewType.Month)
				if (isAnimationAllowed()) {
					const ref_month = $query<HTMLDivElement>('.' + Classes.Month, ref_datepicker)
					ref_month?.animate({
						scale: [0.85, 1],
						opacity: [0, 1]
					}, {duration: 250, easing: AnimationEasing.Spring})
				}
				break
			case ViewType.Year:
				$set_attr(ref_datepicker, Attributes.viewType, ViewType.Year)
				if (isAnimationAllowed()) {
					const ref_year = $query<HTMLDivElement>('.' + Classes.Year, ref_datepicker)
					ref_year?.animate({
						scale: [0.85, 1],
						opacity: [0, 1]
					}, {duration: 250, easing: AnimationEasing.Spring})
				}
				break
			}

			updateView(currentView)
			GCPopover.reposition(ref_datepicker)
		}

		function selectDate(date: Date): void {
			updateView(date)
			switch (attributes.viewtype) {
			case ViewType.Day: {
				$set_attr(ref_datepicker, Attributes.Value, date.toISOString())
				ref_datepicker.dispatchEvent(new CustomEvent(Events.Change))
				ref_datepicker.hidePopover()
				break
			}
			case ViewType.Month: changeViewType(ViewType.Day); break
			case ViewType.Year: changeViewType(ViewType.Month); break
			}
		}

		function ref_datepicker_onClick(): void {
			const ref = document.activeElement
			if (!ref) return

			const classList = ref.classList
			if (classList.contains(Classes.Next)) {
				next()
			}
			else if (classList.contains(Classes.Previous)) {
				previous()
			}
			else if (classList.contains(Classes.Title)) {
				const viewtype = attributes.viewtype
				changeViewType(viewtype === ViewType.Month? ViewType.Year : ViewType.Month)
			}
			else if (ref.hasAttribute(ButtonAttributes.Date)) {
				const parsed = Date.parse(ref.getAttribute(ButtonAttributes.Date)!)
				if (isNumberNotDefined(parsed)) return

				const date = new Date(parsed)
				selectDate(date)
			}
		}

		function initEvents(): void {
			$add_event<ToggleEvent>(ref_datepicker, 'beforetoggle', ev => {
				const isOpen = ev.newState === 'open'
				if (isOpen) {
					initDates()
					updateView(attributes.value!)
				}
			})

			$add_event<ToggleEvent>(ref_datepicker, 'toggle', ev => {
				const isOpen = ev.newState === 'open'
				if (isOpen) {
					GCPopover.reposition(ref_datepicker)
					$add_event(ref_datepicker, 'click', ref_datepicker_onClick)
				}
				else {
					$rm_event(ref_datepicker, 'click', ref_datepicker_onClick)
				}
			})
		}

		initDates()
		initEvents()
	}

	export function register(...refs_datepicker: CElement[]): void {
		if (refs_datepicker.length === 0) {
			refs_datepicker = [...$query_all<CElement>('.' + Classes.Datepicker)]
		}

		GCPopover.register(...refs_datepicker)
		for (const ref of refs_datepicker){
			if (REGISTERED_DATEPICKER.has(ref)) {
				continue
			}

			REGISTERED_DATEPICKER.add(ref)
			initDatePicker(ref)
		}
	}

	export function unregister(...refs_datepicker: CElement[]): void {
		for (const ref of refs_datepicker) {
			REGISTERED_DATEPICKER.delete(ref)
		}
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_datepicker = update($create('div'), options)
		register(ref_datepicker)
		return ref_datepicker
	}

	export function update(
		ref_datepicker: CElement,
		options?: UpdateOptions
	): CElement {
		const opt = options?.DatePicker
		GCPopover.update(ref_datepicker, options)
		$classlist(ref_datepicker, Classes.Datepicker)
		$set_attr(ref_datepicker, Attributes.viewType, ViewType.Day)

		if (!$has_attr(ref_datepicker, Attributes.Start)) {
			$set_attr(ref_datepicker, Attributes.Start, new Date(0).toISOString())
		}

		if (!$has_attr(ref_datepicker, Attributes.Value)) {
			$set_attr(ref_datepicker, Attributes.Value, new Date().toISOString())
		}

		if (!$has_attr(ref_datepicker, Attributes.End)) {
			$set_attr(ref_datepicker, Attributes.End, new Date(new Date().getFullYear() + 200, 0, 1).toISOString())
		}

		const opt_startDate = opt?.startDate
		if (opt_startDate) {
			$set_attr(ref_datepicker, Attributes.Start, opt_startDate.toISOString())
		}

		const opt_endDate = opt?.endDate
		if (opt_endDate) {
			$set_attr(ref_datepicker, Attributes.End, opt_endDate.toISOString())
		}

		const opt_value = opt?.value
		if (opt_value) {
			$set_attr(ref_datepicker, Attributes.Value, opt_value.toISOString())
		}

		// header
		let ref_header = $query<HTMLDivElement>('.' + Classes.Header, ref_datepicker)
		if (!ref_header) {
			ref_header = $create('div')
			$classlist(ref_header, Classes.Header)
		}

		// header -> title
		let ref_title = $query<GCButton.CElement>('.' + Classes.Title, ref_header)
		if (!ref_title) {
			ref_title = GCButton.create({Button: {variant: GCButton.Variant.Filled}})
			$classlist(ref_title, Classes.Title)
		}

		// header -> previous
		let ref_previous = $query<GCButton.CIcon.CElement>('.' + Classes.Previous, ref_header)
		if (!ref_previous) {
			ref_previous = GCButton.CIcon.create({
				IconButton: {Icon: {code: IconCodes.ChevronLeft}},
				Button: {variant: GCButton.Variant.Tonal}
			})
			$classlist(ref_previous, Classes.Previous)
		}

		// header -> next
		let ref_next = $query<GCButton.CIcon.CElement>('.' + Classes.Next, ref_header)
		if (!ref_next) {
			ref_next = GCButton.CIcon.create({
				IconButton: {Icon: {code: IconCodes.ChevronRight}},
				Button: {variant: GCButton.Variant.Tonal}
			})
			$classlist(ref_next, Classes.Next)
		}

		// days
		let ref_days = $query<HTMLDivElement>('.' + Classes.Days, ref_datepicker)
		if (!ref_days) {
			ref_days = $create('div')
			$classlist(ref_days, Classes.Days)
		}

		// days -> day[]
		let refs_day = [...$query_all<HTMLSpanElement>('.' + Classes.Day, ref_days)]
		if (refs_day.length < 7) {
			refs_day.length = 0
			for (const day of ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']) {
				const ref_span = $create('span')
				ref_span.textContent = day.substring(0, 3)
				$set_attr(ref_span, TooltipAttributes.Tooltip, day)
				$classlist(ref_span, Classes.Day)
				refs_day.push(ref_span)
			}
		}

		// divider
		let ref_divider = $query<GCDivider.CElement>('.' + Classes.Divider, ref_datepicker)
		if (!ref_divider) {
			ref_divider = GCDivider.create()
			$classlist(ref_divider, Classes.Divider)
		}

		// year
		let ref_year = $query<HTMLDivElement>('.' + Classes.Year, ref_datepicker)
		if (!ref_year) {
			ref_year = $create('div')
			$classlist(ref_year, Classes.Year)
		}

		// year -> yearButton[]
		let refs_year = [...$query_all<GCButton.CElement>('.' + Classes.YearButton, ref_year)]
		if (refs_year.length < 16) {
			refs_year.length = 0
			for (let i = 0; i < 16; i++) {
				const ref = GCButton.create()
				$classlist(ref, Classes.YearButton)
				refs_year.push(ref)
			}
		}

		// month
		let ref_month = $query<HTMLDivElement>('.' + Classes.Month, ref_datepicker)
		if (!ref_month) {
			ref_month = $create('div')
			$classlist(ref_month, Classes.Month)
		}

		// month -> monthButton[]
		let refs_month = [...$query_all<GCButton.CElement>('.' + Classes.MonthButton, ref_month)]
		if (refs_month.length < 12) {
			refs_month.length = 0
			for (const name of [
				'January', 'February', 'March', 'April',
				'May', 'June', 'July', 'August', 'September',
				'October', 'November', 'December'
			]) {
				const ref = GCButton.create({Button: {children: [name]}})
				$classlist(ref, Classes.MonthButton)
				refs_month.push(ref)
			}
		}

		// date
		let ref_date = $query<HTMLDivElement>('.' + Classes.Date, ref_datepicker)
		if (!ref_date) {
			ref_date = $create('div')
			$classlist(ref_date, Classes.Date)
		}

		// date -> dateEmpty[]
		let refs_empty = [...$query_all<HTMLDivElement>('.' + Classes.DateEmpty, ref_date)]
		if (refs_empty.length < 6) {
			refs_empty.length = 0
			for (let i = 0; i < 6; i++) {
				const ref = $create('div')
				$classlist(ref, Classes.DateEmpty)
				refs_empty.push(ref)
			}
		}

		// date -> dateButton[]
		let refs_date = [...$query_all<GCButton.CElement>('.' + Classes.DateButton, ref_date)]
		if (refs_date.length < 31) {
			refs_date.length = 0
			for (let i = 0; i < 31; i++) {
				const ref = GCButton.create({
					Button: {children: [`${i + 1}`]}
				})
				$classlist(ref, Classes.DateButton)
				refs_date.push(ref)
			}
		}

		// content
		let ref_content = $query<HTMLDivElement>('.' + Classes.Content, ref_datepicker)
		if (!ref_content) {
			ref_content = $create('div')
			$classlist(ref_content, Classes.Content)
		}

		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			$children(ref_content)
		}
		else if ($is_array(opt_children)) {
			$children(ref_content, ...opt_children)
		}

		$children(ref_header, ref_title, ref_previous, ref_next)
		$children(ref_days, ...refs_day)
		$children(ref_year, ...refs_year)
		$children(ref_month, ...refs_month)
		$children(ref_date, ...refs_empty, ...refs_date)
		$children(ref_datepicker,
			ref_header, ref_divider, ref_days,
			ref_year, ref_month, ref_date,
			ref_content
		)

		const refs = opt?.refs
		refs?.content?.(ref_content)
		refs?.date?.(ref_date)
		refs?.dateButton?.(refs_date)
		refs?.dateEmpty?.(refs_empty)
		refs?.day?.(refs_day)
		refs?.days?.(ref_days)
		refs?.divider?.(ref_divider)
		refs?.header?.(ref_header)
		refs?.month?.(ref_month)
		refs?.monthButton?.(refs_month)
		refs?.next?.(ref_next)
		refs?.previous?.(ref_previous)
		refs?.title?.(ref_title)
		refs?.year?.(ref_year)
		refs?.yearButton?.(refs_year)
		return ref_datepicker
	}

	export function getValue(ref_datepicker: CElement): Date | null {
		const value = $get_attr(ref_datepicker, Attributes.Value)
		if (value) {
			const date = new Date(value)
			if (isNumberDefined(date.valueOf())) {
				return date
			}
		}

		return null
	}
}

export type DatePickerProps = PopoverProps & {
	DatePickerStartDate      ?: Date
	DatePickerEndDate        ?: Date
	DatePickerValue          ?: Date
	DatePickerHeaderAttr     ?: astroHTML.JSX.HTMLAttributes
	DatePickerTitleAttr      ?: ButtonProps
	DatePickerPreviousAttr   ?: Omit<IconButtonProps, 'IconButtonCode'> & { IconButtonCode?: number }
	DatePickerNextAttr       ?: Omit<IconButtonProps, 'IconButtonCode'> & { IconButtonCode?: number }
	DatePickerDaysAttr       ?: astroHTML.JSX.HTMLAttributes
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