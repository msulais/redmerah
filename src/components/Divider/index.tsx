import { splitProps, type Component, type JSX } from "solid-js"

import { attr_set_if_exist, classlist } from "@/utils/attributes"

import './index.scss'

type DividerProps = JSX.HTMLAttributes<HTMLDivElement> & {
	c_vertical?: boolean
}
const Divider: Component<DividerProps> = ($props) => {
	const [props, other] = splitProps($props, ['class', 'c_vertical'])

	return (<div
		data-c-vertical={attr_set_if_exist(props.c_vertical)}
		class={classlist('c-divider', props.class)}
		{...other}
	/>)
}

export {
	Divider
}
export type {
	DividerProps
}
export default Divider