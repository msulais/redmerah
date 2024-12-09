import { type JSX, splitProps, type VoidComponent } from "solid-js"

import { attr_set_if_exist, classlist } from '@/utils/attributes'

import './index.scss'

type EmojiProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
	inline?: boolean
	emoji: string
}

const Emoji: VoidComponent<EmojiProps> = ($props) => {
	const [props, other] = splitProps($props, ['inline', 'emoji', 'class'])

	return (<i
		class={classlist('c-emoji', props.class)}
		data-c-inline={attr_set_if_exist(props.inline)}
		translate="no"
		{...other}>
		{ props.emoji }
	</i>)
}

export {
	Emoji
}
export type {
	EmojiProps
}
export default Emoji