import { children, mergeProps, Show, splitProps, type JSX, type ParentComponent } from "solid-js";

import { _checked, _children, _classList, _filledTonal, _focus, _iconOnly, _indent, _indicatorPosition, _leading, _left, _selected, _trailing } from "@/data/string"
import { toggleAttribute } from "@/utils/attributes";
import { isVarHasValue } from "@/utils/data";
import { Position } from "@/enums/position"

import Button, { ButtonVariant } from "@/components/Button";
import './index.scss'

type SideNavigationProps = JSX.HTMLAttributes<HTMLDivElement>

type SideNavigationItemProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    leading?: JSX.Element
    trailing?: JSX.Element
    selected?: boolean
    iconOnly?: boolean
}

export const SideNavigationItem: ParentComponent<SideNavigationItemProps> = ($props) => {
    const [props, other] = splitProps($props, [_selected, _leading, _children, _trailing, _classList, _iconOnly])
    const trailingComponent = children(() => props[_trailing])

    return (<Button 
        variant={props[_selected]? ButtonVariant[_filledTonal] : undefined} 
        selected={props[_selected]} 
        indicatorPosition={isVarHasValue(props[_selected])? Position[_left] : undefined} 
        disableScale={trailingComponent()? true : undefined} 
        iconOnly={props[_iconOnly]}
        data-trailing={toggleAttribute(trailingComponent())}
        classList={{'side-navigation-item': true, ...props[_classList]}} 
        {...other}>
        { props[_leading] }
        <Show when={!props[_iconOnly]}>
            { props[_children] }
            <Show when={trailingComponent()}>
                <div style={{flex: 1}} />
            </Show>
            { trailingComponent() }
        </Show>
    </Button>)
}

const SideNavigation: ParentComponent<SideNavigationProps> = ($props) => {
    const [props, other] = splitProps($props, [_children])

    return (<div class="side-navigation" {...other}>
        {props[_children]}
    </div>)
}

export default SideNavigation