import { type JSX, splitProps, type VoidComponent } from "solid-js"

import { attrSetIfExist, attrClassList } from '@/utils/attributes'

import './index.scss'

type EmojiProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
	'c:inline'?: boolean
	'c:emoji': string
}

const Emoji: VoidComponent<EmojiProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c:inline', 'c:emoji', 'class', 'translate'
	])

	return (<i
		class={attrClassList('c-emoji', props.class)}
		data-c-inline={attrSetIfExist(props['c:inline'])}
		translate={props.translate ?? "no"}
		{...other}>
		{ props["c:emoji"] }
	</i>)
}

export {
	Emoji
}
export type {
	EmojiProps
}
export default Emoji