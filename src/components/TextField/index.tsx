import { type JSX, type ParentComponent, createSignal, createUniqueId, mergeProps, onMount, splitProps, type VoidComponent, children, createEffect, Show, onCleanup } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import { toggleAttribute } from '@/utils/attributes'
import { clearTimeDelayed, clearTimeInterval, setTimeDelayed, setTimeInterval } from '@/utils/timeout'
import { callEventHandler, preventDefault, stopPropagation } from '@/utils/event'
import { _value, _input, _dispatchEvent, _classList, _compact, _leading, _onInput, _labelText, _focused, _autocomplete, _id, _messageText, _trailing, _labelAttr, _disabled, _readOnly, _onFocus, _onBlur, _placeholder, _autoHideLabel, _ref, _autoShowClearBtn, _clearTooltip, _minLine, _maxLine, _wrapperAttr, _class, _trim, _split, _length, _focus, _currentTarget, _checkValidity, _scrollHeight, _off, _px, _button, _text, _type, _autoSelectAll, _onKeyUp, _setSelectionRange, _code, _Enter, _blur, _max, _min, _decreaseTooltip, _increaseTooltip, _changeValueTooltip, _integerOnly, _stepUp, _stepDown, _valueAsNumber, _isNaN, _toUpperCase, _centerCenterLeft, _result, _menuAttr, _usePortal, _style, _onToggleOpen, _isArray, _width, _centerBottom, _observe, _disconnect, _target, _contains, _click, _autoFixOnBlur, _actionsAttr, _autoValidation, _Space, _ArrowDown, _ArrowUp, _onInputAsNumber } from '@/constants/string'
import { mathClamp, mathMax, mathRound, numberIsNaN, numberParse, safeNumber } from '@/utils/math'
import { getBoundingClientRect } from '@/utils/element'
import { getDocument } from '@/constants/window'
import { addEventListener, removeEventListener } from '@/utils/event'
import { isNumber, isString } from '@/utils/typecheck'

import Icon from '@/components/Icon'
import { TextTooltip } from '@/components/Tooltip'
import Button, { IconButton, type ButtonProps } from '@/components/Button'
import Popover, { closePopover, openPopover, PopoverPosition as SearchMenuPosition, repositionPopover, type PopoverProps } from '../Popover'
import { MenuItem, LinkMenuItem, MenuDivider, MenuHeader, openMenu, MenuPosition } from '@/components/Menu'
import Modal, { type ModalProps } from '@/components/Modal'
import './index.scss'

const HEIGHT_TEXT_INPUT_PER_LINE = 20

/**
 * To trigger 'input' event
 *
 * ```ts
 * // don't => (not trigger 'input' event)
 * textfield_ref.value = 'new value'
 *
 * // do => (trigger 'input' event)
 * changeTextFieldValue(textfield_ref, 'new value')
 * ```
 */
function changeTextFieldValue(el: HTMLInputElement, value: string): void {
	el[_value] = value
	el[_dispatchEvent](new Event(_input, { bubbles: true }))
}

/**
 * To trigger 'input' event
 *
 * ```ts
 * // don't => (not trigger 'input' event)
 * area-textfield_ref.value = 'new value'
 *
 * // do => (trigger 'input' event)
 * changeAreaTextFieldValue(area-textfield_ref, 'new value')
 * ```
 */
function changeAreaTextFieldValue(el: HTMLTextAreaElement, value: string): void {
	el[_value] = value
	el[_dispatchEvent](new Event(_input, { bubbles: true }))
}

type TextFieldButtonProps = ButtonProps
const TextFieldButton: ParentComponent<TextFieldButtonProps> = ($props) => {
	const $$props = mergeProps({compact: true}, $props)
	const [props, other] = splitProps($$props, [_classList, _compact])
	return (<Button
		compact={props[_compact]}
		classList={{
			'c-textfield-btn': true,
			...props[_classList]
		}}
		{...other}
	/>)
}

type AreaTextFieldProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'children' | 'rows' | 'columns'> & {
	leading?: JSX.Element
	trailing?: JSX.Element
	labelText?: JSX.Element
	messageText?: JSX.Element
	focused?: boolean
	minLine?: number
	maxLine?: number
	compact?: boolean
	autoShowClearBtn?: boolean
	autoHideLabel?: boolean
	clearTooltip?: string
	autoValidation?: boolean
	wrapperAttr?: JSX.HTMLAttributes<HTMLDivElement>
	labelAttr?: JSX.LabelHTMLAttributes<HTMLLabelElement>
}
const AreaTextField: VoidComponent<AreaTextFieldProps> = ($props) => {
	const $$props = mergeProps({
		autoValidation: true,
		autoHideLabel: true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		_leading, _onInput, _labelText, _focused,
		_autocomplete, _id, _messageText, _trailing,
		_labelAttr, _disabled, _readOnly, _autoValidation,
		_onFocus, _onBlur, _placeholder, _autoHideLabel,
		_value, _ref, _autoShowClearBtn, _clearTooltip,
		_minLine, _maxLine, _compact, _wrapperAttr
	])
	const [wrapperProps, wrapperPropsOther] = splitProps(props[_wrapperAttr]! ?? {}, [_class])
	const [isFocus, setIsFocus] = createSignal<boolean>(false)
	const [isInvalid, setIsInvalid] = createSignal<boolean>(false)
	const [value, setValue] = createSignal<string>('')
	const [height, setHeight] = createSignal<number>(HEIGHT_TEXT_INPUT_PER_LINE)
	const trailingComponents = children(() => props[_trailing])
	let areaTextField_ref!: HTMLTextAreaElement

	createEffect(() => {
		const value = `${props[_value] ?? ''}`

		const lines = (value ?? '')[_trim]()[_split]('\n')[_length]
		setHeight(lines * HEIGHT_TEXT_INPUT_PER_LINE)
		setValue(value ?? '')
	})

	return (<div
		class={`c-area-textfield${wrapperProps[_class]? ` ${wrapperProps[_class]}` : ''}`}
		{...wrapperPropsOther}>
		<div
			data-c-focused={toggleAttribute(props[_focused] ?? isFocus())}
			data-c-invalid={toggleAttribute(!props[_disabled] && props[_autoValidation] && isInvalid())}
			data-c-disabled={toggleAttribute(props[_disabled])}
			data-c-trailing={toggleAttribute(trailingComponents() || (props[_autoShowClearBtn] && value()[_length] > 0))}
			data-c-compact={toggleAttribute(props[_compact])}
			data-c-readonly={toggleAttribute(props[_readOnly])}
			onClick={() => areaTextField_ref[_focus]()}>
			<div class='c-area-textfield-label-text'>{props[_autoHideLabel] && value()[_length] == 0 && !props[_placeholder]? '' : props[_labelText]}</div>
			<div class='c-area-textfield-leading' onClick={ev => stopPropagation(ev)}>{props[_leading]}</div>
			<textarea
				id={props[_id]}
				ref={mergeRefs(props[_ref], r => areaTextField_ref = r)}
				onInput={(ev) => {
					const self = ev[_currentTarget]
					setValue(ev[_currentTarget][_value])
					setIsInvalid(!ev[_currentTarget][_checkValidity]())
					callEventHandler(ev, props[_onInput])
					setHeight(HEIGHT_TEXT_INPUT_PER_LINE) // set to one line: to calculate the scroll height
					setHeight(mathMax(self[_scrollHeight], HEIGHT_TEXT_INPUT_PER_LINE))
				}}
				onFocus={(ev) => {
					setValue(ev[_currentTarget][_value])
					setIsInvalid(!ev[_currentTarget][_checkValidity]())
					setIsFocus(true)
					callEventHandler(ev, props[_onFocus])
				}}
				onBlur={(ev) => {
					setValue(ev[_currentTarget][_value])
					setIsFocus(false)
					callEventHandler(ev, props[_onBlur])
				}}
				rows={props[_minLine] ?? 1}
				disabled={props[_disabled]}
				autocomplete={props[_autocomplete] ?? _off}
				readOnly={props[_readOnly]}
				value={props[_value]}
				style={{
					height: height() + _px,
					"min-height": props[_minLine]? ((HEIGHT_TEXT_INPUT_PER_LINE * props[_minLine]) + _px) : undefined,
					"max-height": props[_maxLine] && props[_maxLine] >= (props[_minLine] ?? 1)? ((HEIGHT_TEXT_INPUT_PER_LINE * props[_maxLine]) + _px) : undefined
				}}
				placeholder={props[_placeholder] ?? (props[_autoHideLabel] && props[_labelText]? `${props[_labelText]}` : undefined)}
				{...other}></textarea>
			<div class='c-area-textfield-trailing' onClick={ev => stopPropagation(ev)}>
				{trailingComponents()}
				<Show when={props[_autoShowClearBtn] && value()[_length] > 0}>
					<TextTooltip text={props[_clearTooltip] ?? 'Clear'}>
						<TextFieldButton type={_button} onClick={(ev) => {
							areaTextField_ref[_value] = ''
							setValue('')
							preventDefault(ev)
						}}><Icon code={0xE5E9}/></TextFieldButton>
					</TextTooltip>
				</Show>
			</div>
		</div>
		<div class='c-area-textfield-message-text'>{props[_messageText]}</div>
	</div>)
}


type TextFieldProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
	leading?: JSX.Element
	trailing?: JSX.Element
	labelText?: JSX.Element
	messageText?: JSX.Element
	focused?: boolean
	compact?: boolean
	autoShowClearBtn?: boolean
	autoHideLabel?: boolean
	autoSelectAll?: boolean
	clearTooltip?: string
	autoValidation?: boolean
	wrapperAttr?: JSX.HTMLAttributes<HTMLDivElement>
}
const TextField: VoidComponent<TextFieldProps> = ($props) => {
	const $$props = mergeProps({
		autoValidation: true,
		type: _text,
		autoHideLabel: true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		_leading, _onInput, _labelText, _focused,
		_autocomplete, _id, _messageText, _trailing,
		_type, _wrapperAttr, _disabled, _readOnly,
		_onFocus, _onBlur, _placeholder, _autoHideLabel,
		_value, _ref, _autoShowClearBtn, _clearTooltip,
		_compact, _autoSelectAll, _onKeyUp, _autoValidation
	])
	const [wrapperProps, wrapperPropsOther] = splitProps(props[_wrapperAttr]! ?? {}, [_class])
	const [isFocus, setIsFocus] = createSignal<boolean>(false)
	const [isInvalid, setIsInvalid] = createSignal<boolean>(false)
	const [value, setValue] = createSignal<string>('')
	const trailingComponents = children(() => props[_trailing])
	let textfield_ref: HTMLInputElement

	createEffect(() => {
		const value = props[_value]
		setValue(v => `${value ?? v}`)
	})

	return (<div
		class={`c-textfield${wrapperProps[_class] != null ? ` ${wrapperProps[_class]}` : ''}`}
		{...wrapperPropsOther}>
		<div
			data-c-focused={toggleAttribute(props[_focused] ?? isFocus())}
			data-c-invalid={toggleAttribute(!props[_disabled] && props[_autoValidation] && isInvalid())}
			data-c-compact={toggleAttribute(props[_compact])}
			data-c-disabled={toggleAttribute(props[_disabled])}
			data-c-trailing={toggleAttribute(trailingComponents() || (props[_autoShowClearBtn] && value()[_length] > 0))}
			data-c-readonly={toggleAttribute(props[_readOnly])}
			onClick={() => textfield_ref[_focus]()}>
			<div class='c-textfield-label-text'>
				{ props[_autoHideLabel] && value()[_length] == 0 && !props[_placeholder]
					? ''
					: props[_labelText]
				}
			</div>
			<div class='c-textfield-leading' onClick={ev => stopPropagation(ev)}>{props[_leading]}</div>
			<input
				id={props[_id]}
				ref={mergeRefs(props[_ref], r => textfield_ref = r)}
				onInput={(ev) => {
					setValue(ev[_currentTarget][_value])
					setIsInvalid(!ev[_currentTarget][_checkValidity]())
					callEventHandler(ev, props[_onInput])
				}}
				onFocus={(ev) => {
					setValue(ev[_currentTarget][_value])
					setIsInvalid(!ev[_currentTarget][_checkValidity]())
					setIsFocus(true)
					callEventHandler(ev, props[_onFocus])
					if (props[_autoSelectAll]) ev[_currentTarget][_setSelectionRange](0, ev[_currentTarget][_value][_length])
				}}
				onKeyUp={ev => {
					if (ev[_code] == _Enter) ev[_currentTarget][_blur]()
					callEventHandler(ev, props[_onKeyUp])
				}}
				onBlur={(ev) => {
					setValue(ev[_currentTarget][_value])
					setIsFocus(false)
					callEventHandler(ev, props[_onBlur])
				}}
				type={props[_type]}
				disabled={props[_disabled]}
				autocomplete={props[_autocomplete] ?? _off}
				readOnly={props[_readOnly]}
				value={props[_value]}
				placeholder={props[_placeholder] ?? (props[_autoHideLabel] && props[_labelText]? `${props[_labelText]}` : undefined)}
				{...other}
			/>
			<div class='c-textfield-trailing' onClick={ev => stopPropagation(ev)}>
				{trailingComponents()}
				<Show when={props[_autoShowClearBtn] && value()[_length] > 0}>
					<TextTooltip text={props[_clearTooltip] ?? 'Clear'}>
						<TextFieldButton type={_button} onClick={(ev) => {
							changeTextFieldValue(textfield_ref, '')
							preventDefault(ev)
						}}><Icon code={0xE5E9}/></TextFieldButton>
					</TextTooltip>
				</Show>
			</div>
		</div>
		<div class='c-textfield-message-text'>{props[_messageText]}</div>
	</div>)
}

