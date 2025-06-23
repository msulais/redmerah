import { splitProps, type Component, type JSX } from "solid-js"

import { setAttrIfExist, joinClassList } from "@/utils/attributes"

import './index.scss'

type DividerProps = JSX.HTMLAttributes<HTMLDivElement> & {
	'c:vertical'?: boolean
}
const Divider: Component<DividerProps> = ($props) => {
	const [props, other] = splitProps($props, ['class', 'c:vertical'])

	return (<div
		data-c-vertical={setAttrIfExist(props['c:vertical'])}
		class={joinClassList('c-divider', props.class)}
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