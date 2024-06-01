import { type Component, type JSX, Show, splitProps } from "solid-js"

import { toggleAttribute } from '@/utils/attributes'
import { _children, _filled, _inline, _fromCharCode, _charCodeAt } from "@/data/string"

import './index.scss'

type IconProps = JSX.HTMLAttributes<HTMLElement> & {
    children: string | JSX.Element
    filled?: boolean
    inline?: boolean
}

const Icon: Component<IconProps> = ($props) => {
    const [props, other] = splitProps($props, [_children, _filled, _inline])

    return (<i 
        class='icon' 
        data-inline={toggleAttribute(props[_inline])} 
        {...other}>
        <Show 
            fallback={props[_children]} 
            when={ props[_filled] }>
            { String[_fromCharCode](`${props[_children]}`[_charCodeAt](0) - 1) }
        </Show>
    </i>)
}

export default Icon