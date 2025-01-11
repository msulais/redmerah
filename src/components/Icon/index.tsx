import { type JSX, splitProps, type VoidComponent } from "solid-js"

import { attr_set_if_exist, classlist } from '@/utils/attributes'

import './index.scss'

type IconProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
	c_filled?: boolean
	c_inline?: boolean
	c_code: number
}

const Icon: VoidComponent<IconProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_filled', 'c_inline', 'c_code',
		'class', 'translate'
	])

	return (<i
		class={classlist('c-icon', props.class)}
		data-c-inline={attr_set_if_exist(props.c_inline)}
		translate={props.translate ?? "no"}
		{...other}>
		{ String.fromCharCode(props.c_code - (props.c_filled? 1 : 0)) }
	</i>)
}

export {
	Icon
}
export type {
	IconProps
}
export default Icon