type NumberTextFieldProps = Omit<TextFieldProps, 'type'> & {
	integerOnly?: boolean
	decreaseTooltip?: string
	increaseTooltip?: string
	changeValueTooltip?: string
	autoFixOnBlur?: boolean
	actionsAttr?: ModalProps
	onInputAsNumber?(ev: InputEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}, value: number): unknown
}
const NumberTextField: VoidComponent<NumberTextFieldProps> = ($props) => {
	const $$props = mergeProps({
		increaseTooltip: 'Increase',
		decreaseTooltip: 'Decrease',
		changeValueTooltip: 'Change value',
		autoFixOnBlur: true
	}, $props)
	const [props, other] = splitProps($$props, [
		_max, _min, _trailing, _autoShowClearBtn, _onBlur,
		_onBlur, _value, _ref, _focused, _wrapperAttr,
		_decreaseTooltip, _increaseTooltip, _changeValueTooltip,
		_clearTooltip, _disabled, _integerOnly, _autoFixOnBlur,
		_actionsAttr, _onInputAsNumber, _onInput
	])
	const [wrapperProps, wrapperPropsOther] = splitProps(
		props[_wrapperAttr]! ?? {},
		[_classList]
	)
	const [actionsProps, actionsPropsOther] = splitProps(
		props[_actionsAttr]! ?? {},
		[_ref, _classList, _onToggleOpen]
	)

	const [is_modal_actions_open, setIs_modal_actions_open] = createSignal<boolean>(false)
	const [value, setValue] = createSignal<number>(0)
	let timeoutId: number | null = null
	let intervalId: number | null = null
	let numberTextField_ref: HTMLInputElement
	let modal_actions_ref: HTMLDialogElement
	let iconButton_up_ref: HTMLButtonElement
	let iconButton_down_ref: HTMLButtonElement

	function getMax(defaultNumber?: number): number {
		const max = props[_max]
		let v: number = defaultNumber ?? value()

		if (isString(max)) v = numberParse(max as string, props[_integerOnly])
		else if (isNumber(max)) v = max as number
		return props[_integerOnly]? mathRound(v) : v
	}

	function getMin(defaultNumber?: number): number {
		const min = props[_min]
		let v: number = defaultNumber ?? value()

		if (isString(min)) v = numberParse(min as string, props[_integerOnly])
		else if (isNumber(min)) v = min as number
		return props[_integerOnly]? mathRound(v) : v
	}

	function changeValue(operator: '+' | '-'): void {
		const reachLimit = (
			(
				operator == '+'
				&& props[_max] != null
				&& value() >= getMax()
			)
			|| (
				operator == '-'
				&& props[_min] != null
				&& value() <= getMin()
			)
		)
		if (reachLimit) {
			if (intervalId != null) clearTimeInterval(intervalId)
			if (timeoutId != null) clearTimeDelayed(timeoutId)
			intervalId = timeoutId = null
			return
		}

		if (operator == '+') numberTextField_ref[_stepUp]()
		else numberTextField_ref[_stepDown]()

		let n = numberTextField_ref[_valueAsNumber]
		if (numberIsNaN(n)) n = value()

		n = mathClamp(n, getMin(n), getMax(n))
		if (props[_integerOnly]) n = mathRound(n)

		setValue(n)
		changeTextFieldValue(numberTextField_ref, `${n}`)
	}

	function onPressStart(operator: '+' | '-'): void {
		if (timeoutId != null) clearTimeDelayed(timeoutId)

		timeoutId = setTimeDelayed(() => {
			if (intervalId != null) clearTimeInterval(intervalId)
			intervalId = setTimeInterval(() => changeValue(operator), 30)
			timeoutId = null
		}, 300)
	}

	function onPressEnd(operator: '+' | '-'): void {
		if (intervalId != null) clearTimeInterval(intervalId)
		if (timeoutId != null) clearTimeDelayed(timeoutId)
		intervalId = timeoutId = null
		changeValue(operator)
	}

	function fixNumberInput(): void {
		let n = numberParse(numberTextField_ref[_value], props[_integerOnly])
		if (numberIsNaN(n)) n = value()

		n = mathClamp(n, getMin(n), getMax(n))
		if (props[_integerOnly]) n = mathRound(n)

		setValue(n)
		changeTextFieldValue(numberTextField_ref, `${n}`[_toUpperCase]())
	}

	createEffect(() => {
		let v = numberParse(`${props[_value]}`)
		if (Number[_isNaN](v)) v = value()

		v = mathClamp(v, getMin(v), getMax(v))
		if (props[_integerOnly]) v = mathRound(v)

		setValue(v)
	})

	return (<>
		<TextField
			focused={props[_focused] ?? (is_modal_actions_open()? true : undefined)}
			disabled={props[_disabled]}
			ref={mergeRefs(props[_ref], r => numberTextField_ref = r)}
			value={value()}
			wrapperAttr={{
				classList: {
					'c-number-textfield': true,
					...wrapperProps[_classList]
				},
				...wrapperPropsOther
			}}
			onBlur={ev => {
				if (props[_autoFixOnBlur]) fixNumberInput()
				callEventHandler(ev, props[_onBlur])
			}}
			onInput={ev => {
				if (props[_onInputAsNumber]){
					let n = numberParse(numberTextField_ref[_value], props[_integerOnly])
					n = safeNumber(n, value())
					n = mathClamp(n, getMin(n), getMax(n))
					if (props[_integerOnly]) n = mathRound(n)
					props[_onInputAsNumber](ev, n)
				}
				callEventHandler(ev, props[_onInput])
			}}
			type='number'
			trailing={<>
				{ props[_trailing] }
				<Show when={!props[_disabled]}>
					<TextTooltip text={props[_changeValueTooltip]}>
						<TextFieldButton
							onClick={(ev) => openMenu(
								ev,
								modal_actions_ref,
								{
									position: MenuPosition[_centerCenterLeft],
									anchor: ev[_currentTarget]
								})
							}>
							<Icon code={0xE406}/>
						</TextFieldButton>
					</TextTooltip>
				</Show>
				<Show when={props[_autoShowClearBtn] && value() != 0}>
					<TextTooltip text={props[_clearTooltip] ?? 'Clear'}>
						<TextFieldButton onClick={(_ev) => {
							let v = mathClamp(0, getMin(), getMax())
							if (props[_integerOnly]) v = mathRound(v)

							changeTextFieldValue(numberTextField_ref, `${v}`)
							setValue(v)
						}}><Icon code={0xE5E9}/></TextFieldButton>
					</TextTooltip>
				</Show>
			</>}
			{...other}
		/>
		<Modal
			ref={mergeRefs(actionsProps[_ref], r => modal_actions_ref = r)}
			classList={{
				'c-number-textfield-actions': true,
				...actionsProps[_classList]
			}}
			onToggleOpen={(isOpen) => {
				actionsProps[_onToggleOpen]?.(isOpen)
				setIs_modal_actions_open(isOpen)
				if (!isOpen) {
					numberTextField_ref[_focus]()
					numberTextField_ref[_blur]()
				}
			}}
			{...actionsPropsOther}>
			<TextTooltip text={props[_increaseTooltip]}>
				<IconButton
					ref={r => iconButton_up_ref = r}
					disabled={props[_max] != null && value() >= getMax()}
					onPointerUp={(ev) => onPressEnd('+')}
					onPointerDown={(ev) => onPressStart('+')}
					onContextMenu={(ev) => preventDefault(ev)}
					onKeyDown={ev => {
						const clickKey = ev[_code] == _Enter || ev[_code] == _Space
						const updownKey = ev[_code] == _ArrowDown || ev[_code] == _ArrowUp
						if (clickKey) onPressStart('+')
						if (updownKey && !iconButton_down_ref[_disabled]) iconButton_down_ref[_focus]()
					}}
					onKeyUp={ev => (ev[_code] == _Enter || ev[_code] == _Space) && onPressEnd('+')}
					code={0xE404}
				/>
			</TextTooltip>
			<TextTooltip text={props[_decreaseTooltip]}>
				<IconButton
					ref={r => iconButton_down_ref = r}
					disabled={props[_min] != null && value() <= getMin()}
					onPointerUp={() => onPressEnd('-')}
					onPointerDown={() => onPressStart('-')}
					onContextMenu={(ev) => preventDefault(ev)}
					onKeyDown={ev => {
						const clickKey = ev[_code] == _Enter || ev[_code] == _Space
						const updownKey = ev[_code] == _ArrowDown || ev[_code] == _ArrowUp
						if (clickKey) onPressStart('-')
						if (updownKey && !iconButton_up_ref[_disabled]) iconButton_up_ref[_focus]()
					}}
					onKeyUp={ev => (ev[_code] == _Enter || ev[_code] == _Space) && onPressEnd('-')}
					code={0xE3FC}
				/>
			</TextTooltip>
		</Modal>
	</>)
}

