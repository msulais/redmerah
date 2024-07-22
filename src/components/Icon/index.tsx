import { type JSX, Show, splitProps, type VoidComponent } from "solid-js"

import { toggleAttribute } from '@/utils/attributes'
import { _children, _filled, _inline, _fromCharCode, _charCodeAt, _code } from "@/data/string"

import './index.scss'

type IconProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> & {
    filled?: boolean
    inline?: boolean
    code: number
}

const Icon: VoidComponent<IconProps> = ($props) => {
    const [props, other] = splitProps($props, [_filled, _inline, _code])

    return (<i 
        class='icon' 
        data-inline={toggleAttribute(props[_inline])} 
        translate="no"
        {...other}>
        { String[_fromCharCode](props[_code] - (props[_filled]? 1 : 0)) }
    </i>)
}

export default Icon