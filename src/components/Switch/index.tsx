import { createEffect, createMemo, createSignal, createUniqueId, mergeProps, splitProps, type JSX, type ValidComponent, type VoidComponent } from "solid-js"
import { Dynamic, type DynamicProps } from "solid-js/web"

import { attr_set_if_exist, classlist } from "@/utils/attributes"
import { event_call, event_current_target } from "@/utils/event"

import './index.scss'

type SwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
	c_attr_label?: Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'for'>
}

const Switch: VoidComponent<SwitchProps> = ($props) => {
	const [props, other] = splitProps(
		mergeProps({id: createUniqueId()}, $props),
		['id', 'c_attr_label', 'onChange']
	)
	const [label_props, other_label_props] = splitProps(props.c_attr_label ?? {}, ['class'])
	const [is_checked, set_is_checked] = createSignal<boolean>(false)
	const is_disabled = createMemo(() => other.disabled == true)

	createEffect(() => {
		const checked = other.checked
		set_is_checked(c => checked ?? c)
	})

	return (<label
		class={classlist('c-switch', label_props.class ?? '')}
		data-c-disabled={attr_set_if_exist(is_disabled())}
		data-c-checked={attr_set_if_exist(is_checked())}
		for={props.id}
		{...other_label_props}>
		<input
			type="checkbox"
			id={props.id}
			onChange={(ev) => {
				event_call(ev, props.onChange)
				set_is_checked(event_current_target(ev).checked)
			}}
			{...other}
		/>
		<div/>
	</label>)
}

type RawSwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
	component?: ValidComponent
	c_attr_wrapper?: Omit<DynamicProps<keyof JSX.HTMLElementTags & keyof JSX.SVGElementTags>, 'component'>
}
const RawSwitch: VoidComponent<RawSwitchProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_attr_wrapper', 'onChange', 'component'
	])
	const [wrapper_props, other_wrapper_props] = splitProps(props.c_attr_wrapper! ?? {}, ['class'])
	const [is_checked, set_is_checked] = createSignal<boolean>(false)
	const is_disabled = createMemo(() => other.disabled == true)

	createEffect(() => {
		const checked = other.checked
		set_is_checked(c => checked ?? c)
	})

	return (<Dynamic
		component={props.component ?? 'label'}
		class={classlist('c-switch', wrapper_props.class ?? '')}
		data-c-disabled={attr_set_if_exist(is_disabled())}
		data-c-checked={attr_set_if_exist(is_checked())}
		{...other_wrapper_props}>
		<input
			type="checkbox"
			onChange={(ev) => {
				event_call(ev, props.onChange)
				set_is_checked(event_current_target(ev).checked)
			}}
			{...other}
		/>
		<div/>
	</Dynamic>)
}

export {
	Switch,
	RawSwitch
}
export type {
	SwitchProps,
	RawSwitchProps
}
export default Switch