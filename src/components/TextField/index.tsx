import { type JSX, type ParentComponent, createSignal, createUniqueId, mergeProps, onMount, splitProps, type VoidComponent, children, createEffect, Show, onCleanup } from 'solid-js'

import type { ComponentEvent } from '@/types/event'
import { toggleAttribute } from '@/utils/attributes'
import { clearTimeDelayed, clearTimeInterval, setTimeDelayed, setTimeInterval } from '@/utils/timeout'
import { preventDefault } from '@/utils/event'
import { _centerBottom, _centerCenterLeft, _autoHideLabel, _autoShowClearBtn, _autocomplete, _button, _changeValueTooltip, _checkValidity, _children, _classList, _clearTooltip, _compact, _currentTarget, _decreaseTooltip, _disabled, _dispatchEvent, _focus, _focused, _id, _increaseTooltip, _input, _isIntOnly, _isNaN, _labelAttr, _labelElement, _labelText, _leading, _length, _max, _maxLine, _messageText, _min, _minLine, _off, _onBlur, _onFinalValueChanged, _onFocus, _onInput, _onValueChanged, _placeholder, _px, _readOnly, _ref, _resize, _rows, _scrollHeight, _split, _step, _text, _trailing, _trim, _type, _value, _valuechange, _result, _observe, _disconnect, _width, _menuAttr, _usePortal, _style, _bottom, _clientX, _clientY, _left, _right, _top, _touches, _x, _y, _click, _onToggleOpen, _target, _contains, _isArray, _class, _integerOnly, _suffix, _prefix, _autoSelectAll, _setSelectionRange, _onKeyUp, _blur, _code, _Enter } from '@/constants/string'
import { mathMax, mathRound, numberParse } from '@/utils/math'
import { getBoundingClientRect } from '@/utils/element'
import { getDocument } from '@/constants/window'
import { addEventListener, removeEventListener } from '@/utils/event'

import Icon from '@/components/Icon'
import { TextTooltip } from '@/components/Tooltip'
import Button, { IconButton, type ButtonProps } from '@/components/Button'
import Popover, { closePopover, openPopover, PopoverPosition as SearchMenuPosition, repositionPopover, type PopoverProps } from '../Popover'
import Menu, { MenuItem, LinkMenuItem, MenuDivider, MenuHeader, openMenu, MenuPosition } from '@/components/Menu'
import './index.scss'

const HEIGHT_TEXT_INPUT_PER_LINE = 20

enum TextFieldType {
	text = 'text',
	password = 'password',
	telephone = 'tel',
	email = 'email',
	url = 'url'
}

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
	const event = new Event(_input, { bubbles: true });
	el[_dispatchEvent](event)
}

/**
 * To trigger 'input' event
 *
 * ```ts
 * // don't => (not trigger 'input' event)
 * areatextfield_ref.value = 'new value'
 *
 * // do => (trigger 'input' event)
 * changeAreaTextFieldValue(areatextfield_ref, 'new value')
 * ```
 */
function changeAreaTextFieldValue(el: HTMLTextAreaElement, value: string): void {
	el[_value] = value
	const event = new Event(_input, { bubbles: true });
	el[_dispatchEvent](event)
}

type TextFieldButtonProps = ButtonProps
const TextFieldButton: ParentComponent<TextFieldButtonProps> = ($props) => {
	const $$props = mergeProps({compact: true}, $props)
	const [props, other] = splitProps($$props, [_classList, _compact])
	return (<Button
		compact={props[_compact]}
		classList={{
			'textfield-btn': true,
			...props[_classList]
		}}
		{...other}
	/>)
}

type AreaTextFieldProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'ref' | 'onInput' | 'onFocus' | 'onBlur' | 'children' | 'rows' | 'columns' | 'value'> & {
	leading?: JSX.Element
	trailing?: JSX.Element
	labelText?: JSX.Element
	messageText?: JSX.Element
	focused?: boolean
	value?: string
	minLine?: number
	maxLine?: number
	compact?: boolean
	autoShowClearBtn?: boolean
	autoHideLabel?: boolean
	clearTooltip?: string
	ref?: (el: HTMLTextAreaElement) => void
	labelAttr?: JSX.LabelHTMLAttributes<HTMLLabelElement>
	onInput?: (ev: ComponentEvent<InputEvent, HTMLTextAreaElement, HTMLTextAreaElement>) => void
	onFocus?: (ev: ComponentEvent<FocusEvent, HTMLTextAreaElement, HTMLTextAreaElement>) => void
	onBlur?: (ev: ComponentEvent<FocusEvent, HTMLTextAreaElement, HTMLTextAreaElement>) => void
}
const AreaTextField: VoidComponent<AreaTextFieldProps> = ($props) => {
	const $$props = mergeProps({autoHideLabel: true, id: createUniqueId()}, $props)
	const [props, other] = splitProps($$props, [
		_leading, _onInput, _labelText, _focused,
		_autocomplete, _id, _messageText, _trailing,
		_labelAttr, _disabled, _readOnly,
		_onFocus, _onBlur, _placeholder, _autoHideLabel,
		_value, _ref, _autoShowClearBtn, _clearTooltip,
		_minLine, _maxLine, _compact
	])
	const [isFocus, setIsFocus] = createSignal<boolean>(false)
	const [isInvalid, setIsInvalid] = createSignal<boolean>(false)
	const [value, setValue] = createSignal<string>('')
	const [height, setHeight] = createSignal<number>(HEIGHT_TEXT_INPUT_PER_LINE)
	const trailingComponents = children(() => props[_trailing])
	let areaTextField_ref!: HTMLTextAreaElement

	createEffect(() => {
		const value = props[_value]

		const lines = (value ?? '')[_trim]()[_split]('\n')[_length]
		setHeight(lines * HEIGHT_TEXT_INPUT_PER_LINE)
		setValue(value ?? '')
	})

	return (<label
		class='areatextfield'
		for={props[_id]}
		{...props[_labelAttr]}
	>
		<div
			data-focused={toggleAttribute(props[_focused] ?? isFocus())}
			data-invalid={toggleAttribute(isInvalid())}
			data-disabled={toggleAttribute(props[_disabled])}
			data-trailing={toggleAttribute(trailingComponents() || (props[_autoShowClearBtn] && value()[_length] > 0))}
			data-compact={toggleAttribute(props[_compact])}
			data-readonly={toggleAttribute(props[_readOnly])}>
			<div class='areatextfield-label-text'>{props[_autoHideLabel] && value()[_length] == 0 && !props[_placeholder]? '' : props[_labelText]}</div>
			<div class='areatextfield-leading'>{props[_leading]}</div>
			<textarea
				id={props[_id]}
				ref={(r) => {
					areaTextField_ref = r
					if (props[_ref]) props[_ref](r)
				}}
				onInput={(ev) => {
					setValue(ev[_currentTarget][_value])
					setIsInvalid(!ev[_currentTarget][_checkValidity]())
					if (props[_onInput]) props[_onInput](ev)
					setHeight(HEIGHT_TEXT_INPUT_PER_LINE) // set to one line: to calculate the scroll height
					setHeight(mathMax(ev[_currentTarget][_scrollHeight], HEIGHT_TEXT_INPUT_PER_LINE))
				}}
				onFocus={(ev) => {
					setValue(ev[_currentTarget][_value])
					setIsInvalid(!ev[_currentTarget][_checkValidity]())
					setIsFocus(true)
					if (props[_onFocus]) props[_onFocus](ev)
				}}
				onBlur={(ev) => {
					setValue(ev[_currentTarget][_value])
					setIsFocus(false)
					if (props[_onBlur]) props[_onBlur](ev)
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
			<div class='areatextfield-trailing'>
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
		<div class='areatextfield-message-text'>{props[_messageText]}</div>
	</label>)
}


type TextFieldProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'ref' | 'onInput' | 'onKeyUp' | 'onFocus' | 'onBlur' | 'children'> & {
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
	type?: TextFieldType
	ref?: (el: HTMLInputElement) => void
	labelAttr?: JSX.LabelHTMLAttributes<HTMLLabelElement>
	onInput?: (ev: ComponentEvent<InputEvent, HTMLInputElement, HTMLInputElement>) => void
	onFocus?: (ev: ComponentEvent<FocusEvent, HTMLInputElement, HTMLInputElement>) => void
	onBlur?: (ev: ComponentEvent<FocusEvent, HTMLInputElement, HTMLInputElement>) => void
	onKeyUp?: (ev: ComponentEvent<KeyboardEvent, HTMLInputElement>) => void
}
const TextField: VoidComponent<TextFieldProps> = ($props) => {
	const $$props = mergeProps({type: _text, autoHideLabel: true, id: createUniqueId()}, $props)
	const [props, other] = splitProps($$props, [
		_leading, _onInput, _labelText, _focused,
		_autocomplete, _id, _messageText, _trailing,
		_type, _labelAttr, _disabled, _readOnly,
		_onFocus, _onBlur, _placeholder, _autoHideLabel,
		_value, _ref, _autoShowClearBtn, _clearTooltip,
		_compact, _autoSelectAll, _onKeyUp
	])
	const [isFocus, setIsFocus] = createSignal<boolean>(false)
	const [isInvalid, setIsInvalid] = createSignal<boolean>(false)
	const [value, setValue] = createSignal<string>('')
	const trailingComponents = children(() => props[_trailing])
	let textfield_ref: HTMLInputElement

	createEffect(() => {
		const value = props[_value] as string ?? ''
		setValue(value)
	})

	return (<label
		class={'textfield' + (props[_labelAttr] && props[_labelAttr][_class] != null? ` ${props[_labelAttr][_class]}` : '')}
		for={props[_id]}
		{...(props[_labelAttr]
			? splitProps(props[_labelAttr], [_class])[1]
			: {}
		)}>
		<div
			data-focused={toggleAttribute(props[_focused] ?? isFocus())}
			data-invalid={toggleAttribute(isInvalid())}
			data-compact={toggleAttribute(props[_compact])}
			data-disabled={toggleAttribute(props[_disabled])}
			data-trailing={toggleAttribute(trailingComponents() || (props[_autoShowClearBtn] && value()[_length] > 0))}
			data-readonly={toggleAttribute(props[_readOnly])}>
			<div class='textfield-label-text'>{props[_autoHideLabel] && value()[_length] == 0 && !props[_placeholder]? '' : props[_labelText]}</div>
			<div class='textfield-leading'>{props[_leading]}</div>
			<input
				id={props[_id]}
				ref={(r) => {
					textfield_ref = r
					if (props[_ref]) props[_ref](r)
				}}
				onInput={(ev) => {
					setValue(ev[_currentTarget][_value])
					setIsInvalid(!ev[_currentTarget][_checkValidity]())
					if (props[_onInput]) props[_onInput](ev)
				}}
				onFocus={(ev) => {
					setValue(ev[_currentTarget][_value])
					setIsInvalid(!ev[_currentTarget][_checkValidity]())
					setIsFocus(true)
					if (props[_onFocus]) props[_onFocus](ev)
					if (props[_autoSelectAll]) ev[_currentTarget][_setSelectionRange](0, ev[_currentTarget][_value][_length])
				}}
				onKeyUp={ev => {
					if (ev[_code] == _Enter) ev[_currentTarget][_blur]()
					if (props[_onKeyUp]) props[_onKeyUp](ev)
				}}
				onBlur={(ev) => {
					setValue(ev[_currentTarget][_value])
					setIsFocus(false)
					if (props[_onBlur]) props[_onBlur](ev)
				}}
				type={props[_type]}
				disabled={props[_disabled]}
				autocomplete={props[_autocomplete] ?? _off}
				readOnly={props[_readOnly]}
				value={props[_value]}
				placeholder={props[_placeholder] ?? (props[_autoHideLabel] && props[_labelText]? `${props[_labelText]}` : undefined)}
				{...other}
			/>
			<div class='textfield-trailing'>
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
		<div class='textfield-message-text'>{props[_messageText]}</div>
	</label>)
}

type NumberTextFieldProps = Omit<TextFieldProps, 'type'> & {
	step?: number
	min?: number
	max?: number
	suffix?: string
	prefix?: string
	integerOnly?: boolean
	decreaseTooltip?: string
	increaseTooltip?: string
	changeValueTooltip?: string
	onValueChanged?: (value: number ) => unknown // value change listener
	onFinalValueChanged?: (value: number) => unknown // final value change listener
}
const NumberTextField: VoidComponent<NumberTextFieldProps> = ($props) => {
	const $$props = mergeProps({
		increaseTooltip: 'Increase',
		decreaseTooltip: 'Decrease',
		changeValueTooltip: 'Change value',
	}, $props)
	const [props, other] = splitProps($$props, [
		_max, _min, _trailing, _onValueChanged, _autoShowClearBtn,
		_step, _onBlur, _value, _ref, _focused, _onFinalValueChanged,
		_decreaseTooltip, _increaseTooltip, _changeValueTooltip,
		_clearTooltip, _disabled, _integerOnly, _suffix, _prefix
	])

	const [isActionMenuOpen, setIsActionMenuOpen] = createSignal<boolean>(false)
	const [value, setValue] = createSignal<number>(0)
	let $value: number = 0
	let timeoutId: number | null = null
	let timeoutId2: number | null = null
	let intervalId: number | null = null
	let numberTextField_ref: HTMLInputElement
	let menu_action_ref: HTMLDialogElement

	function changeLength(operator: '+' | '-', continuous: boolean = false): void {
		const changeValue = () => {
			let n = value() + (operator == '+'
				? (props[_step] ?? 1)
				: -(props[_step] ?? 1)
			)

			if (props[_min] != undefined && n < props[_min]) n = props[_min]
			if (props[_max] != undefined && n > props[_max]) n = props[_max]
			if (props[_integerOnly]) n = mathRound(n)

			setValue(n)
			$value = n
			if (props[_onValueChanged]) props[_onValueChanged](n)
			changeTextFieldValue(numberTextField_ref, `${props[_prefix] ?? ''}${n}${props[_suffix] ?? ''}`)

			if (timeoutId2 != null) {
				clearTimeDelayed(timeoutId2)
				timeoutId2 = null
			}

			timeoutId2 = setTimeDelayed(() => {
				if (props[_onFinalValueChanged])
					props[_onFinalValueChanged](value())
			}, 100)
		}

		stopContinuousChangeLength()
		if (continuous){
			timeoutId = (setTimeDelayed(() => {
				intervalId = setTimeInterval(() => changeValue(), 30)
				timeoutId = null
			}, 300))
		}

		if (continuous) return;
		changeValue()
	}

	function stopContinuousChangeLength(): void {
		if (intervalId != null) {
			clearTimeInterval(intervalId)
			intervalId = null
		}
		if (timeoutId != null) {
			clearTimeDelayed(timeoutId)
			timeoutId = null
		}
	}

	onMount(() => {
		let v = numberParse(`${props[_value]}`)

		if (Number[_isNaN](v)) v = value()
		if (props[_min] != undefined && v < props[_min]) v = props[_min]
		if (props[_max] != undefined && v > props[_max]) v = props[_max]
		if (props[_integerOnly]) v = mathRound(v)

		setValue(v)
		$value = v
	})

	createEffect(() => {
		const min = props[_min]
		const max = props[_max]

		if (min != undefined && $value < min) $value = min
		if (max != undefined && $value > max) $value = max
		if (props[_integerOnly]) $value = mathRound($value)
		setValue($value)
	})

	return (<>
		<TextField
			focused={props[_focused] ?? (isActionMenuOpen()? true : undefined)}
			disabled={props[_disabled]}
			ref={(r) => {
				if (props[_ref]) props[_ref](r)
				numberTextField_ref = r
			}}
			value={(() => {
				let v = numberParse(`${props[_value]}`)

				if (Number[_isNaN](v)) v = 0
				if (props[_min] != undefined && v < props[_min]) v = props[_min]
				if (props[_max] != undefined && v > props[_max]) v = props[_max]
				if (props[_integerOnly]) v = mathRound(v)
				setValue(v)

				return `${props[_prefix] ?? ''}${v}${props[_suffix] ?? ''}`
			})()}
			onBlur={(ev) => {
				let v = numberParse(ev[_currentTarget][_value])

				if (Number[_isNaN](v)) v = value()
				if (props[_min] != undefined && v < props[_min]) v = props[_min]
				if (props[_max] != undefined && v > props[_max]) v = props[_max]
				if (props[_integerOnly]) v = mathRound(v)

				const va = value()
				const isChanged = va != v
				changeTextFieldValue(ev[_currentTarget], `${props[_prefix] ?? ''}${v}${props[_suffix] ?? ''}`)
				setValue(v)
				$value = v

				if (isChanged && props[_onFinalValueChanged]) props[_onFinalValueChanged](v)
				if (isChanged && props[_onValueChanged]) props[_onValueChanged](v)
				if (props[_onBlur]) props[_onBlur](ev)
			}}
			trailing={<>
				{ props[_trailing] }
				<Show when={!props[_disabled]}>
					<TextTooltip text={props[_changeValueTooltip]}>
						<TextFieldButton
							onClick={(ev) => openMenu(
								ev,
								menu_action_ref,
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
							let v = 0
							if (props[_min] != undefined && v < props[_min]) v = props[_min]
							if (props[_max] != undefined && v > props[_max]) v = props[_max]
							if (props[_integerOnly]) v = mathRound(v)

							const va = value()
							const isChanged = va != v
							changeTextFieldValue(numberTextField_ref, `${props[_prefix] ?? ''}${v}${props[_suffix] ?? ''}`)
							setValue(v)
							$value = v

							if (isChanged && props[_onFinalValueChanged]) props[_onFinalValueChanged](v)
							if (isChanged && props[_onValueChanged]) props[_onValueChanged](v)
						}}><Icon code={0xE5E9}/></TextFieldButton>
					</TextTooltip>
				</Show>
			</>}
			{...other}
		/>
		<Menu
			ref={r => menu_action_ref = r}
			classList={{'number-textfield-menu': true}}
			onToggleOpen={(v) => setIsActionMenuOpen(v)}>
			<TextTooltip text={props[_increaseTooltip]}>
				<IconButton
					disabled={props[_max] != undefined && value() >= props[_max]}
					onMouseUp={() => stopContinuousChangeLength()}
					onContextMenu={(ev) => preventDefault(ev)}
					onMouseDown={() => changeLength('+', true)}
					onTouchEnd={() => stopContinuousChangeLength()}
					onTouchStart={() => changeLength('+', true)}
					onClick={() => changeLength('+')}
					code={0xE404}
				/>
			</TextTooltip>

			<TextTooltip text={props[_decreaseTooltip]}>
				<IconButton
					disabled={props[_min] != undefined && value() <= props[_min]}
					onMouseUp={() => stopContinuousChangeLength()}
					onContextMenu={(ev) => preventDefault(ev)}
					onMouseDown={() => changeLength('-', true)}
					onTouchEnd={() => stopContinuousChangeLength()}
					onTouchStart={() => changeLength('-', true)}
					onClick={() => changeLength('-')}
					code={0xE3FC}
				/>
			</TextTooltip>
		</Menu>
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
		_result, _labelAttr, _menuAttr, _onFocus,
	])
	const [width, setWidth] = createSignal<number>(0)
	const resultComponents = children(() => props[_result])
	let is_popover_open: boolean = false
	let isFocus = false
	let event: FocusEvent
	let label_ref: HTMLLabelElement
	let menu_ref: HTMLDivElement

	function $openPopover(ev: Event): void {
		if (is_popover_open) return;

		if (Array[_isArray](resultComponents()) && (resultComponents() as unknown[])[_length] == 0) return;

		setWidth(getBoundingClientRect(label_ref)[_width])
		openPopover(ev, menu_ref, {
			allowHideAnchor: false,
			anchor: label_ref,
			position: SearchMenuPosition[_centerBottom],
			manualDismiss: true,
		})
	}

	function resizeObserver(): void {
		let t: number | null = null
		const observer = new ResizeObserver(() => {
			if (t != null) clearTimeDelayed(t)

			t = setTimeDelayed(() => {
				setWidth(getBoundingClientRect(label_ref)[_width])
				repositionPopover(menu_ref)
				t = null
			}, 300)
		})
		observer[_observe](label_ref, { box: "border-box" })

		onCleanup(() => {
			observer[_disconnect]()
		})
	}

	function onClick(ev: MouseEvent): void {
		if (!is_popover_open) return;

		const target = ev[_target] as HTMLElement
		const isClickedInside = label_ref[_contains](target) || menu_ref[_contains](target)

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
			labelAttr={{
				...props[_labelAttr],
				ref: (r) => {
					label_ref = r
					if (props[_labelAttr] && props[_labelAttr][_ref]) (props[_labelAttr][_ref] as ((el: HTMLLabelElement) => void))(r)
				},
			}}
			onFocus={ev => {
				$openPopover(ev)
				isFocus = isFocus
				event = ev
				if (props[_onFocus]) props[_onFocus](ev)
			}}
			{...other}
		/>
		<Popover
			usePortal={props[_menuAttr] && props[_menuAttr][_usePortal]? props[_menuAttr][_usePortal] : false}
			onToggleOpen={isOpen => {
				is_popover_open = isOpen
				if (props[_menuAttr] && props[_menuAttr][_onToggleOpen]) props[_menuAttr][_onToggleOpen](isOpen)
			}}
			ref={r => {
				menu_ref = r
				if (props[_menuAttr] && props[_menuAttr][_ref]) props[_menuAttr][_ref](r)
			}}
			classList={{
				'search-textfield-menu': true,
				...(props[_menuAttr]? props[_menuAttr][_classList] : {})
			}}
			style={{
				'min-width': width() + _px,
				...(props[_menuAttr]? props[_menuAttr][_style] : {})
			}}
			{...splitProps(props[_menuAttr] ?? {}, [_onToggleOpen, _usePortal, _style, _ref, _classList])[1]}>
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
	TextFieldType,
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