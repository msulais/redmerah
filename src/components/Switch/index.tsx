import { createEffect, createMemo, createSignal, splitProps, type JSX, type ValidComponent, type VoidComponent } from "solid-js"
import { Dynamic, type DynamicProps } from "solid-js/web"

import type { ComponentEvent } from "@/types/event"
import { _checked, _class, _component, _currentTarget, _disabled, _divAttr, _labelAttr, _onChange, _onClick, _onValueChanged, _value, _wrapperAttr } from "@/constants/string"
import { toggleAttribute } from "@/utils/attributes"

import './index.scss'

type SwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
	onChange?(ev: ComponentEvent<Event, HTMLInputElement>): unknown
	labelAttr?: JSX.LabelHTMLAttributes<HTMLLabelElement>
}
const Switch: VoidComponent<SwitchProps> = ($props) => {
	const [props, other] = splitProps($props, [_labelAttr, _onChange])
	const [labelProps, otherLabelProps] = splitProps(props[_labelAttr] ?? {}, [_class])
	const [isChecked, setIsChecked] = createSignal<boolean>(false)
	const isDisabled = createMemo(() => other[_disabled] == true)

	createEffect(() => {
		const checked = other[_checked]
		setIsChecked(c => checked ?? c)
	})

	return (<label
		class={`switch${labelProps[_class] != null ? ` ${labelProps[_class]}` : ''}`}
		data-disabled={toggleAttribute(isDisabled())}
		data-checked={toggleAttribute(isChecked())}
		{...otherLabelProps}>
		<input
			type="checkbox"
			onChange={(ev) => {
				setIsChecked(ev[_currentTarget][_checked])
				if (props[_onChange]) props[_onChange](ev)
			}}
			{...other}
		/>
		<div/>
	</label>)
}

type RawSwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
	component?: ValidComponent
	onChange?(ev: ComponentEvent<Event, HTMLInputElement>): unknown
	wrapperAttr?: Omit<DynamicProps<keyof JSX.HTMLElementTags & keyof JSX.SVGElementTags>, 'component'>
}
const RawSwitch: VoidComponent<RawSwitchProps> = ($props) => {
	const [props, other] = splitProps($props, [_wrapperAttr, _onChange, _component])
	const [wrapperProps, otherWrapperProps] = splitProps(props[_wrapperAttr]! ?? {}, [_class])
	const [isChecked, setIsChecked] = createSignal<boolean>(false)
	const isDisabled = createMemo(() => other[_disabled] == true)

	createEffect(() => {
		const checked = other[_checked]
		setIsChecked(c => checked ?? c)
	})

	return (<Dynamic
		component={props[_component] ?? 'label'}
		class={`switch${wrapperProps[_class] != null ? ` ${wrapperProps[_class]}` : ''}`}
		data-disabled={toggleAttribute(isDisabled())}
		data-checked={toggleAttribute(isChecked())}
		{...otherWrapperProps}>
		<input
			type="checkbox"
			onChange={(ev) => {
				setIsChecked(ev[_currentTarget][_checked])
				if (props[_onChange]) props[_onChange](ev)
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