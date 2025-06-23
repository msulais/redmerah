import { type JSX, splitProps, type VoidComponent } from "solid-js"

import { setAttrIfExist, joinClassList } from '@/utils/attributes'

import './index.scss'

type IconProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
	'c:filled'?: boolean
	'c:inline'?: boolean
	'c:code': number
}

const Icon: VoidComponent<IconProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c:filled', 'c:inline', 'c:code',
		'class', 'translate'
	])

	return (<i
		class={joinClassList('c-icon', props.class)}
		data-c-inline={setAttrIfExist(props['c:inline'])}
		translate={props.translate ?? "no"}
		{...other}>
		{ String.fromCharCode(props['c:code'] - (props['c:filled']? 1 : 0)) }
	</i>)
}

export {
	Icon
}
export type {
	IconProps
}
export default Icon