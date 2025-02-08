import { type JSX, type ParentComponent, createSignal, createUniqueId, mergeProps, onMount, splitProps, type VoidComponent, children, createEffect, Show, onCleanup, createMemo } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import { attrSetIfExist, attrClassList } from '@/utils/attributes'
import { timeTimerClear, timeIntervalClear, timeTimerSet, timeIntervalSet } from '@/utils/time'
import { eventCall, eventCurrentTarget, eventPreventDefault, eventTarget } from '@/utils/event'
import { mathClamp, mathMax, mathRound } from '@/utils/math'
import { elementBlur, elementContains, elementDispatchEvent, elementFocus, elementId, elementRect, elementStyleRemove, elementScrollHeight, elementStyleSet, elementTagName, elementValidTarget } from '@/utils/element'
import { eventListenerAdd, eventListenerRemove } from '@/utils/event'
import { typeIsArray, typeIsNumber, typeIsString } from '@/utils/typecheck'
import { stringLength, stringSplit, stringToUpperCase, stringTrim } from '@/utils/string'
import { arrayLength } from '@/utils/array'
import { numberIsNaN, numberIsNotDefined, numberParse, numberSafe } from '@/utils/number'
import { rectWidth } from '@/utils/rect'
import { documentActive } from '@/utils/document'
import { KEY_ARROW_DOWN, KEY_ARROW_UP, KEY_ENTER, KEY_SPACE } from '@/constants/key_code'
import { ICON_CHEVRON_DOWN, ICON_CHEVRON_UP, ICON_CHEVRON_UP_DOWN, ICON_DISMISS } from '@/constants/icons'

import Icon from '@/components/Icon'
import Button, { IconButton, type ButtonProps } from '@/components/Button'
import { closePopover, isPopoverOpen, openPopover, repositionPopover, PopoverPosition as SearchMenuPosition } from '@/components/Popover'
import { MenuItem, LinkMenuItem, MenuDivider, MenuHeader, MenuPosition, openMenu, PopoverMenu, type PopoverMenuProps } from '@/components/Menu'
import Modal, { type ModalProps } from '@/components/Modal'
import FocusableGroup from '@/components/FocusableGroup'
import Tooltip from '@/components/Tooltip'
import './index.scss'

