import { type JSX, splitProps, type VoidComponent } from "solid-js"

import { setElementAttributeIfExist } from '@/utils/attributes'
import { _children, _filled, _inline, _fromCharCode, _charCodeAt, _code } from "@/constants/string"

import './index.scss'

type IconProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
	filled?: boolean
	inline?: boolean
	code: number
}

const Icon: VoidComponent<IconProps> = ($props) => {
	const [props, other] = splitProps($props, [_filled, _inline, _code])

	return (<i
		class='c-icon'
		data-c-inline={setElementAttributeIfExist(props[_inline])}
		translate="no"
		{...other}>
		{ String[_fromCharCode](props[_code] - (props[_filled]? 1 : 0)) }
	</i>)
}

export {
	Icon
}
export type {
	IconProps
}
export default Icon