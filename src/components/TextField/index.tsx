import { type JSX, type ParentComponent, createSignal, createUniqueId, mergeProps, onMount, splitProps, type VoidComponent, children, createEffect, Show, onCleanup, createMemo } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import { attr_set_if_exist, classlist } from '@/utils/attributes'
import { timeout_clear, interval_clear, timeout_set, interval_set } from '@/utils/timeout'
import { event_call, event_current_target, event_prevent_default, event_target } from '@/utils/event'
import { math_clamp, math_max, math_round } from '@/utils/math'
import { element_blur, element_contains, element_dispatch_event, element_focus, element_id, element_rect, element_remove_style, element_scroll_height, element_set_style, element_tagname, element_valid_target } from '@/utils/element'
import { event_add_listener, event_remove_listener } from '@/utils/event'
import { is_array, is_number, is_string } from '@/utils/typecheck'
import { string_length, string_split, string_touppercase, string_trim } from '@/utils/string'
import { array_length } from '@/utils/array'
import { number_is_nan, number_is_not_defined, number_parse, number_safe } from '@/utils/number'
import { rect_width } from '@/utils/rect'
import { document_active } from '@/utils/document'
import { KEY_ARROW_DOWN, KEY_ARROW_UP, KEY_ENTER, KEY_SPACE } from '@/constants/key_code'
import { ICON_CHEVRON_DOWN, ICON_CHEVRON_UP, ICON_CHEVRON_UP_DOWN, ICON_DISMISS } from '@/constants/icons'

