import { type JSX, splitProps, type VoidComponent } from "solid-js"

import { attr_set_if_exist } from '@/utils/attributes'

import './index.scss'

type IconProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
	filled?: boolean
	inline?: boolean
	code: number
}

const Icon: VoidComponent<IconProps> = ($props) => {
	const [props, other] = splitProps($props, ['filled', 'inline', 'code'])

	return (<i
		class='c-icon'
		data-c-inline={attr_set_if_exist(props.inline)}
		translate="no"
		{...other}>
		{ String.fromCharCode(props.code - (props.filled? 1 : 0)) }
	</i>)
}

export {
	Icon
}
export type {
	IconProps
}
export default Icon