const HEIGHT_TEXT_INPUT_PER_LINE = 20

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
	elementDispatchEvent(el, new Event('input', { bubbles: false }))
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
	elementDispatchEvent(el, new Event('input', { bubbles: false }))
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
	'c:trailingAutoTabIndex'?: boolean
	'c:label'?: string
	'c:message'?: string
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
		'c:trailingAutoTabIndex': true,
		'c:autoHideLabel': true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'c:leading', 'onInput', 'c:label', 'c:focused',
		'autocomplete', 'id', 'c:message', 'c:trailing',
		'disabled', 'readOnly', 'c:autoValidation',
		'onFocus', 'onBlur', 'placeholder', 'c:autoHideLabel',
		'value', 'ref', 'c:autoShowClearButton', 'c:tooltipClear',
		'c:minLine', 'c:maxLine', 'c:attrWrapper',
		'c:trailingAutoTabIndex'
	])
	const [wrapperProps, otherWrapperProps] = splitProps(props['c:attrWrapper']! ?? {}, ['class'])
	const [isFocus, setIsFocus] = createSignal<boolean>(false)
	const [isInvalid, setIsInvalid] = createSignal<boolean>(false)
	const [value, setValue] = createSignal<string>('')
	const [height, setHeight] = createSignal<number>(HEIGHT_TEXT_INPUT_PER_LINE)
	const isShowClearButton = createMemo(() => props['c:autoShowClearButton'] && stringLength(value()) > 0)
	const trailing = children(() => props['c:trailing'])
	const leading = children(() => props['c:leading'])
	const message = children(() => props['c:message'])
	const button_clear_id = createUniqueId()
	let areaTextFieldRef!: HTMLTextAreaElement
	let stopFocus: boolean = false

	createEffect(() => {
		const value = `${props.value ?? ''}`

		const lines = arrayLength(stringSplit(stringTrim(value ?? ''), '\n'))
		setHeight(lines * HEIGHT_TEXT_INPUT_PER_LINE)
		setValue(value ?? '')
	})

	const TrailingContent: VoidComponent = () => {
		return (<>
			{trailing()}
			<Show when={isShowClearButton()}>
				<TextFieldButton
					data-tooltip={props['c:tooltipClear'] ?? 'Clear'}
					type={'button'}
					id={button_clear_id}>
					<Icon c:code={ICON_DISMISS}/>
				</TextFieldButton>
			</Show>
		</>)
	}

	return (<div
		class={attrClassList('c-area-textfield', wrapperProps.class ?? '')}
		{...otherWrapperProps}>
		<div
			data-c-focused={attrSetIfExist(props['c:focused'] ?? isFocus())}
			data-c-invalid={attrSetIfExist(!props.disabled && props['c:autoValidation'] && isInvalid())}
			data-c-disabled={attrSetIfExist(props.disabled)}
			data-c-trailing={attrSetIfExist(trailing() || (props['c:autoShowClearButton'] && stringLength(value()) > 0))}
			data-c-readonly={attrSetIfExist(props.readOnly)}
			onClick={() => {
				if (stopFocus) return stopFocus = false

				elementFocus(areaTextFieldRef)
			}}>
			<Show when={!(props['c:autoHideLabel'] && stringLength(value()) == 0 && !props.placeholder)}>
				<label for={props.id} class='c-area-textfield-label'>{props['c:label']}</label>
			</Show>
			<Show when={leading()}>
				<div
					class='c-area-textfield-leading'
					onClick={() => stopFocus = true}>
					{leading()}
				</div>
			</Show>
			<textarea
				id={props.id}
				ref={mergeRefs(props.ref, r => areaTextFieldRef = r)}
				onInput={(ev) => {
					eventCall(ev, props.onInput)
					const self = eventCurrentTarget(ev)
					setValue(self.value)
					setIsInvalid(!self.checkValidity())
					setHeight(HEIGHT_TEXT_INPUT_PER_LINE) // set to one line: to calculate the scroll height
					setHeight(mathMax(elementScrollHeight(self), HEIGHT_TEXT_INPUT_PER_LINE))
				}}
				onFocus={(ev) => {
					eventCall(ev, props.onFocus)
					const self = eventCurrentTarget(ev)
					setValue(self.value)
					setIsInvalid(!self.checkValidity())
					setIsFocus(true)
				}}
				onBlur={(ev) => {
					eventCall(ev, props.onBlur)
					setValue(eventCurrentTarget(ev).value)
					setIsFocus(false)
				}}
				rows={props['c:minLine'] ?? 1}
				disabled={props.disabled}
				autocomplete={props.autocomplete ?? 'off'}
				readOnly={props.readOnly}
				value={props.value}
				style={{
					height: height() + 'px',
					"min-height": props['c:minLine']? ((HEIGHT_TEXT_INPUT_PER_LINE * props['c:minLine']) + 'px') : undefined,
					"max-height": props['c:maxLine'] && props['c:maxLine'] >= (props['c:minLine'] ?? 1)? ((HEIGHT_TEXT_INPUT_PER_LINE * props['c:maxLine']) + 'px') : undefined
				}}
				placeholder={props.placeholder ?? (props['c:autoHideLabel'] && props['c:label']? `${props['c:label']}` : undefined)}
				{...other}></textarea>
			<Show when={trailing() || isShowClearButton()}>
				<div
					class='c-area-textfield-trailing'
					onClick={ev => {
						stopFocus = true
						if (elementId(documentActive()!) == button_clear_id) {
							updateAreaTextFieldValue(areaTextFieldRef, '')
							eventPreventDefault(ev)
							elementFocus(areaTextFieldRef)
						}
					}}>
					<Show
						when={props['c:trailingAutoTabIndex']}
						fallback={<TrailingContent />}>
						<FocusableGroup c:arrowOptions={{left: 'prev', right: 'next'}}>
							<TrailingContent />
						</FocusableGroup>
					</Show>
				</div>
			</Show>
		</div>
		<Show when={message()}>
			<div class='c-area-textfield-message'>{message()}</div>
		</Show>
	</div>)
}


type TextFieldProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:trailingAutoTabIndex'?: boolean
	'c:label'?: string
	'c:message'?: string
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
		'c:trailingAutoTabIndex': true,
		'c:autoHideLabel': true,
		type: 'text',
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'c:leading', 'onInput', 'c:label', 'c:focused',
		'autocomplete', 'id', 'c:message', 'c:trailing',
		'type', 'c:attrWrapper', 'disabled', 'readOnly',
		'onFocus', 'onBlur', 'placeholder', 'c:autoHideLabel',
		'value', 'ref', 'c:autoShowClearButton', 'c:tooltipClear',
		'c:autoSelectAll', 'onKeyUp', 'c:autoValidation',
		'c:trailingAutoTabIndex'
	])
	const [wrapperProps, otherWrapperProps] = splitProps(props['c:attrWrapper']! ?? {}, ['class'])
	const [isFocus, setIsFocus] = createSignal<boolean>(false)
	const [isInvalid, setIsInvalid] = createSignal<boolean>(false)
	const [value, setValue] = createSignal<string>('')
	const isShowClearButton = createMemo(() => props['c:autoShowClearButton'] && stringLength(value()) > 0)
	const trailing = children(() => props['c:trailing'])
	const leading = children(() => props['c:leading'])
	const message = children(() => props['c:message'])
	const buttonClearId = createUniqueId()
	let textFieldRef: HTMLInputElement
	let stopFocus: boolean = false

	createEffect(() => {
		const value = props.value
		setValue(v => `${value ?? v}`)
	})

	const TrailingContent: VoidComponent = () => {
		return (<>
			{trailing()}
			<Show when={isShowClearButton()}>
				<TextFieldButton
					data-tooltip={props['c:tooltipClear'] ?? 'Clear'}
					type={'button'}
					id={buttonClearId}>
					<Icon c:code={ICON_DISMISS}/>
				</TextFieldButton>
			</Show>
		</>)
	}

	return (<div
		class={attrClassList('c-textfield', wrapperProps.class ?? '')}
		{...otherWrapperProps}>
		<div
			data-c-focused={attrSetIfExist(props['c:focused'] ?? isFocus())}
			data-c-invalid={attrSetIfExist(!props.disabled && props['c:autoValidation'] && isInvalid())}
			data-c-disabled={attrSetIfExist(props.disabled)}
			data-c-trailing={attrSetIfExist(trailing() || (props['c:autoShowClearButton'] && stringLength(value()) > 0))}
			data-c-readonly={attrSetIfExist(props.readOnly)}
			onClick={() => {
				if (stopFocus) return stopFocus = false

				elementFocus(textFieldRef)
			}}>
			<Show when={!(props['c:autoHideLabel'] && stringLength(value()) == 0 && !props.placeholder)}>
				<label class='c-textfield-label' for={props.id}>{props['c:label']}</label>
			</Show>
			<Show when={leading()}>
				<div
					class='c-textfield-leading'
					onClick={() => stopFocus = true}>
					{leading()}
				</div>
			</Show>
			<input
				id={props.id}
				ref={mergeRefs(props.ref, r => textFieldRef = r)}
				onInput={(ev) => {
					eventCall(ev, props.onInput)
					const self = eventCurrentTarget(ev)
					setValue(self.value)
					setIsInvalid(!self.checkValidity())
				}}
				onFocus={(ev) => {
					eventCall(ev, props.onFocus)
					const self = eventCurrentTarget(ev)
					setValue(self.value)
					setIsInvalid(!self.checkValidity())
					setIsFocus(true)
					if (props['c:autoSelectAll']) self.setSelectionRange(0, stringLength(self.value))
				}}
				onKeyUp={ev => {
					eventCall(ev, props.onKeyUp)
					if (ev.key == 'Enter') elementBlur(eventCurrentTarget(ev))
				}}
				onBlur={(ev) => {
					setValue(eventCurrentTarget(ev).value)
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
				<div
					class='c-textfield-trailing'
					onClick={ev => {
						stopFocus = true
						if (elementId(documentActive()!) == buttonClearId) {
							updateTextFieldValue(textFieldRef, '')
							eventPreventDefault(ev)
							elementFocus(textFieldRef)
						}
					}}>
					<Show
						when={props['c:trailingAutoTabIndex']}
						fallback={<TrailingContent />}>
						<FocusableGroup c:arrowOptions={{left: 'prev', right: 'next'}}>
							<TrailingContent />
						</FocusableGroup>
					</Show>
				</div>
			</Show>
		</div>
		<Show when={message()}>
			<div class='c-textfield-message'>{message()}</div>
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
	let timeId: number | null = null
	let timeIntervalId: number | null = null
	let numberTextFieldRef: HTMLInputElement
	let modalActionsRef: HTMLDialogElement
	let iconButtonUpRef: HTMLButtonElement
	let iconButtonDownRef: HTMLButtonElement

	function getMax(defaultNumber?: number): number {
		const max = props.max
		let v: number = defaultNumber ?? value()

		if (typeIsString(max)) v = numberParse(max as string, props['c:integerOnly'])
		else if (typeIsNumber(max)) v = max as number
		return props['c:integerOnly']? mathRound(v) : v
	}

	function getMin(defaultNumber?: number): number {
		const min = props.min
		let v: number = defaultNumber ?? value()

		if (typeIsString(min)) v = numberParse(min as string, props['c:integerOnly'])
		else if (typeIsNumber(min)) v = min as number
		return props['c:integerOnly']? mathRound(v) : v
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
			if (timeIntervalId != null) timeIntervalClear(timeIntervalId)
			if (timeId != null) timeTimerClear(timeId)
			timeIntervalId = timeId = null
			return
		}

		if (operator == '+') numberTextFieldRef.stepUp()
		else numberTextFieldRef.stepDown()

		let n = numberTextFieldRef.valueAsNumber
		if (numberIsNaN(n)) n = value()

		n = mathClamp(n, getMin(n), getMax(n))
		if (props['c:integerOnly']) n = mathRound(n)

		setValue(n)
		updateTextFieldValue(numberTextFieldRef, `${n}`)
	}

	function onPressStart(operator: '+' | '-'): void {
		if (timeId != null) timeTimerClear(timeId)

		timeId = timeTimerSet(() => {
			if (timeIntervalId != null) timeIntervalClear(timeIntervalId)
			timeIntervalId = timeIntervalSet(() => updateValue(operator), 30)
			timeId = null
		}, 200)
	}

	function onPressEnd(operator: '+' | '-'): void {
		if (timeIntervalId != null) timeIntervalClear(timeIntervalId)
		if (timeId != null) timeTimerClear(timeId)
		timeIntervalId = timeId = null
		updateValue(operator)
	}

	function fixInputNumber(): void {
		let n = numberSafe(
			numberParse(numberTextFieldRef.value, props['c:integerOnly']),
			value()
		)

		n = mathClamp(n, getMin(n), getMax(n))
		if (props['c:integerOnly']) n = mathRound(n)

		setValue(n)
		updateTextFieldValue(numberTextFieldRef, stringToUpperCase(`${n}`))
	}

	createEffect(() => {
		let v = numberParse(`${props.value}`)
		if (numberIsNotDefined(v)) return;

		const integer_only = props['c:integerOnly']
		let max = props.max ?? v
		let min = props.min ?? v

		if (typeIsString(max)) max = numberParse(max as string, integer_only)
		if (typeIsString(min)) min = numberParse(min as string, integer_only)

		v = mathClamp(v, min as number, max as number)
		if (integer_only) v = mathRound(v)

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
					let n = numberParse(numberTextFieldRef.value, props['c:integerOnly'])
					n = numberSafe(n, value())
					n = mathClamp(n, getMin(n), getMax(n))
					if (props['c:integerOnly']) n = mathRound(n)
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
								anchor: eventCurrentTarget(ev)
							})
						}>
						<Icon c:code={ICON_CHEVRON_UP_DOWN}/>
					</TextFieldButton>
				</Show>
				<Show when={props['c:autoShowClearButton'] && value() != 0}>
					<TextFieldButton data-tooltip={props['c:tooltipClear'] ?? 'Clear'} onClick={(_ev) => {
						let v = mathClamp(0, getMin(0), getMax())
						if (props['c:integerOnly']) v = mathRound(v)

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
			c:onToggleOpen={(is_open) => {
				actionsProps['c:onToggleOpen']?.(is_open)
				setIsModalActionsOpen(is_open)

				// I don't remember why I need this
				if (!is_open) {
					elementFocus(numberTextFieldRef)
					elementBlur(numberTextFieldRef)
				}
			}}
			onKeyDown={(ev) => {
				eventCall(ev, actionsProps.onKeyDown)
				const code = ev.code
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				const click_key = code == KEY_ENTER || code == KEY_SPACE
				const arrow_key = code == KEY_ARROW_UP || code == KEY_ARROW_DOWN
				if (!click_key && !arrow_key) return

				switch (button) {
				case iconButtonUpRef: {
					if (click_key) onPressStart('+')
					if (arrow_key && !iconButtonDownRef.disabled) elementFocus(iconButtonDownRef)
						break
				}
				case iconButtonDownRef: {
					if (click_key) onPressStart('-')
					if (arrow_key && !iconButtonUpRef.disabled) elementFocus(iconButtonUpRef)
					break
				}}
			}}
			onKeyUp={(ev) => {
				eventCall(ev, actionsProps.onKeyUp)
				const code = ev.code
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
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

		if (typeIsArray(result()) && arrayLength(result() as unknown[]) == 0) return;

		elementStyleRemove(menuRef, 'width')
		const textFieldWidth = rectWidth(elementRect(wrapperRef))
		const menuWidth = rectWidth(elementRect(menuRef))
		if (textFieldWidth > menuWidth) elementStyleSet(
			menuRef,
			'width',
			`${textFieldWidth}px`
		)
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

		const target = eventTarget(ev) as HTMLElement
		const isClickedInside = elementContains(wrapperRef, target) || elementContains(menuRef, target)

		if (isClickedInside) return;

		closePopover(menuRef)
	}

	function initEvents(): void {
		eventListenerAdd<MouseEvent>(document, 'click', onClick)

		onCleanup(() => {
			eventListenerRemove<MouseEvent>(document, 'click', onClick)
		})
	}

	onMount(() => {
		initEvents()
	})

	createEffect(() => {
		const r = result()
		if (!isFocus) return;
		if (typeIsArray(r) && arrayLength(r as unknown[]) == 0) {
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