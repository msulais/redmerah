import { type JSX, type ParentComponent, splitProps } from "solid-js"

import { toggleAttribute } from '@/utils/attributes'
import { _leading, _children, _trailing, _subtitle, _compact } from "@/data/string"

import './index.scss'

type ListProps = JSX.HTMLAttributes<HTMLDivElement> & {
    leading?: JSX.Element
    subtitle?: JSX.Element
    trailing?: JSX.Element
    compact?: boolean
}

const List: ParentComponent<ListProps> = ($props) => {
    const [props, other] = splitProps($props, [_leading, _children, _trailing, _subtitle, _compact])
    
    return (<div 
        class='list' 
        data-compact={toggleAttribute(props[_compact])} 
        {...other}>
        <div class='list-leading'>{props[_leading]}</div>
        <div class='list-content'>
            <div class='list-title'>{props[_children]}</div>
            <div class='list-subtitle'>{props[_subtitle]}</div>
        </div>
        <div class='list-trailing'>{props[_trailing]}</div>
    </div>)
}

export default List