import Icon from '@/components/Icon'
import Button, { IconButton, type ButtonProps } from '@/components/Button'
import Popover, { close_popover, is_popover_open, open_popover, reposition_popover, PopoverPosition as SearchMenuPosition, type PopoverProps } from '@/components/Popover'
import { MenuItem, LinkMenuItem, MenuDivider, MenuHeader, MenuPosition, open_menu } from '@/components/Menu'
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
 * textfield_ref.value = 'new value'
 *
 * // do => (trigger 'input' event)
 * change_textfield_value(textfield_ref, 'new value')
 * ```
 */
function change_textfield_value(el: HTMLInputElement, value: string): void {
	el.value = value
	element_dispatch_event(el, new Event('input', { bubbles: true }))
}

/**
 * To trigger 'input' event
 *
 * ```ts
 * // don't => (not trigger 'input' event)
 * areatextfield_ref.value = 'new value'
 *
 * // do => (trigger 'input' event)
 * change_areatextfield_value(areatextfield_ref, 'new value')
 * ```
 */
function change_areatextfield_value(el: HTMLTextAreaElement, value: string): void {
	el.value = value
	element_dispatch_event(el, new Event('input', { bubbles: true }))
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
	c_leading?: JSX.Element
	c_trailing?: JSX.Element
	c_trailing_auto_tabindex?: boolean
	c_label?: string
	c_message?: string
	c_focused?: boolean
	c_min_line?: number
	c_max_line?: number
	c_auto_show_clear_button?: boolean
	c_auto_hide_label?: boolean
	c_tooltip_clear?: string
	c_auto_validation?: boolean
	c_attr_wrapper?: JSX.HTMLAttributes<HTMLDivElement>
}
const AreaTextField: VoidComponent<AreaTextFieldProps> = ($props) => {
	const $$props = mergeProps({
		c_auto_validation: true,
		c_trailing_auto_tabindex: true,
		c_auto_hide_label: true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'c_leading', 'onInput', 'c_label', 'c_focused',
		'autocomplete', 'id', 'c_message', 'c_trailing',
		'disabled', 'readOnly', 'c_auto_validation',
		'onFocus', 'onBlur', 'placeholder', 'c_auto_hide_label',
		'value', 'ref', 'c_auto_show_clear_button', 'c_tooltip_clear',
		'c_min_line', 'c_max_line', 'c_attr_wrapper',
		'c_trailing_auto_tabindex'
	])
	const [wrapper_props, wrapper_props_other] = splitProps(props.c_attr_wrapper! ?? {}, ['class'])
	const [is_focus, set_is_focus] = createSignal<boolean>(false)
	const [is_invalid, set_is_invalid] = createSignal<boolean>(false)
	const [value, set_value] = createSignal<string>('')
	const [height, set_height] = createSignal<number>(HEIGHT_TEXT_INPUT_PER_LINE)
	const is_show_clear_button = createMemo(() => props.c_auto_show_clear_button && string_length(value()) > 0)
	const trailing = children(() => props.c_trailing)
	const leading = children(() => props.c_leading)
	const message = children(() => props.c_message)
	const button_clear_id = createUniqueId()
	let areatextfield_ref!: HTMLTextAreaElement
	let stop_focus: boolean = false

	createEffect(() => {
		const value = `${props.value ?? ''}`

		const lines = array_length(string_split(string_trim(value ?? ''), '\n'))
		set_height(lines * HEIGHT_TEXT_INPUT_PER_LINE)
		set_value(value ?? '')
	})

	const TrailingContent: VoidComponent = () => {
		return (<>
			{trailing()}
			<Show when={is_show_clear_button()}>
				<TextFieldButton
					data-tooltip={props.c_tooltip_clear ?? 'Clear'}
					type={'button'}
					id={button_clear_id}>
					<Icon c_code={ICON_DISMISS}/>
				</TextFieldButton>
			</Show>
		</>)
	}

	return (<div
		class={classlist('c-area-textfield', wrapper_props.class ?? '')}
		{...wrapper_props_other}>
		<div
			data-c-focused={attr_set_if_exist(props.c_focused ?? is_focus())}
			data-c-invalid={attr_set_if_exist(!props.disabled && props.c_auto_validation && is_invalid())}
			data-c-disabled={attr_set_if_exist(props.disabled)}
			data-c-trailing={attr_set_if_exist(trailing() || (props.c_auto_show_clear_button && string_length(value()) > 0))}
			data-c-readonly={attr_set_if_exist(props.readOnly)}
			onClick={() => {
				if (stop_focus) return stop_focus = false

				element_focus(areatextfield_ref)
			}}>
			<Show when={!(props.c_auto_hide_label && string_length(value()) == 0 && !props.placeholder)}>
				<label for={props.id} class='c-area-textfield-label'>{props.c_label}</label>
			</Show>
			<Show when={leading()}>
				<div
					class='c-area-textfield-leading'
					onClick={() => stop_focus = true}>
					{leading()}
				</div>
			</Show>
			<textarea
				id={props.id}
				ref={mergeRefs(props.ref, r => areatextfield_ref = r)}
				onInput={(ev) => {
					event_call(ev, props.onInput)
					const self = event_current_target(ev)
					set_value(self.value)
					set_is_invalid(!self.checkValidity())
					set_height(HEIGHT_TEXT_INPUT_PER_LINE) // set to one line: to calculate the scroll height
					set_height(math_max(element_scroll_height(self), HEIGHT_TEXT_INPUT_PER_LINE))
				}}
				onFocus={(ev) => {
					event_call(ev, props.onFocus)
					const self = event_current_target(ev)
					set_value(self.value)
					set_is_invalid(!self.checkValidity())
					set_is_focus(true)
				}}
				onBlur={(ev) => {
					event_call(ev, props.onBlur)
					set_value(event_current_target(ev).value)
					set_is_focus(false)
				}}
				rows={props.c_min_line ?? 1}
				disabled={props.disabled}
				autocomplete={props.autocomplete ?? 'off'}
				readOnly={props.readOnly}
				value={props.value}
				style={{
					height: height() + 'px',
					"min-height": props.c_min_line? ((HEIGHT_TEXT_INPUT_PER_LINE * props.c_min_line) + 'px') : undefined,
					"max-height": props.c_max_line && props.c_max_line >= (props.c_min_line ?? 1)? ((HEIGHT_TEXT_INPUT_PER_LINE * props.c_max_line) + 'px') : undefined
				}}
				placeholder={props.placeholder ?? (props.c_auto_hide_label && props.c_label? `${props.c_label}` : undefined)}
				{...other}></textarea>
			<Show when={trailing() || is_show_clear_button()}>
				<div
					class='c-area-textfield-trailing'
					onClick={ev => {
						stop_focus = true
						if (element_id(document_active()!) == button_clear_id) {
							change_areatextfield_value(areatextfield_ref, '')
							event_prevent_default(ev)
							element_focus(areatextfield_ref)
						}
					}}>
					<Show
						when={props.c_trailing_auto_tabindex}
						fallback={<TrailingContent />}>
						<FocusableGroup c_arrow_options={{left: 'prev', right: 'next'}}>
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
	c_leading?: JSX.Element
	c_trailing?: JSX.Element
	c_trailing_auto_tabindex?: boolean
	c_label?: string
	c_message?: string
	c_focused?: boolean
	c_auto_show_clear_button?: boolean
	c_auto_hide_label?: boolean
	c_auto_select_all?: boolean
	c_tooltip_clear?: string
	c_auto_validation?: boolean
	c_attr_wrapper?: JSX.HTMLAttributes<HTMLDivElement>
}
const TextField: VoidComponent<TextFieldProps> = ($props) => {
	const $$props = mergeProps({
		c_auto_validation: true,
		c_trailing_auto_tabindex: true,
		c_auto_hide_label: true,
		type: 'text',
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'c_leading', 'onInput', 'c_label', 'c_focused',
		'autocomplete', 'id', 'c_message', 'c_trailing',
		'type', 'c_attr_wrapper', 'disabled', 'readOnly',
		'onFocus', 'onBlur', 'placeholder', 'c_auto_hide_label',
		'value', 'ref', 'c_auto_show_clear_button', 'c_tooltip_clear',
		'c_auto_select_all', 'onKeyUp', 'c_auto_validation',
		'c_trailing_auto_tabindex'
	])
	const [wrapper_props, wrapper_props_other] = splitProps(props.c_attr_wrapper! ?? {}, ['class'])
	const [is_focus, set_is_focus] = createSignal<boolean>(false)
	const [is_invalid, set_is_invalid] = createSignal<boolean>(false)
	const [value, set_value] = createSignal<string>('')
	const is_show_clear_button = createMemo(() => props.c_auto_show_clear_button && string_length(value()) > 0)
	const trailing = children(() => props.c_trailing)
	const leading = children(() => props.c_leading)
	const message = children(() => props.c_message)
	const button_clear_id = createUniqueId()
	let textfield_ref: HTMLInputElement
	let stop_focus: boolean = false

	createEffect(() => {
		const value = props.value
		set_value(v => `${value ?? v}`)
	})

	const TrailingContent: VoidComponent = () => {
		return (<>
			{trailing()}
			<Show when={is_show_clear_button()}>
				<TextFieldButton
					data-tooltip={props.c_tooltip_clear ?? 'Clear'}
					type={'button'}
					id={button_clear_id}>
					<Icon c_code={ICON_DISMISS}/>
				</TextFieldButton>
			</Show>
		</>)
	}

	return (<div
		class={classlist('c-textfield', wrapper_props.class ?? '')}
		{...wrapper_props_other}>
		<div
			data-c-focused={attr_set_if_exist(props.c_focused ?? is_focus())}
			data-c-invalid={attr_set_if_exist(!props.disabled && props.c_auto_validation && is_invalid())}
			data-c-disabled={attr_set_if_exist(props.disabled)}
			data-c-trailing={attr_set_if_exist(trailing() || (props.c_auto_show_clear_button && string_length(value()) > 0))}
			data-c-readonly={attr_set_if_exist(props.readOnly)}
			onClick={() => {
				if (stop_focus) return stop_focus = false

				element_focus(textfield_ref)
			}}>
			<Show when={!(props.c_auto_hide_label && string_length(value()) == 0 && !props.placeholder)}>
				<label class='c-textfield-label' for={props.id}>{props.c_label}</label>
			</Show>
			<Show when={leading()}>
				<div
					class='c-textfield-leading'
					onClick={() => stop_focus = true}>
					{leading()}
				</div>
			</Show>
			<input
				id={props.id}
				ref={mergeRefs(props.ref, r => textfield_ref = r)}
				onInput={(ev) => {
					event_call(ev, props.onInput)
					const self = event_current_target(ev)
					set_value(self.value)
					set_is_invalid(!self.checkValidity())
				}}
				onFocus={(ev) => {
					event_call(ev, props.onFocus)
					const self = event_current_target(ev)
					set_value(self.value)
					set_is_invalid(!self.checkValidity())
					set_is_focus(true)
					if (props.c_auto_select_all) self.setSelectionRange(0, string_length(self.value))
				}}
				onKeyUp={ev => {
					event_call(ev, props.onKeyUp)
					if (ev.key == 'Enter') element_blur(event_current_target(ev))
				}}
				onBlur={(ev) => {
					set_value(event_current_target(ev).value)
					set_is_focus(false)
					event_call(ev, props.onBlur)
				}}
				type={props.type}
				disabled={props.disabled}
				autocomplete={props.autocomplete ?? 'off'}
				readOnly={props.readOnly}
				value={props.value}
				placeholder={props.placeholder ?? (props.c_auto_hide_label && props.c_label? `${props.c_label}` : undefined)}
				{...other}
			/>
			<Show when={trailing() || is_show_clear_button()}>
				<div
					class='c-textfield-trailing'
					onClick={ev => {
						stop_focus = true
						if (element_id(document_active()!) == button_clear_id) {
							change_textfield_value(textfield_ref, '')
							event_prevent_default(ev)
							element_focus(textfield_ref)
						}
					}}>
					<Show
						when={props.c_trailing_auto_tabindex}
						fallback={<TrailingContent />}>
						<FocusableGroup c_arrow_options={{left: 'prev', right: 'next'}}>
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
	c_integer_only?: boolean
	c_tooltip_decrease?: string
	c_tooltip_increase?: string
	c_tooltip_change_value?: string
	c_auto_fix_on_blur?: boolean
	c_attr_actions?: ModalProps
	c_on_inputasnumber?(ev: InputEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}, value: number): unknown
}
const NumberTextField: VoidComponent<NumberTextFieldProps> = ($props) => {
	const $$props = mergeProps({
		c_tooltip_increase: 'Increase',
		c_tooltip_decrease: 'Decrease',
		c_tooltip_change_value: 'Change value',
		c_auto_fix_on_blur: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'max', 'min', 'c_trailing', 'c_auto_show_clear_button', 'onBlur',
		'value', 'ref', 'c_focused', 'c_attr_wrapper',
		'c_tooltip_decrease', 'c_tooltip_increase', 'c_tooltip_change_value',
		'c_tooltip_clear', 'disabled', 'c_integer_only', 'c_auto_fix_on_blur',
		'c_attr_actions', 'c_on_inputasnumber', 'onInput'
	])
	const [wrapper_props, wrapper_props_other] = splitProps(
		props.c_attr_wrapper! ?? {},
		['classList']
	)
	const [actions_props, actions_props_other] = splitProps(
		props.c_attr_actions! ?? {},
		['ref', 'classList', 'c_on_toggleopen', 'onKeyDown', 'onKeyUp']
	)

	const [is_modal_actions_open, set_is_modal_actions_open] = createSignal<boolean>(false)
	const [value, set_value] = createSignal<number>(0)
	let timeout_id: number | null = null
	let interval_id: number | null = null
	let numbertextfield_ref: HTMLInputElement
	let modal_actions_ref: HTMLDialogElement
	let iconbutton_up_ref: HTMLButtonElement
	let iconbutton_down_ref: HTMLButtonElement

	function get_max(default_number?: number): number {
		const max = props.max
		let v: number = default_number ?? value()

		if (is_string(max)) v = number_parse(max as string, props.c_integer_only)
		else if (is_number(max)) v = max as number
		return props.c_integer_only? math_round(v) : v
	}

	function get_min(default_number?: number): number {
		const min = props.min
		let v: number = default_number ?? value()

		if (is_string(min)) v = number_parse(min as string, props.c_integer_only)
		else if (is_number(min)) v = min as number
		return props.c_integer_only? math_round(v) : v
	}

	function change_value(operator: '+' | '-'): void {
		const is_reach_limit = (
			(
				operator == '+'
				&& props.max != null
				&& value() >= get_max()
			)
			|| (
				operator == '-'
				&& props.min != null
				&& value() <= get_min()
			)
		)
		if (is_reach_limit) {
			if (interval_id != null) interval_clear(interval_id)
			if (timeout_id != null) timeout_clear(timeout_id)
			interval_id = timeout_id = null
			return
		}

		if (operator == '+') numbertextfield_ref.stepUp()
		else numbertextfield_ref.stepDown()

		let n = numbertextfield_ref.valueAsNumber
		if (number_is_nan(n)) n = value()

		n = math_clamp(n, get_min(n), get_max(n))
		if (props.c_integer_only) n = math_round(n)

		set_value(n)
		change_textfield_value(numbertextfield_ref, `${n}`)
	}

	function on_press_start(operator: '+' | '-'): void {
		if (timeout_id != null) timeout_clear(timeout_id)

		timeout_id = timeout_set(() => {
			if (interval_id != null) interval_clear(interval_id)
			interval_id = interval_set(() => change_value(operator), 30)
			timeout_id = null
		}, 200)
	}

	function on_press_end(operator: '+' | '-'): void {
		if (interval_id != null) interval_clear(interval_id)
		if (timeout_id != null) timeout_clear(timeout_id)
		interval_id = timeout_id = null
		change_value(operator)
	}

	function fix_input_number(): void {
		let n = number_safe(
			number_parse(numbertextfield_ref.value, props.c_integer_only),
			value()
		)

		n = math_clamp(n, get_min(n), get_max(n))
		if (props.c_integer_only) n = math_round(n)

		set_value(n)
		change_textfield_value(numbertextfield_ref, string_touppercase(`${n}`))
	}

	createEffect(() => {
		let v = number_parse(`${props.value}`)
		if (number_is_not_defined(v)) return;

		const integer_only = props.c_integer_only
		let max = props.max ?? v
		let min = props.min ?? v

		if (is_string(max)) max = number_parse(max as string, integer_only)
		if (is_string(min)) min = number_parse(min as string, integer_only)

		v = math_clamp(v, min as number, max as number)
		if (integer_only) v = math_round(v)

		set_value(v)
	})

	return (<>
		<TextField
			c_focused={props.c_focused ?? (is_modal_actions_open()? true : undefined)}
			disabled={props.disabled}
			ref={mergeRefs(props.ref, r => numbertextfield_ref = r)}
			value={value()}
			c_attr_wrapper={{
				classList: {
					'c-number-textfield': true,
					...wrapper_props.classList
				},
				...wrapper_props_other
			}}
			onBlur={ev => {
				event_call(ev, props.onBlur)
				if (props.c_auto_fix_on_blur) fix_input_number()
			}}
			onInput={ev => {
				event_call(ev, props.onInput)
				if (props.c_on_inputasnumber){
					let n = number_parse(numbertextfield_ref.value, props.c_integer_only)
					n = number_safe(n, value())
					n = math_clamp(n, get_min(n), get_max(n))
					if (props.c_integer_only) n = math_round(n)
					props.c_on_inputasnumber(ev, n)
				}
			}}
			type='number'
			c_trailing={<>
				{ props.c_trailing }
				<Show when={!props.disabled}>
					<TextFieldButton
						data-tooltip={props.c_tooltip_change_value}
						onClick={(ev) => open_menu(
							ev,
							modal_actions_ref,
							{
								position: MenuPosition.center_center_left,
								anchor: event_current_target(ev)
							})
						}>
						<Icon c_code={ICON_CHEVRON_UP_DOWN}/>
					</TextFieldButton>
				</Show>
				<Show when={props.c_auto_show_clear_button && value() != 0}>
					<TextFieldButton data-tooltip={props.c_tooltip_clear ?? 'Clear'} onClick={(_ev) => {
						let v = math_clamp(0, get_min(0), get_max())
						if (props.c_integer_only) v = math_round(v)

						numbertextfield_ref.value = `${v}`
						set_value(v)
					}}><Icon c_code={ICON_DISMISS}/></TextFieldButton>
				</Show>
			</>}
			{...other}
		/>
		<Modal
			ref={mergeRefs(actions_props.ref, r => modal_actions_ref = r)}
			classList={{
				'c-number-textfield-actions': true,
				...actions_props.classList
			}}
			c_on_toggleopen={(is_open) => {
				actions_props.c_on_toggleopen?.(is_open)
				set_is_modal_actions_open(is_open)

				// I don't remember why I need this
				if (!is_open) {
					element_focus(numbertextfield_ref)
					element_blur(numbertextfield_ref)
				}
			}}
			onKeyDown={(ev) => {
				event_call(ev, actions_props.onKeyDown)
				const code = ev.code
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				const click_key = code == KEY_ENTER || code == KEY_SPACE
				const arrow_key = code == KEY_ARROW_UP || code == KEY_ARROW_DOWN

				if (!click_key && !arrow_key) return

				switch (button) {
					case iconbutton_up_ref: {
						if (click_key) on_press_start('+')
						if (arrow_key && !iconbutton_down_ref.disabled) element_focus(iconbutton_down_ref)
							break
					}
					case iconbutton_down_ref: {
						if (click_key) on_press_start('-')
						if (arrow_key && !iconbutton_up_ref.disabled) element_focus(iconbutton_up_ref)
						break
					}
				}
			}}
			onKeyUp={(ev) => {
				event_call(ev, actions_props.onKeyUp)
				const code = ev.code
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				) || (code != KEY_ENTER && code != KEY_SPACE)) return

				switch (button) {
					case iconbutton_up_ref: on_press_end('+'); break
					case iconbutton_down_ref: on_press_end('-'); break
				}
			}}
			{...actions_props_other}>
			<Tooltip>
				<IconButton
					data-tooltip={props.c_tooltip_increase}
					ref={r => iconbutton_up_ref = r}
					disabled={props.max != null && value() >= get_max()}
					onPointerUp={() => on_press_end('+')}
					onPointerDown={() => on_press_start('+')}
					c_code={ICON_CHEVRON_UP}
				/>
				<IconButton
					data-tooltip={props.c_tooltip_decrease}
					ref={r => iconbutton_down_ref = r}
					disabled={props.min != null && value() <= get_min()}
					onPointerUp={() => on_press_end('-')}
					onPointerDown={() => on_press_start('-')}
					c_code={ICON_CHEVRON_DOWN}
				/>
			</Tooltip>
		</Modal>
	</>)
}

type SearchTextFieldProps = TextFieldProps & {
	c_result?: JSX.Element
	c_attr_menu?: Omit<PopoverProps, 'style'> & {
		style?: JSX.CSSProperties
	}
}
const SearchTextField: VoidComponent<SearchTextFieldProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_result', 'c_attr_wrapper', 'c_attr_menu', 'onFocus'
	])
	const [wrapper_props, wrapper_props_other] = splitProps(
		props.c_attr_wrapper! ?? {},
		['ref', 'classList']
	)
	const [menu_props, menu_props_other] = splitProps(
		props.c_attr_menu! ?? {},
		['c_use_portal', 'ref', 'classList', 'c_on_toggleopen']
	)
	const result = children(() => props.c_result)
	let is_popover_open: boolean = false
	let is_focus = false
	let event: FocusEvent
	let wrapper_ref: HTMLDivElement
	let menu_ref: HTMLDivElement

	function $open_popover(ev: Event): void {
		if (is_popover_open) return;

		if (is_array(result()) && array_length(result() as unknown[]) == 0) return;

		element_remove_style(menu_ref, 'width')
		const textfield_width = rect_width(element_rect(wrapper_ref))
		const menu_width = rect_width(element_rect(menu_ref))
		if (textfield_width > menu_width) element_set_style(
			menu_ref,
			'width',
			`${textfield_width}px`
		)
		open_popover(ev, menu_ref, {
			allow_hide_anchor: false,
			anchor: wrapper_ref,
			position: SearchMenuPosition.center_bottom,
			manual_dismiss: true,
		})
	}

	function on_click(ev: MouseEvent): void {
		if (!is_popover_open) return;

		const target = event_target(ev) as HTMLElement
		const is_clicked_inside = element_contains(wrapper_ref, target) || element_contains(menu_ref, target)

		if (is_clicked_inside) return;

		close_popover(menu_ref)
	}

	function init_events(): void {
		event_add_listener<MouseEvent>(document, 'click', on_click)

		onCleanup(() => {
			event_remove_listener<MouseEvent>(document, 'click', on_click)
		})
	}

	onMount(() => {
		init_events()
	})

	createEffect(() => {
		const r = result()
		if (!is_focus && !event) return;
		if (is_array(r) && array_length(r as unknown[]) == 0) {
			return close_popover(menu_ref)
		}
		$open_popover(event)
	})

	return (<>
		<TextField
			c_attr_wrapper={{
				ref: mergeRefs(wrapper_props.ref, r => wrapper_ref = r),
				classList: {
					'c-search-textfield': true,
					...wrapper_props.classList
				},
				...wrapper_props_other
			}}
			onFocus={ev => {
				event_call(ev, props.onFocus)
				$open_popover(ev)
				is_focus = is_focus
				event = ev
			}}
			{...other}
		/>
		<Popover
			c_use_portal={menu_props.c_use_portal ?? false}
			c_on_toggleopen={isOpen => {
				is_popover_open = isOpen
				menu_props.c_on_toggleopen?.(isOpen)
			}}
			ref={mergeRefs(menu_props.ref, r => menu_ref = r)}
			classList={{
				'c-search-textfield-menu': true,
				...menu_props.classList
			}}
			{...menu_props_other}>
			{result()}
		</Popover>
	</>)
}

export {
	change_textfield_value,
	change_areatextfield_value,
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
	is_popover_open as is_searchtextfieldmenu_open,
	close_popover as close_searchtextfieldmenu,
	open_popover as open_searchtextfieldmenu,
	reposition_popover as reposition_searchtextfieldmenu,
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