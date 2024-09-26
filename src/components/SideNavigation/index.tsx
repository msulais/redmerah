import { children, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { _checked, _children, _classList, _disableScale, _expand, _tonal, _focus, _footer, _header, _iconCode, _iconOnly, _indent, _indicatorPosition, _leading, _left, _selected, _trailing, _variant, _class } from "@/constants/string"
import { toggleAttribute } from "@/utils/attributes"

import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, type ButtonProps } from "@/components/Button"
import './index.scss'

type SideNavigationItemProps = ButtonProps & {
    leading?: JSX.Element
    trailing?: JSX.Element
    iconCode?: number
    iconOnly?: boolean
}
const SideNavigationItem: ParentComponent<SideNavigationItemProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _indicatorPosition, _selected, _leading, _children,
        _trailing, _classList, _iconCode, _iconOnly,
        _variant, _disableScale
    ])
    const trailingComponent = children(() => props[_trailing])

    return (<Button
        variant={props[_variant] ?? (props[_selected]? ButtonVariant[_tonal] : undefined)}
        indicatorPosition={props[_indicatorPosition] ?? ButtonIndicatorPosition[_left]}
        selected={props[_selected]}
        disableScale={props[_disableScale] ?? (trailingComponent()? true : undefined)}
        data-trailing={toggleAttribute(trailingComponent())}
        classList={{
            'side-navigation-item': true,
            'icon-btn': props[_iconOnly] ?? false,
            ...props[_classList]
        }}
        {...other}>
        <Show when={props[_iconCode] != null}>
            <Icon
                style={{color: props[_selected]? 'rgb(var(--color-accent))' : undefined}}
                filled={props[_selected]}
                code={props[_iconCode]!}
            />
        </Show>
        { props[_leading] }
        <Show when={!props[_iconOnly]}>
            <span class="side-navigation-item-text">{ props[_children] }</span>
            <Show when={trailingComponent()}>
                <div style={{flex: 1}} />
            </Show>
            { trailingComponent() }
        </Show>
    </Button>)
}

type SideNavigationProps = JSX.HTMLAttributes<HTMLDivElement> & {
    header?: JSX.Element
    footer?: JSX.Element
    expand?: boolean
}
const SideNavigation: ParentComponent<SideNavigationProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _children, _expand, _header, _footer,
        _class
    ])

    return (<div class={"side-navigation" + (props[_class] != undefined ? ` ${props[_class]}` : '')} data-expand={toggleAttribute(props[_expand])} {...other}>
        <div class="side-navigation-header">{props[_header]}</div>
        <div class="side-navigation-content">{props[_children]}</div>
        <div class="side-navigation-footer">{props[_footer]}</div>
    </div>)
}

export {
    SideNavigation,
    SideNavigationItem
}
export type {
    SideNavigationProps,
    SideNavigationItemProps
}
export default SideNavigation