type SearchTextFieldProps = TextFieldProps & {
	result?: JSX.Element
	menuAttr?: Omit<PopoverProps, 'style'> & {
		style?: JSX.CSSProperties
	}
}
const SearchTextField: VoidComponent<SearchTextFieldProps> = ($props) => {
	const [props, other] = splitProps($props, [
		_result, _wrapperAttr, _menuAttr, _onFocus,
	])
	const [wrapperProps, wrapperPropsOther] = splitProps(
		props[_wrapperAttr]! ?? {},
		[_ref, _classList]
	)
	const [menuProps, menuPropsOther] = splitProps(
		props[_menuAttr]! ?? {},
		[_usePortal, _ref, _classList, _style, _onToggleOpen]
	)
	const [width, setWidth] = createSignal<number>(0)
	const resultComponents = children(() => props[_result])
	let is_popover_open: boolean = false
	let isFocus = false
	let event: FocusEvent
	let wrapper_ref: HTMLDivElement
	let menu_ref: HTMLDivElement

	function $openPopover(ev: Event): void {
		if (is_popover_open) return;

		if (Array[_isArray](resultComponents()) && (resultComponents() as unknown[])[_length] == 0) return;

		setWidth(getBoundingClientRect(wrapper_ref)[_width])
		openPopover(ev, menu_ref, {
			allowHideAnchor: false,
			anchor: wrapper_ref,
			position: SearchMenuPosition[_centerBottom],
			manualDismiss: true,
		})
	}

	function resizeObserver(): void {
		let t: number | null = null
		const observer = new ResizeObserver(() => {
			if (t != null) clearTimeDelayed(t)

			t = setTimeDelayed(() => {
				setWidth(getBoundingClientRect(wrapper_ref)[_width])
				repositionPopover(menu_ref)
				t = null
			}, 300)
		})
		observer[_observe](wrapper_ref, { box: "border-box" })

		onCleanup(() => {
			observer[_disconnect]()
		})
	}

	function onClick(ev: MouseEvent): void {
		if (!is_popover_open) return;

		const target = ev[_target] as HTMLElement
		const isClickedInside = wrapper_ref[_contains](target) || menu_ref[_contains](target)

		if (isClickedInside) return;

		closePopover(menu_ref)
	}

	function initEvents(): void {
		addEventListener<MouseEvent>(getDocument(), _click, onClick)

		onCleanup(() => {
			removeEventListener<MouseEvent>(getDocument(), _click, onClick)
		})
	}

	onMount(() => {
		resizeObserver()
		initEvents()
	})

	createEffect(() => {
		const result = resultComponents()
		if (!isFocus && !event) return;
		if (Array[_isArray](result) && (result as unknown[])[_length] == 0) {
			return closePopover(menu_ref)
		}
		$openPopover(event)
	})

	return (<>
		<TextField
			wrapperAttr={{
				ref: mergeRefs(wrapperProps[_ref], r => wrapper_ref = r),
				classList: {
					'c-search-textfield': true,
					...wrapperProps[_classList]
				},
				...wrapperPropsOther
			}}
			onFocus={ev => {
				$openPopover(ev)
				isFocus = isFocus
				event = ev
				callEventHandler(ev, props[_onFocus])
			}}
			{...other}
		/>
		<Popover
			usePortal={menuProps[_usePortal] ?? false}
			onToggleOpen={isOpen => {
				is_popover_open = isOpen
				menuProps[_onToggleOpen]?.(isOpen)
			}}
			ref={mergeRefs(menuProps[_ref], r => menu_ref = r)}
			classList={{
				'c-search-textfield-menu': true,
				...menuProps[_classList]
			}}
			style={{
				'min-width': width() + _px,
				...menuProps[_style]
			}}
			{...menuPropsOther}>
			{resultComponents()}
		</Popover>
	</>)
}

export {
	changeTextFieldValue,
	changeAreaTextFieldValue,
	TextFieldButton,
	TextFieldButton as SearchTextFieldButton,
	TextFieldButton as NumberTextFieldButton,
	TextFieldButton as AreaTextFieldButton,
	AreaTextField,
	NumberTextField,
	TextField,
	SearchTextField,
	openPopover as openSearchMenu,
	closePopover as closeSearchMenu,
	MenuItem as SearchMenuItem,
	LinkMenuItem as LinkSearchMenuItem,
	MenuDivider as SearchMenuDivider,
	MenuHeader as SearchMenuHeader,
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