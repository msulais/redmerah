import { type JSX, splitProps, type VoidComponent } from "solid-js"

import { toggleAttribute } from '@/utils/attributes'
import { _children, _filled, _inline, _fromCharCode, _charCodeAt, _code, _emoji, _class } from "@/constants/string"

import './index.scss'

type EmojiProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
    inline?: boolean
    emoji: string
}

const Emoji: VoidComponent<EmojiProps> = ($props) => {
    const [props, other] = splitProps($props, [_inline, _emoji, _class])

    return (<i
        class={'emoji' + (props[_class]? ` ${props[_class]}` : '')}
        data-inline={toggleAttribute(props[_inline])}
        translate="no"
        {...other}>
        { props[_emoji] }
    </i>)
}

export {
    Emoji
}
export type {
    EmojiProps
}
export default Emoji