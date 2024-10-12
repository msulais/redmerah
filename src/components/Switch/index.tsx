import { createEffect, createMemo, createSignal, splitProps, type JSX, type ValidComponent, type VoidComponent } from "solid-js"
import { Dynamic, type DynamicProps } from "solid-js/web"

import { _checked, _class, _component, _currentTarget, _disabled, _divAttr, _labelAttr, _onChange, _onClick, _onValueChanged, _value, _wrapperAttr } from "@/constants/string"
import { toggleAttribute } from "@/utils/attributes"
import { callEventHandler } from "@/utils/event"

import './index.scss'

type SwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
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
				callEventHandler(ev, props[_onChange])
			}}
			{...other}
		/>
		<div/>
	</label>)
}

type RawSwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
	component?: ValidComponent
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
				callEventHandler(ev, props[_onChange])
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