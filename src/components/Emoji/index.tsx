import { type JSX, splitProps, type VoidComponent } from "solid-js"

import { attr_set_if_exist, classlist } from '@/utils/attributes'

import './index.scss'

type EmojiProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
	c_inline?: boolean
	c_emoji: string
}

const Emoji: VoidComponent<EmojiProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'c_inline', 'c_emoji', 'class', 'translate'
	])

	return (<i
		class={classlist('c-emoji', props.class)}
		data-c-inline={attr_set_if_exist(props.c_inline)}
		translate={props.translate ?? "no"}
		{...other}>
		{ props.c_emoji }
	</i>)
}

export {
	Emoji
}
export type {
	EmojiProps
}
export default Emoji