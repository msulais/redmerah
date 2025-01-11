import { createEffect, createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, splitProps, type JSX, type ParentComponent } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import { AnimationEffectTiming } from "@/enums/animation"
import { attr_set_if_exist, classlist } from "@/utils/attributes"
import { element_animate, element_dispatch_event, element_is_same_node, element_all_by_selector } from "@/utils/element"
import { event_add_listener, event_call, event_current_target, event_remove_listener } from "@/utils/event"
import { promise_done } from "@/utils/object"

import Icon, { type IconProps } from "@/components/Icon"
import '@/components/Button/index.scss'
import './index.scss'

enum CheckBoxEvents {
	/** @param {HTMLInputElement} el `HTMLInputElement` */
	changestate = 'custom:checkbox-changestate'
}

enum CheckBoxVariant {
	radio,
	check
}

type CheckBoxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
	c_variant?: CheckBoxVariant
	c_attr_label?: Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'for'>
	c_attr_icon?: IconProps
}

const CheckBox: ParentComponent<CheckBoxProps> = ($props) => {
	const animation_options = {
		duration: 150,
		easing: AnimationEffectTiming.spring
	}
	const [props, other] = splitProps(
		mergeProps({
			c_variant: CheckBoxVariant.check,
			id: createUniqueId()
		}, $props),
		[
			'c_variant', 'children', 'c_attr_label',
			'c_attr_icon', 'onChange', 'ref', 'id'
		]
	)
	const [label_props, other_label_props] = splitProps(props.c_attr_label ?? {}, ['class'])
	const [icon_props, other_icon_props] = splitProps(props.c_attr_icon! ?? {}, ['ref', 'c_filled', 'c_code'])
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
			CheckBoxEvents.changestate,
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
			CheckBoxEvents.changestate,
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
			type={props.c_variant == CheckBoxVariant.radio? 'radio' : 'checkbox'}
			id={props.id}
			onChange={(ev) => {
				const is_checked = event_current_target(ev).checked
				event_call(ev, props.onChange)

				if (props.c_variant == CheckBoxVariant.radio && other.name != null) {
					const getAllRadioWithSameName = element_all_by_selector(`input[type=radio][name=${CSS.escape(other.name)}]`)
					for (const el of getAllRadioWithSameName) element_dispatch_event(el as HTMLElement, new CustomEvent(
						CheckBoxEvents.changestate,
						{detail: input_ref}
					))
				}

				change_checked_state(is_checked)
			}}
			{...other}
		/>
		<Icon
			ref={mergeRefs(icon_props.ref, r => icon_ref = r)}
			c_code={icon_props.c_code ?? (props.c_variant == CheckBoxVariant.check? (is_checked()? 0xE3CB : 0xE3D4) : 0xED2F)}
			c_filled={icon_props.c_filled ?? (props.c_variant != CheckBoxVariant.check && is_checked())}
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