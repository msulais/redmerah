import { createEffect, createSignal, splitProps, type JSX, type VoidComponent } from "solid-js"

import './index.scss'
import { toggleAttribute } from "@/utils/attributes"
import { _class, _onClick, _onValueChanged, _value } from "@/constants/string"
import type { ComponentEvent } from "@/types/event"

type SwitchProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'value'> & {
	value?: boolean
	onValueChanged?: (isChecked: boolean) => unknown
	onClick?: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>) => unknown
}

const Switch: VoidComponent<SwitchProps> = ($props) => {
	const [props, other] = splitProps($props, [_value, _onValueChanged, _class, _onClick])
	const [isChecked, setIsChecked] = createSignal<boolean>(false)

	createEffect(() => {
		const value = props[_value]

		if (value == null) return;
		setIsChecked(value)
	})

	return (<button
		class={"switch" + (props[_class] != null? ` ${props[_class]}` : '')}
		data-checked={toggleAttribute(isChecked())}
		onClick={(ev) => {
			setIsChecked(c => !c)
			if (props[_onValueChanged]) props[_onValueChanged](isChecked())
			if (props[_onClick]) props[_onClick](ev)
		}}
		{...other}>
		<div />
	</button>)
}

export {
	Switch
}
export type {
	SwitchProps
}
export default Switch