import { splitProps, type Component, type JSX } from "solid-js"

import { _class, _vertical } from "@/constants/string"
import { toggleAttribute } from "@/utils/attributes"

import './index.scss'

type DividerProps = JSX.HTMLAttributes<HTMLDivElement> & {
    vertical?: boolean
}
const Divider: Component<DividerProps> = ($props) => {
    const [props, other] = splitProps($props, [_class, _vertical])

    return (<div
        data-vertical={toggleAttribute(props[_vertical])}
        class={"divider" + (props[_class]? ` ${props[_class]}` : '')}
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