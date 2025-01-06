import { type JSX, type ParentComponent, createSignal, createUniqueId, mergeProps, onMount, splitProps, type VoidComponent, children, createEffect, Show, onCleanup, createMemo } from 'solid-js'
import { mergeRefs } from '@solid-primitives/refs'

import { attr_set_if_exist, classlist } from '@/utils/attributes'
import { timeout_clear, interval_clear, timeout_set, interval_set } from '@/utils/timeout'
import { event_call, event_current_target, event_prevent_default, event_target } from '@/utils/event'
import { math_clamp, math_max, math_round } from '@/utils/math'
import { element_blur, element_contains, element_dispatch_event, element_focus, element_rect, element_scroll_height } from '@/utils/element'
import { event_add_listener, event_remove_listener } from '@/utils/event'
import { is_array, is_number, is_string } from '@/utils/typecheck'
import { string_length, string_split, string_touppercase, string_trim } from '@/utils/string'
import { array_length } from '@/utils/array'
import { number_is_nan, number_is_not_defined, number_parse, number_safe } from '@/utils/number'
import { rect_width } from '@/utils/rect'

import Icon from '@/components/Icon'
import { Tooltip } from '@/components/Tooltip'
import Button, { IconButton, type ButtonProps } from '@/components/Button'
import Popover, { close_popover, is_popover_open, open_popover, reposition_popover, PopoverPosition as SearchMenuPosition, type PopoverProps } from '@/components/Popover'
import { MenuItem, LinkMenuItem, MenuDivider, MenuHeader, MenuPosition, open_menu } from '@/components/Menu'
import Modal, { type ModalProps } from '@/components/Modal'
import FocusableGroup from '@/components/FocusableGroup'
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
	const $$props = mergeProps({compact: true}, $props)
	const [props, other] = splitProps($$props, ['classList'])
	return (<Button
		classList={{
			'c-textfield-btn': true,
			...props.classList
		}}
		{...other}
	/>)
}

type AreaTextFieldProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'children' | 'rows' | 'columns'> & {
	leading?: JSX.Element
	trailing?: JSX.Element
	trailing_auto_tabindex?: boolean
	label?: string
	message?: string
	focused?: boolean
	min_line?: number
	max_line?: number
	auto_show_clear_button?: boolean
	auto_hide_label?: boolean
	tooltip_clear?: string
	auto_validation?: boolean
	attr_wrapper?: JSX.HTMLAttributes<HTMLDivElement>
}
const AreaTextField: VoidComponent<AreaTextFieldProps> = ($props) => {
	const $$props = mergeProps({
		auto_validation: true,
		trailing_auto_tabindex: true,
		auto_hide_label: true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'leading', 'onInput', 'label', 'focused',
		'autocomplete', 'id', 'message', 'trailing',
		'disabled', 'readOnly', 'auto_validation',
		'onFocus', 'onBlur', 'placeholder', 'auto_hide_label',
		'value', 'ref', 'auto_show_clear_button', 'tooltip_clear',
		'min_line', 'max_line', 'attr_wrapper',
		'trailing_auto_tabindex'
	])
	const [wrapper_props, wrapper_props_other] = splitProps(props.attr_wrapper! ?? {}, ['class'])
	const [is_focus, set_is_focus] = createSignal<boolean>(false)
	const [is_invalid, set_is_invalid] = createSignal<boolean>(false)
	const [value, set_value] = createSignal<string>('')
	const [height, set_height] = createSignal<number>(HEIGHT_TEXT_INPUT_PER_LINE)
	const is_show_clear_button = createMemo(() => props.auto_show_clear_button && string_length(value()) > 0)
	const trailing = children(() => props.trailing)
	const leading = children(() => props.leading)
	const message = children(() => props.message)
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
		return (<Tooltip>
			{trailing()}
			<Show when={is_show_clear_button()}>
				<TextFieldButton
					data-tooltip={props.tooltip_clear ?? 'Clear'}
					type={'button'}
					id={button_clear_id}>
					<Icon code={0xE5E9}/>
				</TextFieldButton>
			</Show>
		</Tooltip>)
	}

	return (<div
		class={classlist('c-area-textfield', wrapper_props.class ?? '')}
		{...wrapper_props_other}>
		<div
			data-c-focused={attr_set_if_exist(props.focused ?? is_focus())}
			data-c-invalid={attr_set_if_exist(!props.disabled && props.auto_validation && is_invalid())}
			data-c-disabled={attr_set_if_exist(props.disabled)}
			data-c-trailing={attr_set_if_exist(trailing() || (props.auto_show_clear_button && string_length(value()) > 0))}
			data-c-readonly={attr_set_if_exist(props.readOnly)}
			onClick={() => {
				if (stop_focus) return stop_focus = false

				element_focus(areatextfield_ref)
			}}>
			<Show when={!(props.auto_hide_label && string_length(value()) == 0 && !props.placeholder)}>
				<label for={props.id} class='c-area-textfield-label'>{props.label}</label>
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
					const self = event_current_target(ev)
					set_value(self.value)
					set_is_invalid(!self.checkValidity())

					event_call(ev, props.onInput)
					set_height(HEIGHT_TEXT_INPUT_PER_LINE) // set to one line: to calculate the scroll height
					set_height(math_max(element_scroll_height(self), HEIGHT_TEXT_INPUT_PER_LINE))
				}}
				onFocus={(ev) => {
					const self = event_current_target(ev)
					set_value(self.value)
					set_is_invalid(!self.checkValidity())
					set_is_focus(true)
					event_call(ev, props.onFocus)
				}}
				onBlur={(ev) => {
					set_value(event_current_target(ev).value)
					set_is_focus(false)
					event_call(ev, props.onBlur)
				}}
				rows={props.min_line ?? 1}
				disabled={props.disabled}
				autocomplete={props.autocomplete ?? 'off'}
				readOnly={props.readOnly}
				value={props.value}
				style={{
					height: height() + 'px',
					"min-height": props.min_line? ((HEIGHT_TEXT_INPUT_PER_LINE * props.min_line) + 'px') : undefined,
					"max-height": props.max_line && props.max_line >= (props.min_line ?? 1)? ((HEIGHT_TEXT_INPUT_PER_LINE * props.max_line) + 'px') : undefined
				}}
				placeholder={props.placeholder ?? (props.auto_hide_label && props.label? `${props.label}` : undefined)}
				{...other}></textarea>
			<Show when={trailing() || is_show_clear_button()}>
				<div
					class='c-area-textfield-trailing'
					onClick={ev => {
						stop_focus = true
						if (event_target(ev).id == button_clear_id) {
							change_areatextfield_value(areatextfield_ref, '')
							event_prevent_default(ev)
							element_focus(areatextfield_ref)
						}
					}}>
					<Show
						when={props.trailing_auto_tabindex}
						fallback={<TrailingContent />}>
						<FocusableGroup arrow_options={{left: 'prev', right: 'next'}}>
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
	leading?: JSX.Element
	trailing?: JSX.Element
	trailing_auto_tabindex?: boolean
	label?: string
	message?: string
	focused?: boolean
	auto_show_clear_button?: boolean
	auto_hide_label?: boolean
	auto_select_all?: boolean
	tooltip_clear?: string
	auto_validation?: boolean
	attr_wrapper?: JSX.HTMLAttributes<HTMLDivElement>
}
const TextField: VoidComponent<TextFieldProps> = ($props) => {
	const $$props = mergeProps({
		auto_validation: true,
		trailing_auto_tabindex: true,
		type: 'text',
		auto_hide_label: true,
		id: createUniqueId()
	}, $props)
	const [props, other] = splitProps($$props, [
		'leading', 'onInput', 'label', 'focused',
		'autocomplete', 'id', 'message', 'trailing',
		'type', 'attr_wrapper', 'disabled', 'readOnly',
		'onFocus', 'onBlur', 'placeholder', 'auto_hide_label',
		'value', 'ref', 'auto_show_clear_button', 'tooltip_clear',
		'auto_select_all', 'onKeyUp', 'auto_validation',
		'trailing_auto_tabindex'
	])
	const [wrapper_props, wrapper_props_other] = splitProps(props.attr_wrapper! ?? {}, ['class'])
	const [is_focus, set_is_focus] = createSignal<boolean>(false)
	const [is_invalid, set_is_invalid] = createSignal<boolean>(false)
	const [value, set_value] = createSignal<string>('')
	const is_show_clear_button = createMemo(() => props.auto_show_clear_button && string_length(value()) > 0)
	const trailing = children(() => props.trailing)
	const leading = children(() => props.leading)
	const message = children(() => props.message)
	const button_clear_id = createUniqueId()
	let textfield_ref: HTMLInputElement
	let stop_focus: boolean = false

	createEffect(() => {
		const value = props.value
		set_value(v => `${value ?? v}`)
	})

	const TrailingContent: VoidComponent = () => {
		return (<Tooltip>
			{trailing()}
			<Show when={is_show_clear_button()}>
				<TextFieldButton
					data-tooltip={props.tooltip_clear ?? 'Clear'}
					type={'button'}
					id={button_clear_id}>
					<Icon code={0xE5E9}/>
				</TextFieldButton>
			</Show>
		</Tooltip>)
	}

	return (<div
		class={classlist('c-textfield', wrapper_props.class ?? '')}
		{...wrapper_props_other}>
		<div
			data-c-focused={attr_set_if_exist(props.focused ?? is_focus())}
			data-c-invalid={attr_set_if_exist(!props.disabled && props.auto_validation && is_invalid())}
			data-c-disabled={attr_set_if_exist(props.disabled)}
			data-c-trailing={attr_set_if_exist(trailing() || (props.auto_show_clear_button && string_length(value()) > 0))}
			data-c-readonly={attr_set_if_exist(props.readOnly)}
			onClick={() => {
				if (stop_focus) return stop_focus = false

				element_focus(textfield_ref)
			}}>
			<Show when={!(props.auto_hide_label && string_length(value()) == 0 && !props.placeholder)}>
				<label class='c-textfield-label' for={props.id}>{props.label}</label>
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
					const self = event_current_target(ev)
					set_value(self.value)
					set_is_invalid(!self.checkValidity())
					event_call(ev, props.onInput)
				}}
				onFocus={(ev) => {
					const self = event_current_target(ev)
					set_value(self.value)
					set_is_invalid(!self.checkValidity())
					set_is_focus(true)
					event_call(ev, props.onFocus)
					if (props.auto_select_all) self.setSelectionRange(0, string_length(self.value))
				}}
				onKeyUp={ev => {
					if (ev.key == 'Enter') element_blur(event_current_target(ev))
					event_call(ev, props.onKeyUp)
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
				placeholder={props.placeholder ?? (props.auto_hide_label && props.label? `${props.label}` : undefined)}
				{...other}
			/>
			<Show when={trailing() || is_show_clear_button()}>
				<div
					class='c-textfield-trailing'
					onClick={ev => {
						stop_focus = true
						if (event_target(ev).id == button_clear_id) {
							change_textfield_value(textfield_ref, '')
							event_prevent_default(ev)
							element_focus(textfield_ref)
						}
					}}>
					<Show
						when={props.trailing_auto_tabindex}
						fallback={<TrailingContent />}>
						<FocusableGroup arrow_options={{left: 'prev', right: 'next'}}>
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
	integer_only?: boolean
	tooltip_decrease?: string
	tooltip_increase?: string
	tooltip_change_value?: string
	auto_fix_on_blur?: boolean
	attr_actions?: ModalProps
	on_input_as_number?(ev: InputEvent & {currentTarget: HTMLInputElement; target: HTMLInputElement}, value: number): unknown
}
const NumberTextField: VoidComponent<NumberTextFieldProps> = ($props) => {
	const $$props = mergeProps({
		tooltip_increase: 'Increase',
		tooltip_decrease: 'Decrease',
		tooltip_change_value: 'Change value',
		auto_fix_on_blur: true
	}, $props)
	const [props, other] = splitProps($$props, [
		'max', 'min', 'trailing', 'auto_show_clear_button', 'onBlur',
		'value', 'ref', 'focused', 'attr_wrapper',
		'tooltip_decrease', 'tooltip_increase', 'tooltip_change_value',
		'tooltip_clear', 'disabled', 'integer_only', 'auto_fix_on_blur',
		'attr_actions', 'on_input_as_number', 'onInput'
	])
	const [wrapper_props, wrapper_props_other] = splitProps(
		props.attr_wrapper! ?? {},
		['classList']
	)
	const [actions_props, actions_props_other] = splitProps(
		props.attr_actions! ?? {},
		['ref', 'classList', 'on_toggle_open']
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

		if (is_string(max)) v = number_parse(max as string, props.integer_only)
		else if (is_number(max)) v = max as number
		return props.integer_only? math_round(v) : v
	}

	function get_min(default_number?: number): number {
		const min = props.min
		let v: number = default_number ?? value()

		if (is_string(min)) v = number_parse(min as string, props.integer_only)
		else if (is_number(min)) v = min as number
		return props.integer_only? math_round(v) : v
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
		if (props.integer_only) n = math_round(n)

		set_value(n)
		change_textfield_value(numbertextfield_ref, `${n}`)
	}

	function on_press_start(operator: '+' | '-'): void {
		if (timeout_id != null) timeout_clear(timeout_id)

		timeout_id = timeout_set(() => {
			if (interval_id != null) interval_clear(interval_id)
			interval_id = interval_set(() => change_value(operator), 30)
			timeout_id = null
		}, 300)
	}

	function on_press_end(operator: '+' | '-'): void {
		if (interval_id != null) interval_clear(interval_id)
		if (timeout_id != null) timeout_clear(timeout_id)
		interval_id = timeout_id = null
		change_value(operator)
	}

	function fix_input_number(): void {
		let n = number_safe(
			number_parse(numbertextfield_ref.value, props.integer_only),
			value()
		)

		n = math_clamp(n, get_min(n), get_max(n))
		if (props.integer_only) n = math_round(n)

		set_value(n)
		change_textfield_value(numbertextfield_ref, string_touppercase(`${n}`))
	}

	createEffect(() => {
		let v = number_parse(`${props.value}`)
		if (number_is_not_defined(v)) return;

		const integer_only = props.integer_only
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
			focused={props.focused ?? (is_modal_actions_open()? true : undefined)}
			disabled={props.disabled}
			ref={mergeRefs(props.ref, r => numbertextfield_ref = r)}
			value={value()}
			attr_wrapper={{
				classList: {
					'c-number-textfield': true,
					...wrapper_props.classList
				},
				...wrapper_props_other
			}}
			onBlur={ev => {
				if (props.auto_fix_on_blur) fix_input_number()
				event_call(ev, props.onBlur)
			}}
			onInput={ev => {
				if (props.on_input_as_number){
					let n = number_parse(numbertextfield_ref.value, props.integer_only)
					n = number_safe(n, value())
					n = math_clamp(n, get_min(n), get_max(n))
					if (props.integer_only) n = math_round(n)
					props.on_input_as_number(ev, n)
				}
				event_call(ev, props.onInput)
			}}
			type='number'
			trailing={<>
				{ props.trailing }
				<Show when={!props.disabled}>
					<TextFieldButton
						data-tooltip={props.tooltip_change_value}
						onClick={(ev) => open_menu(
							ev,
							modal_actions_ref,
							{
								position: MenuPosition.center_center_left,
								anchor: event_current_target(ev)
							})
						}>
						<Icon code={0xE406}/>
					</TextFieldButton>
				</Show>
				<Show when={props.auto_show_clear_button && value() != 0}>
					<TextFieldButton data-tooltip={props.tooltip_clear ?? 'Clear'} onClick={(_ev) => {
						let v = math_clamp(0, get_min(), get_max())
						if (props.integer_only) v = math_round(v)

						numbertextfield_ref.value = `${v}`
						set_value(v)
					}}><Icon code={0xE5E9}/></TextFieldButton>
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
			on_toggle_open={(is_open) => {
				actions_props.on_toggle_open?.(is_open)
				set_is_modal_actions_open(is_open)

				// I don't remember why I need this
				if (!is_open) {
					element_focus(numbertextfield_ref)
					element_blur(numbertextfield_ref)
				}
			}}
			{...actions_props_other}>
			<Tooltip>
				<IconButton
					data-tooltip={props.tooltip_increase}
					ref={r => iconbutton_up_ref = r}
					disabled={props.max != null && value() >= get_max()}
					onPointerUp={() => on_press_end('+')}
					onPointerDown={() => on_press_start('+')}
					onContextMenu={(ev) => event_prevent_default(ev)}
					onKeyDown={ev => {
						const code = ev.code
						const clickKey = code == 'Enter' || code == 'Space'
						const updownKey = code == 'ArrowDown' || code == 'ArrowUp'
						if (clickKey) on_press_start('+')
						if (updownKey && !iconbutton_down_ref.disabled) element_focus(iconbutton_down_ref)
					}}
					onKeyUp={ev => (ev.code == 'Enter' || ev.code == 'Space') && on_press_end('+')}
					code={0xE404}
				/>
				<IconButton
					data-tooltip={props.tooltip_decrease}
					ref={r => iconbutton_down_ref = r}
					disabled={props.min != null && value() <= get_min()}
					onPointerUp={() => on_press_end('-')}
					onPointerDown={() => on_press_start('-')}
					onContextMenu={(ev) => event_prevent_default(ev)}
					onKeyDown={ev => {
						const code = ev.code
						const clickKey = code == 'Enter' || code == 'Space'
						const updownKey = code == 'ArrowDown' || code == 'ArrowUp'
						if (clickKey) on_press_start('-')
						if (updownKey && !iconbutton_up_ref.disabled) element_focus(iconbutton_up_ref)
					}}
					onKeyUp={ev => (ev.code == 'Enter' || ev.code == 'Space') && on_press_end('-')}
					code={0xE3FC}
				/>
			</Tooltip>
		</Modal>
	</>)
}

type SearchTextFieldProps = TextFieldProps & {
	result?: JSX.Element
	attr_menu?: Omit<PopoverProps, 'style'> & {
		style?: JSX.CSSProperties
	}
}
const SearchTextField: VoidComponent<SearchTextFieldProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'result', 'attr_wrapper', 'attr_menu', 'onFocus'
	])
	const [wrapper_props, wrapper_props_other] = splitProps(
		props.attr_wrapper! ?? {},
		['ref', 'classList']
	)
	const [menu_props, menu_props_other] = splitProps(
		props.attr_menu! ?? {},
		['use_portal', 'ref', 'classList', 'style', 'on_toggle_open']
	)
	const [width, set_width] = createSignal<number>(0)
	const result = children(() => props.result)
	let is_popover_open: boolean = false
	let is_focus = false
	let event: FocusEvent
	let wrapper_ref: HTMLDivElement
	let menu_ref: HTMLDivElement

	function $open_popover(ev: Event): void {
		if (is_popover_open) return;

		if (is_array(result()) && array_length(result() as unknown[]) == 0) return;

		set_width(rect_width(element_rect(wrapper_ref)))
		open_popover(ev, menu_ref, {
			allow_hide_anchor: false,
			anchor: wrapper_ref,
			position: SearchMenuPosition.center_bottom,
			manual_dismiss: true,
		})
	}

	function resize_observer(): void {
		let t: number | null = null
		const observer = new ResizeObserver(() => {
			if (t != null) timeout_clear(t)

			t = timeout_set(() => {
				set_width(rect_width(element_rect(wrapper_ref)))
				reposition_popover(menu_ref)
				t = null
			}, 300)
		})
		observer.observe(wrapper_ref, { box: "border-box" })

		onCleanup(() => {
			observer.disconnect()
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
		resize_observer()
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
			attr_wrapper={{
				ref: mergeRefs(wrapper_props.ref, r => wrapper_ref = r),
				classList: {
					'c-search-textfield': true,
					...wrapper_props.classList
				},
				...wrapper_props_other
			}}
			onFocus={ev => {
				$open_popover(ev)
				is_focus = is_focus
				event = ev
				event_call(ev, props.onFocus)
			}}
			{...other}
		/>
		<Popover
			use_portal={menu_props.use_portal ?? false}
			on_toggle_open={isOpen => {
				is_popover_open = isOpen
				menu_props.on_toggle_open?.(isOpen)
			}}
			ref={mergeRefs(menu_props.ref, r => menu_ref = r)}
			classList={{
				'c-search-textfield-menu': true,
				...menu_props.classList
			}}
			style={{
				'min-width': width() + 'px',
				...menu_props.style
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