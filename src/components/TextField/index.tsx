import { type JSX, type ParentComponent, createSignal, createUniqueId, mergeProps, onMount, splitProps, type VoidComponent, children, createEffect, Show, onCleanup, createMemo } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import { setAttrIfExist, joinClassList } from '@/utils/attributes'
import { eventCall } from '@/utils/event'
import { Math_clamp } from '@/utils/math'
import { isTargetValidElement } from '@/utils/element'
import { isNumberNotDefined, safeNumber } from '@/utils/number'
import { KEY_ARROW_DOWN, KEY_ARROW_UP, KEY_ENTER, KEY_SPACE } from '@/constants/key-code'
import { ICON_CHEVRON_DOWN, ICON_CHEVRON_UP, ICON_CHEVRON_UP_DOWN, ICON_DISMISS } from '@/constants/icons'

import Icon from '@/components/Icon'
import Button, { IconButton, type ButtonProps } from '@/components/Button'
import { closePopover, isPopoverOpen, openPopover, repositionPopover, PopoverPosition as SearchMenuPosition } from '@/components/Popover'
import { MenuItem, LinkMenuItem, MenuDivider, MenuHeader, MenuPosition, openMenu, PopoverMenu, type PopoverMenuProps } from '@/components/Menu'
import Modal, { type ModalProps } from '@/components/Modal'
import Tooltip from '@/components/Tooltip'
import './index.scss'

/**
 * To trigger 'input' event
 *
 * ```ts
 * // don't => (not trigger 'input' event)
 * textfieldRef.value = 'new value'
 *
 * // do => (trigger 'input' event)
 * updateTextFieldValue(textfieldRef, 'new value')
 * ```
 */
function updateTextFieldValue(el: HTMLInputElement, value: string): void {
	el.value = value
	el.dispatchEvent(new Event('input', { bubbles: false }))
}

/**
 * To trigger 'input' event
 *
 * ```ts
 * // don't => (not trigger 'input' event)
 * areatextfieldRef.value = 'new value'
 *
 * // do => (trigger 'input' event)
 * updateAreaTextFieldValue(areatextfieldRef, 'new value')
 * ```
 */
function updateAreaTextFieldValue(el: HTMLTextAreaElement, value: string): void {
	el.value = value
	el.dispatchEvent(new Event('input', { bubbles: false }))
}

type TextFieldButtonProps = ButtonProps
const TextFieldButton: ParentComponent<TextFieldButtonProps> = ($props) => {
	const [props, other] = splitProps($props, ['classList'])
	return (<Button
		classList={{
			'c-textfield-btn': true,
			...props.classList
		}}
		{...other}
	/>)
}

type AreaTextFieldProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'children' | 'rows' | 'columns'> & {
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:label'?: string
	'c:focused'?: boolean
	'c:minLine'?: number
	'c:maxLine'?: number
	'c:autoShowClearButton'?: boolean
	'c:autoHideLabel'?: boolean
	'c:tooltipClear'?: string
	'c:autoValidation'?: boolean
	'c:attrWrapper'?: JSX.HTMLAttributes<HTMLDivElement>
}
const AreaTextField: VoidComponent<AreaTextFieldProps> = ($props) => {
	const $$props = mergeProps({
		'c:autoValidation': true,
		'c:autoHideLabel': true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'c:leading', 'onInput', 'c:label', 'c:focused',
		'autocomplete', 'id', 'c:trailing', 'ref',
		'disabled', 'readOnly', 'c:autoValidation',
		'onFocus', 'onBlur', 'placeholder', 'c:autoHideLabel',
		'value', 'c:autoShowClearButton', 'c:tooltipClear',
		'c:minLine', 'c:maxLine', 'c:attrWrapper',
		'style'
	])
	const [wrapperProps, otherWrapperProps] = splitProps(props['c:attrWrapper']! ?? {}, [
		'class', 'onClick'
	])
	const [lineHeight, setLineHeight] = createSignal<number>(20)
	const [isFocus, setIsFocus] = createSignal<boolean>(false)
	const [isInvalid, setIsInvalid] = createSignal<boolean>(false)
	const [value, setValue] = createSignal<string>('')
	const [height, setHeight] = createSignal<number>(lineHeight())
	const isShowClearButton = createMemo(() => props['c:autoShowClearButton'] && value().length > 0)
	const trailing = children(() => props['c:trailing'])
	const leading = children(() => props['c:leading'])
	const buttonClearId = createUniqueId()
	let areaTextFieldRef: HTMLTextAreaElement

	onMount(() => {
		setLineHeight(safeNumber(Number.parseFloat(
			window
			.getComputedStyle(areaTextFieldRef)
			.getPropertyValue('line-height')
		), 20))
	})

	createEffect(() => {
		const value = `${props.value ?? ''}`

		const lines = (value ?? '').trim().split('\n').length
		setHeight(lines * lineHeight())
		setValue(value ?? '')
	})

	return (<div
		class={joinClassList('c-area-textfield', wrapperProps.class ?? '')}
		data-c-focused={setAttrIfExist(props['c:focused'] ?? isFocus())}
		data-c-invalid={setAttrIfExist(!props.disabled && props['c:autoValidation'] && isInvalid())}
		data-c-disabled={setAttrIfExist(props.disabled)}
		data-c-trailing={setAttrIfExist(trailing() || (props['c:autoShowClearButton'] && value().length > 0))}
		data-c-leading={setAttrIfExist(leading())}
		data-c-readonly={setAttrIfExist(props.readOnly)}
		onClick={ev => {
			eventCall(ev, wrapperProps.onClick)

			const button = document.activeElement!
			if (!isTargetValidElement(
				ev.currentTarget,
				button,
				el => el.tagName === 'BUTTON'
			)) return

			switch (button.id) {
			case buttonClearId:
				updateAreaTextFieldValue(areaTextFieldRef, '')
				break
			}
		}}
		{...otherWrapperProps}>
		<Show when={
			!props['c:autoHideLabel']
			|| value().length > 0
			|| props.placeholder
		}>
			<label for={props.id} class='c-area-textfield-label'>{props['c:label']}</label>
		</Show>
		{leading()}
		<textarea
			id={props.id}
			ref={mergeRefs(props.ref, r => areaTextFieldRef = r)}
			onInput={(ev) => {
				eventCall(ev, props.onInput)
				const self = ev.currentTarget
				setValue(self.value)
				setIsInvalid(!self.checkValidity())
				setHeight(lineHeight())
				setHeight(Math.max(self.scrollHeight, lineHeight()))
			}}
			onFocus={(ev) => {
				eventCall(ev, props.onFocus)
				const self = ev.currentTarget
				setValue(self.value)
				setIsInvalid(!self.checkValidity())
				setIsFocus(true)
			}}
			onBlur={(ev) => {
				eventCall(ev, props.onBlur)
				setValue(ev.currentTarget.value)
				setIsFocus(false)
			}}
			rows={props['c:minLine'] ?? 1}
			disabled={props.disabled}
			autocomplete={props.autocomplete ?? 'off'}
			readOnly={props.readOnly}
			value={props.value}
			style={typeof props.style === 'string'
				? props.style
				: {
					height: height() + 'px',
					"min-height": props['c:minLine']
						? ((lineHeight() * props['c:minLine']) + 'px')
						: undefined,
					"max-height": props['c:maxLine']
						&& props['c:maxLine'] >= (props['c:minLine'] ?? 1)
							? ((lineHeight() * props['c:maxLine']) + 'px')
							: undefined,
					...(props.style as JSX.CSSProperties)
				}}
			placeholder={props.placeholder ?? (props['c:autoHideLabel'] && props['c:label']? `${props['c:label']}` : undefined)}
			{...other}></textarea>
		<Show when={trailing() || isShowClearButton()}>
			{trailing()}
			<Show when={isShowClearButton()}>
				<TextFieldButton
					data-tooltip={props['c:tooltipClear'] ?? 'Clear'}
					type={'button'}
					id={buttonClearId}>
					<Icon c:code={ICON_DISMISS}/>
				</TextFieldButton>
			</Show>
		</Show>
	</div>)
}


type TextFieldProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:label'?: string
	'c:focused'?: boolean
	'c:autoShowClearButton'?: boolean
	'c:autoHideLabel'?: boolean
	'c:autoSelectAll'?: boolean
	'c:tooltipClear'?: string
	'c:autoValidation'?: boolean
	'c:attrWrapper'?: JSX.HTMLAttributes<HTMLDivElement>
}
const TextField: VoidComponent<TextFieldProps> = ($props) => {
	const $$props = mergeProps({
		'c:autoValidation': true,
		'c:autoHideLabel': true,
		type: 'text',
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'c:leading', 'onInput', 'c:label', 'c:focused',
		'autocomplete', 'id', 'c:trailing', 'ref',
		'type', 'c:attrWrapper', 'disabled', 'readOnly',
		'onFocus', 'onBlur', 'placeholder', 'c:autoHideLabel',
		'value', 'c:autoShowClearButton', 'c:tooltipClear',
		'c:autoSelectAll', 'c:autoValidation',
	])
	const [wrapperProps, otherWrapperProps] = splitProps(props['c:attrWrapper']! ?? {}, [
		'class', 'onClick'
	])
	const [isFocus, setIsFocus] = createSignal<boolean>(false)
	const [isInvalid, setIsInvalid] = createSignal<boolean>(false)
	const [value, setValue] = createSignal<string>('')
	const isShowClearButton = createMemo(() => props['c:autoShowClearButton'] && value().length > 0)
	const trailing = children(() => props['c:trailing'])
	const leading = children(() => props['c:leading'])
	const buttonClearId = createUniqueId()
	let textFieldRef: HTMLInputElement

	createEffect(() => {
		const value = props.value
		setValue(v => `${value ?? v}`)
	})

	return (<div
		class={joinClassList('c-textfield', wrapperProps.class ?? '')}
		data-c-focused={setAttrIfExist(props['c:focused'] ?? isFocus())}
		data-c-invalid={setAttrIfExist(!props.disabled && props['c:autoValidation'] && isInvalid())}
		data-c-disabled={setAttrIfExist(props.disabled)}
		data-c-trailing={setAttrIfExist(trailing() || (props['c:autoShowClearButton'] && value().length > 0))}
		data-c-leading={setAttrIfExist(leading())}
		data-c-readonly={setAttrIfExist(props.readOnly)}
		onClick={ev => {
			eventCall(ev, wrapperProps.onClick)

			const button = document.activeElement!
			if (!isTargetValidElement(
				ev.currentTarget,
				button,
				el => el.tagName === 'BUTTON'
			)) return

			switch (button.id) {
			case buttonClearId:
				updateTextFieldValue(textFieldRef, '')
			}
		}}
		{...otherWrapperProps}>
		<Show when={
			!props['c:autoHideLabel']
			|| value().length > 0
			|| props.placeholder
		}>
			<label class='c-textfield-label' for={props.id}>{props['c:label']}</label>
		</Show>
		{leading()}
		<input
			id={props.id}
			ref={mergeRefs(props.ref, r => textFieldRef = r)}
			onInput={(ev) => {
				eventCall(ev, props.onInput)
				const self = ev.currentTarget
				setValue(self.value)
				setIsInvalid(!self.checkValidity())
			}}
			onFocus={(ev) => {
				eventCall(ev, props.onFocus)
				const self = ev.currentTarget
				setValue(self.value)
				setIsInvalid(!self.checkValidity())
				setIsFocus(true)
				if (props['c:autoSelectAll']) self.select()
			}}
			onBlur={(ev) => {
				setValue(ev.currentTarget.value)
				setIsFocus(false)
				eventCall(ev, props.onBlur)
			}}
			type={props.type}
			disabled={props.disabled}
			autocomplete={props.autocomplete ?? 'off'}
			readOnly={props.readOnly}
			value={props.value}
			placeholder={props.placeholder ?? (props['c:autoHideLabel'] && props['c:label']? `${props['c:label']}` : undefined)}
			{...other}
		/>
		<Show when={trailing() || isShowClearButton()}>
			{trailing()}
			<Show when={isShowClearButton()}>
				<TextFieldButton
					data-tooltip={props['c:tooltipClear'] ?? 'Clear'}
					type={'button'}
					id={buttonClearId}>
					<Icon c:code={ICON_DISMISS}/>
				</TextFieldButton>
			</Show>
		</Show>
	</div>)
}

