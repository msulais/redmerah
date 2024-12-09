import { createEffect, createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, splitProps, type JSX, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { AnimationEffectTiming } from "@/enums/animation"
import { attr_set_if_exist, classlist } from "@/utils/attributes"
import { element_animate, element_dispatch_event, element_is_same_node, get_multiple_element_by_selector } from "@/utils/element"
import { event_add_listener, call_event_handler, event_remove_listener } from "@/utils/event"
import { promise_done } from "@/utils/object"

import Icon, { type IconProps } from "@/components/Icon"
import '@/components/Button/index.scss'
import './index.scss'

enum CheckBoxEvents {
	/** @param {HTMLInputElement} el `HTMLInputElement` */
	on_change_radio_state = 'on-change-radio-off'
}

enum CheckBoxVariant {
	radio,
	check
}

type CheckBoxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
	variant?: CheckBoxVariant
	attr_label?: Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'for'>
	attr_icon?: IconProps
}

const CheckBox: ParentComponent<CheckBoxProps> = ($props) => {
	const animation_options = {
		duration: 150,
		easing: AnimationEffectTiming.spring
	}
	const [props, other] = splitProps(
		mergeProps({
			variant: CheckBoxVariant.check,
			id: createUniqueId()
		}, $props),
		[
			'variant', 'children', 'attr_label',
			'attr_icon', 'onChange', 'ref', 'id'
		]
	)
	const [label_props, other_label_props] = splitProps(props.attr_label ?? {}, ['class'])
	const [icon_props, other_icon_props] = splitProps(props.attr_icon! ?? {}, ['ref', 'filled', 'code'])
	const [is_checked, set_is_checked] = createSignal<boolean>(false)
	const is_disabled = createMemo(() => other.disabled == true)
	let $is_checked: boolean = false
	let is_mounted: boolean = false
	let icon_ref: HTMLElement
	let input_ref: HTMLInputElement
	let animation: Animation | null = null

	function change_checked_state(checked: boolean): void {
		if (animation != null) animation.cancel()

		animation = element_animate(icon_ref, {scale: [1, 0]}, animation_options)
		promise_done(animation.finished, () => {
			$is_checked = checked
			set_is_checked(checked)
			animation = element_animate(icon_ref, {scale: [0, 1]}, animation_options)
			promise_done(
				animation.finished,
				() => animation = null,
				() => {}
			)
		}, () => {})
	}

	function on_change_radio_off(ev: CustomEvent<HTMLInputElement>): void {
		if (element_is_same_node(ev.detail, input_ref) || !is_checked()) return
		change_checked_state(input_ref.checked)
	}

	onMount(() => {
		event_add_listener<CustomEvent<HTMLInputElement>>(
			input_ref,
			CheckBoxEvents.on_change_radio_state,
			on_change_radio_off
		)
	})

	createEffect(() => {
		$is_checked = other.checked ?? $is_checked
		if (!is_mounted) {
			set_is_checked(c => $is_checked ?? c)
			is_mounted = true
			return
		}
		if (
			$is_checked == null
			|| $is_checked == is_checked()
		) return;

		change_checked_state($is_checked)
	})

	onCleanup(() => {
		event_remove_listener<CustomEvent<HTMLInputElement>>(
			input_ref,
			CheckBoxEvents.on_change_radio_state,
			on_change_radio_off
		)
	})

	return (<label
		class={classlist('c-checkbox', 'c-btn', label_props.class ?? '')}
		data-c-disabled={attr_set_if_exist(is_disabled())}
		for={props.id}
		{...other_label_props}>
		<input
			ref={mergeRefs(props.ref, el => input_ref = el)}
			type={props.variant == CheckBoxVariant.radio? 'radio' : 'checkbox'}
			id={props.id}
			onChange={(ev) => {
				const is_checked = ev.currentTarget.checked
				call_event_handler(ev, props.onChange)

				if (props.variant == CheckBoxVariant.radio && other.name != null) {
					const getAllRadioWithSameName = get_multiple_element_by_selector(`input[type=radio][name]`)
					for (const el of getAllRadioWithSameName) element_dispatch_event(el as HTMLElement, new CustomEvent(
						CheckBoxEvents.on_change_radio_state,
						{detail: input_ref}
					))
				}

				change_checked_state(is_checked)
			}}
			{...other}
		/>
		<Icon
			ref={mergeRefs(icon_props.ref, r => icon_ref = r)}
			code={icon_props.code ?? (props.variant == CheckBoxVariant.check? (is_checked()? 0xE3CB : 0xE3D4) : 0xED2F)}
			filled={icon_props.filled ?? (props.variant != CheckBoxVariant.check && is_checked())}
			{...other_icon_props}
		/>
		{props.children}
	</label>)
}

export {
	CheckBox,
	CheckBoxEvents,
	CheckBoxVariant
}
export type {
	CheckBoxProps
}
export default CheckBox