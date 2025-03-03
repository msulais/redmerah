import { createEffect, createMemo, createSignal, createUniqueId, mergeProps, splitProps, type JSX, type ValidComponent, type VoidComponent } from "solid-js"
import { Dynamic, type DynamicProps } from "solid-js/web"

import { attrSetIfExist, attrClassList } from "@/utils/attributes"
import { eventCall } from "@/utils/event"

import './index.scss'

type SwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
	'c:attrLabel'?: Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'for'>
}

const Switch: VoidComponent<SwitchProps> = ($props) => {
	const $$props = mergeProps({id: createUniqueId()}, $props)
	const [props, other] = splitProps($$props, [
		'id', 'c:attrLabel', 'onChange'
	])
	const [labelProps, otherLabelProps] = splitProps(props['c:attrLabel'] ?? {}, ['class'])
	const [isChecked, setIsChecked] = createSignal<boolean>(false)
	const isDisabled = createMemo(() => other.disabled == true)

	createEffect(() => {
		const checked = other.checked
		setIsChecked(c => checked ?? c)
	})

	return (<label
		class={attrClassList('c-switch', labelProps.class ?? '')}
		data-c-disabled={attrSetIfExist(isDisabled())}
		data-c-checked={attrSetIfExist(isChecked())}
		for={props.id}
		{...otherLabelProps}>
		<input
			type="checkbox"
			id={props.id}
			onChange={(ev) => {
				eventCall(ev, props.onChange)
				setIsChecked(ev.currentTarget.checked)
			}}
			{...other}
		/>
		<div/>
	</label>)
}

type RawSwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
	component?: ValidComponent
	'c:attrWrapper'?: Omit<DynamicProps<keyof JSX.HTMLElementTags & keyof JSX.SVGElementTags>, 'component'>
}
const RawSwitch: VoidComponent<RawSwitchProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c:attrWrapper', 'onChange', 'component'
	])
	const [wrapperProps, otherWrapperProps] = splitProps(props['c:attrWrapper']! ?? {}, ['class'])
	const [isChecked, setIsChecked] = createSignal<boolean>(false)
	const isDisabled = createMemo(() => other.disabled == true)

	createEffect(() => {
		const checked = other.checked
		setIsChecked(c => checked ?? c)
	})

	return (<Dynamic
		component={props.component ?? 'label'}
		class={attrClassList('c-switch', wrapperProps.class ?? '')}
		data-c-disabled={attrSetIfExist(isDisabled())}
		data-c-checked={attrSetIfExist(isChecked())}
		{...otherWrapperProps}>
		<input
			type="checkbox"
			onChange={(ev) => {
				eventCall(ev, props.onChange)
				setIsChecked(ev.currentTarget.checked)
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