type NumberTextFieldProps = Omit<TextFieldProps, 'type'> & {
	'c:integerOnly'?: boolean
	'c:tooltipDecrease'?: string
	'c:tooltipIncrease'?: string
	'c:tooltipChangeValue'?: string
	'c:autoFixOnBlur'?: boolean
	'c:attrActions'?: ModalProps
	'c:onInputAsNumber'?(ev: InputEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}, value: number): unknown
}
const NumberTextField: VoidComponent<NumberTextFieldProps> = ($props) => {
	const $$props = mergeProps({
		'c:tooltipIncrease': 'Increase',
		'c:tooltipDecrease': 'Decrease',
		'c:tooltipChangeValue': 'Change value',
		'c:autoFixOnBlur': true
	}, $props)
	const [props, other] = splitProps($$props, [
		'max', 'min', 'c:trailing', 'c:autoShowClearButton', 'onBlur',
		'value', 'ref', 'c:focused', 'c:attrWrapper',
		'c:tooltipDecrease', 'c:tooltipIncrease', 'c:tooltipChangeValue',
		'c:tooltipClear', 'disabled', 'c:integerOnly', 'c:autoFixOnBlur',
		'c:attrActions', 'c:onInputAsNumber', 'onInput'
	])
	const [wrapperProps, otherWrapperProps] = splitProps(
		props['c:attrWrapper']! ?? {},
		['classList']
	)
	const [actionsProps, otherActionsProps] = splitProps(
		props['c:attrActions']! ?? {},
		['ref', 'classList', 'c:onToggleOpen', 'onKeyDown', 'onKeyUp']
	)

	const [isModalActionsOpen, setIsModalActionsOpen] = createSignal<boolean>(false)
	const [value, setValue] = createSignal<number>(0)
	let timeId: number | NodeJS.Timeout | null = null
	let timeIntervalId: number | NodeJS.Timeout | null = null
	let numberTextFieldRef: HTMLInputElement
	let modalActionsRef: HTMLDialogElement
	let iconButtonUpRef: HTMLButtonElement
	let iconButtonDownRef: HTMLButtonElement

	function getMax(defaultNumber?: number): number {
		const max = props.max
		let v: number = defaultNumber ?? value()

		if (typeof max === 'string') v = props['c:integerOnly']
			? Number.parseInt(max as string)
			: Number.parseFloat(max as string)
		else if (typeof max === 'number') v = max as number
		return props['c:integerOnly']? Math.round(v) : v
	}

	function getMin(defaultNumber?: number): number {
		const min = props.min
		let v: number = defaultNumber ?? value()

		if (typeof min === 'string') v = props['c:integerOnly']
			? Number.parseInt(min as string)
			: Number.parseFloat(min as string)
		else if (typeof min === 'number') v = min as number
		return props['c:integerOnly']? Math.round(v) : v
	}

	function updateValue(operator: '+' | '-'): void {
		const isReachLimit = (
			(
				operator == '+'
				&& props.max != null
				&& value() >= getMax()
			)
			|| (
				operator == '-'
				&& props.min != null
				&& value() <= getMin()
			)
		)
		if (isReachLimit) {
			if (timeIntervalId != null) clearInterval(timeIntervalId)
			if (timeId != null) clearTimeout(timeId)
			timeIntervalId = timeId = null
			return
		}

		if (operator == '+') numberTextFieldRef.stepUp()
		else numberTextFieldRef.stepDown()

		let n = numberTextFieldRef.valueAsNumber
		if (Number.isNaN(n)) n = value()

		n = Math_clamp(n, getMin(n), getMax(n))
		if (props['c:integerOnly']) n = Math.round(n)

		setValue(n)
		updateTextFieldValue(numberTextFieldRef, `${n}`)
	}

	function onPressStart(operator: '+' | '-'): void {
		if (timeId != null) clearTimeout(timeId)

		timeId = setTimeout(() => {
			if (timeIntervalId != null) clearInterval(timeIntervalId)
			timeIntervalId = setInterval(() => updateValue(operator), 30)
			timeId = null
		}, 200)
	}

	function onPressEnd(operator: '+' | '-'): void {
		if (timeIntervalId != null) clearInterval(timeIntervalId)
		if (timeId != null) clearTimeout(timeId)
		timeIntervalId = timeId = null
		updateValue(operator)
	}

	function fixInputNumber(): void {
		let n = safeNumber(
			props['c:integerOnly']
				? Number.parseInt(numberTextFieldRef.value)
				: Number.parseFloat(numberTextFieldRef.value),
			value()
		)

		n = Math_clamp(n, getMin(n), getMax(n))
		if (props['c:integerOnly']) n = Math.round(n)

		setValue(n)
		updateTextFieldValue(numberTextFieldRef, `${n}`.toUpperCase())
	}

	createEffect(() => {
		let v = Number.parseFloat(`${props.value}`)
		if (isNumberNotDefined(v)) return;

		const integerOnly = props['c:integerOnly']
		let max = props.max ?? v
		let min = props.min ?? v

		if (typeof max === 'string') max = integerOnly? Number.parseInt(max) : Number.parseFloat(max)
		if (typeof min === 'string') min = integerOnly? Number.parseInt(min) : Number.parseFloat(min)

		v = Math_clamp(v, min as number, max as number)
		if (integerOnly) v = Math.round(v)

		setValue(v)
	})

	return (<>
		<TextField
			c:focused={props['c:focused'] ?? (isModalActionsOpen()? true : undefined)}
			disabled={props.disabled}
			ref={mergeRefs(props.ref, r => numberTextFieldRef = r)}
			value={value()}
			c:attrWrapper={{
				classList: {
					'c-number-textfield': true,
					...wrapperProps.classList
				},
				...otherWrapperProps
			}}
			onBlur={ev => {
				eventCall(ev, props.onBlur)
				if (props['c:autoFixOnBlur']) fixInputNumber()
			}}
			onInput={ev => {
				eventCall(ev, props.onInput)
				if (props['c:onInputAsNumber']){
					let n = props['c:integerOnly']
						? Number.parseInt(numberTextFieldRef.value)
						: Number.parseFloat(numberTextFieldRef.value)
					n = safeNumber(n, value())
					n = Math_clamp(n, getMin(n), getMax(n))
					if (props['c:integerOnly']) n = Math.round(n)
					props['c:onInputAsNumber'](ev, n)
				}
			}}
			type='number'
			c:trailing={<>
				{ props['c:trailing'] }
				<Show when={!props.disabled}>
					<TextFieldButton
						data-tooltip={props['c:tooltipChangeValue']}
						onClick={(ev) => openMenu(
							modalActionsRef,
							{
								position: MenuPosition.centerCenterLeft,
								anchor: ev.currentTarget
							})
						}>
						<Icon c:code={ICON_CHEVRON_UP_DOWN}/>
					</TextFieldButton>
				</Show>
				<Show when={props['c:autoShowClearButton'] && value() != 0}>
					<TextFieldButton data-tooltip={props['c:tooltipClear'] ?? 'Clear'} onClick={(_ev) => {
						let v = Math_clamp(0, getMin(0), getMax())
						if (props['c:integerOnly']) v = Math.round(v)

						numberTextFieldRef.value = `${v}`
						setValue(v)
					}}><Icon c:code={ICON_DISMISS}/></TextFieldButton>
				</Show>
			</>}
			{...other}
		/>
		<Modal
			ref={mergeRefs(actionsProps.ref, r => modalActionsRef = r)}
			classList={{
				'c-number-textfield-actions': true,
				...actionsProps.classList
			}}
			c:onToggleOpen={(isOpen) => {
				actionsProps['c:onToggleOpen']?.(isOpen)
				setIsModalActionsOpen(isOpen)

				// I don't remember why I need this
				if (!isOpen) {
					numberTextFieldRef.focus()
					numberTextFieldRef.blur()
				}
			}}
			onKeyDown={(ev) => {
				eventCall(ev, actionsProps.onKeyDown)
				const code = ev.code
				const button = document.activeElement!
				if (!isTargetValidElement(
					ev.currentTarget,
					button,
					el => el.tagName == 'BUTTON'
				)) return

				const click_key = code == KEY_ENTER || code == KEY_SPACE
				const arrow_key = code == KEY_ARROW_UP || code == KEY_ARROW_DOWN
				if (!click_key && !arrow_key) return

				switch (button) {
				case iconButtonUpRef: {
					if (click_key) onPressStart('+')
					if (arrow_key && !iconButtonDownRef.disabled) iconButtonDownRef.focus()
						break
				}
				case iconButtonDownRef: {
					if (click_key) onPressStart('-')
					if (arrow_key && !iconButtonUpRef.disabled) iconButtonUpRef.focus()
					break
				}}
			}}
			onKeyUp={(ev) => {
				eventCall(ev, actionsProps.onKeyUp)
				const code = ev.code
				const button = document.activeElement!
				if (!isTargetValidElement(
					ev.currentTarget,
					button,
					el => el.tagName == 'BUTTON'
				) || (code != KEY_ENTER && code != KEY_SPACE)) return

				switch (button) {
				case iconButtonUpRef: onPressEnd('+'); break
				case iconButtonDownRef: onPressEnd('-'); break
				}
			}}
			{...otherActionsProps}>
			<Tooltip>
				<IconButton
					data-tooltip={props['c:tooltipIncrease']}
					ref={r => iconButtonUpRef = r}
					disabled={props.max != null && value() >= getMax()}
					onPointerUp={() => onPressEnd('+')}
					onPointerDown={() => onPressStart('+')}
					c:code={ICON_CHEVRON_UP}
				/>
				<IconButton
					data-tooltip={props['c:tooltipDecrease']}
					ref={r => iconButtonDownRef = r}
					disabled={props.min != null && value() <= getMin()}
					onPointerUp={() => onPressEnd('-')}
					onPointerDown={() => onPressStart('-')}
					c:code={ICON_CHEVRON_DOWN}
				/>
			</Tooltip>
		</Modal>
	</>)
}

type SearchTextFieldProps = TextFieldProps & {
	'c:result'?: JSX.Element
	'c:attrMenu'?: Omit<PopoverMenuProps, 'style'> & {
		style?: JSX.CSSProperties
	}
}
const SearchTextField: VoidComponent<SearchTextFieldProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c:result', 'c:attrWrapper', 'c:attrMenu', 'onFocus'
	])
	const [wrapperProps, otherWrapperProps] = splitProps(
		props['c:attrWrapper']! ?? {},
		['ref', 'classList']
	)
	const [menuProps, otherMenuProps] = splitProps(
		props['c:attrMenu']! ?? {},
		['c:usePortal', 'ref', 'classList', 'c:onToggleOpen']
	)
	const result = children(() => props['c:result'])
	let isPopoverOpen: boolean = false
	let isFocus = false
	let wrapperRef: HTMLDivElement
	let menuRef: HTMLDivElement

	function $openPopover(): void {
		if (isPopoverOpen) return;

		if (Array.isArray(result()) && (result() as unknown[]).length == 0) return;

		menuRef.style.removeProperty('width')
		const textFieldWidth = wrapperRef.getBoundingClientRect().width
		const menuWidth = menuRef.getBoundingClientRect().width
		if (textFieldWidth > menuWidth) menuRef.style.setProperty('width', `${textFieldWidth}px`)

		openPopover(menuRef, {
			allowHideAnchor: false,
			anchor: wrapperRef,
			contentAutoFocus: false,
			gap: 0,
			position: SearchMenuPosition.centerBottom,
			manualDismiss: true,
		})
	}

	function onClick(ev: MouseEvent): void {
		if (!isPopoverOpen) return;

		const target = ev.target as HTMLElement
		const isClickedInside = wrapperRef.contains(target) || menuRef.contains(target)

		if (isClickedInside) return;

		closePopover(menuRef)
	}

	function initEvents(): void {
		document.addEventListener('click', onClick)

		onCleanup(() => {
			document.removeEventListener('click', onClick)
		})
	}

	onMount(() => {
		initEvents()
	})

	createEffect(() => {
		const r = result()
		if (!isFocus) return;
		if (Array.isArray(r) && (r as unknown[]).length == 0) {
			return closePopover(menuRef)
		}
		$openPopover()
	})

	return (<>
		<TextField
			c:attrWrapper={{
				ref: mergeRefs(wrapperProps.ref, r => wrapperRef = r),
				classList: {
					'c-search-textfield': true,
					...wrapperProps.classList
				},
				...otherWrapperProps
			}}
			onFocus={ev => {
				eventCall(ev, props.onFocus)
				$openPopover()
				isFocus = isFocus
			}}
			{...other}
		/>
		<PopoverMenu
			c:usePortal={menuProps['c:usePortal'] ?? false} // for quick keyboard accessibilty
			c:onToggleOpen={isOpen => {
				isPopoverOpen = isOpen
				menuProps['c:onToggleOpen']?.(isOpen)
			}}
			ref={mergeRefs(menuProps.ref, r => menuRef = r)}
			classList={{
				'c-search-textfield-menu': true,
				...menuProps.classList
			}}
			{...otherMenuProps}>
			{result()}
		</PopoverMenu>
	</>)
}

export {
	updateTextFieldValue,
	updateAreaTextFieldValue,
	TextFieldButton,
	TextFieldButton as SearchTextFieldButton,
	TextFieldButton as NumberTextFieldButton,
	TextFieldButton as AreaTextFieldButton,
	AreaTextField,
	NumberTextField,
	TextField,
	SearchTextField,
	MenuItem as SearchMenuItem,
	LinkMenuItem as LinkSearchMenuItem,
	MenuDivider as SearchMenuDivider,
	MenuHeader as SearchMenuHeader,
	isPopoverOpen as isSearchTextFieldMenuOpen,
	closePopover as closeSearchTextFieldMenu,
	openPopover as openSearchTextFieldMenu,
	repositionPopover as repositionSearchTextFieldMenu,
	SearchMenuPosition
}
export type {
	TextFieldButtonProps,
	AreaTextFieldProps,
	NumberTextFieldProps,
	TextFieldProps,
	SearchTextFieldProps
}
export default TextField