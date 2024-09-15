import { type ParentComponent, type JSX, mergeProps, splitProps, type VoidComponent } from 'solid-js'

import type { ComponentEvent } from '@/types/event'
import { _button, _transparent, _bottom, _children, _indicatorPosition, _variant, _focused, _compact, _selected, _layerAttr, _disableScale, _classList, _type, _class, _desktopCompact, _filled, _filledTonal, _outlined, _openInNewTab, _disabled, _onClick, _code, _tonal, _emoji } from '@/constants/string'
import { toggleAttribute } from '@/utils/attributes'
import { preventDefault } from '@/utils/event'

import Icon from '@/components/Icon'
import Emoji from '@/components/Emoji'
import './index.scss'

enum ButtonVariant {
    filled,
    outlined,
    tonal,
    transparent
}

enum ButtonIndicatorPosition {
    top = 'top',
    right = 'right',
    bottom = 'bottom',
    left = 'left'
}

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    focused?: boolean
    disableScale?: boolean
    compact?: boolean
    selected?: boolean
    desktopCompact?: boolean
    indicatorPosition?: ButtonIndicatorPosition
    layerAttr?: JSX.HTMLAttributes<HTMLDivElement>
}
const Button: ParentComponent<ButtonProps> = ($props) => {
    const $$props = mergeProps({
        type: _button,
        variant: ButtonVariant[_transparent],
        indicatorPosition: ButtonIndicatorPosition[_bottom]
    }, $props)
    const [props, other] = splitProps($$props, [
        _children, _indicatorPosition, _variant,
        _focused, _compact, _selected, _layerAttr,
        _disableScale, _classList, _type, _class,
        _desktopCompact
    ])

    return (<button
        class={'btn' + (props[_class] != undefined? ` ${props[_class]}` : '')}
        classList={{
            'filled-btn': props[_variant] == ButtonVariant[_filled],
            'tonal-btn': props[_variant] == ButtonVariant[_tonal],
            'outlined-btn': props[_variant] == ButtonVariant[_outlined],
            ...props[_classList]
        }}
        type={props[_type] as ("button" | "submit" | "reset" | undefined)}
        data-desktop-compact={toggleAttribute(props[_desktopCompact])}
        data-indicator={props[_selected]? props[_indicatorPosition] : undefined}
        data-selected={toggleAttribute(props[_selected])}
        data-focused={toggleAttribute(props[_focused])}
        data-noscale={toggleAttribute(props[_disableScale])}
        data-compact={toggleAttribute(props[_compact])}
        {...other}>
        <div class='btn-layer' {...props[_layerAttr]}>{props[_children]}</div>
    </button>)
}

type LinkButtonProps = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> & {
    variant?: ButtonVariant
    focused?: boolean
    compact?: boolean
    disabled?: boolean
    openInNewTab?: boolean
    selected?: boolean
    disableScale?: boolean
    indicatorPosition?: ButtonIndicatorPosition
    desktopCompact?: boolean
    layerAttr?: JSX.HTMLAttributes<HTMLDivElement>
    onClick?: (ev: ComponentEvent<MouseEvent, HTMLAnchorElement>) => unknown
}

const LinkButton: ParentComponent<LinkButtonProps> = ($props) => {
    const $$props = mergeProps({
        variant: ButtonVariant[_transparent],
        indicatorPosition: ButtonIndicatorPosition[_bottom]
    }, $props)
    const [props, other] = splitProps($$props, [
        _openInNewTab, _children, _indicatorPosition,
        _variant, _focused, _compact, _selected, _layerAttr,
        _disableScale, _classList, _class, _desktopCompact,
        _disabled, _onClick
    ])

    return (<a
        class={'btn' + (props[_class] != undefined? ` ${props[_class]}` : '')}
        onClick={(ev) => {
            if (props[_disabled]) {
                preventDefault(ev)
            }
            if (props[_onClick]) props[_onClick](ev)
        }}
        classList={{
            'filled-btn': props[_variant] == ButtonVariant[_filled],
            'tonal-btn': props[_variant] == ButtonVariant[_tonal],
            'outlined-btn': props[_variant] == ButtonVariant[_outlined],
            ...props[_classList]
        }}
        data-indicator={props[_selected]? props[_indicatorPosition] : undefined}
        data-desktop-compact={toggleAttribute(props[_desktopCompact])}
        data-disabled={toggleAttribute(props[_disabled])}
        data-selected={toggleAttribute(props[_selected])}
        data-focused={toggleAttribute(props[_focused])}
        data-noscale={toggleAttribute(props[_disableScale])}
        data-compact={toggleAttribute(props[_compact])}
        target={props[_openInNewTab]? "_blank" : undefined}
        rel={props[_openInNewTab]? "noopener noreferrer" : undefined}
        {...other}>
        <div class='btn-layer' {...props[_layerAttr]}>{props[_children]}</div>
    </a>)
}

type SquareButtonProps = ButtonProps
const SquareButton: ParentComponent<SquareButtonProps> = ($props) => {
    const [props, other] = splitProps($props, [_classList])
    return (<Button
        classList={{'square-btn': true, ...props[_classList]}}
        {...other}
    />)
}

type LinkSquareButtonProps = LinkButtonProps
const LinkSquareButton: ParentComponent<LinkSquareButtonProps> = ($props) => {
    const [props, other] = splitProps($props, [_classList])
    return (<LinkButton
        classList={{'square-btn': true, ...props[_classList]}}
        {...other}
    />)
}

type IconButtonProps = SquareButtonProps & {
    code: number
    filled?: boolean
}
const IconButton: VoidComponent<IconButtonProps> = ($props) => {
    const [props, other] = splitProps($props, [_classList, _code, _filled])
    return (<SquareButton
        classList={{'icon-btn': true, ...props[_classList]}}
        {...other}>
        <Icon code={props[_code]} filled={props[_filled]}/>
    </SquareButton>)
}

type LinkIconButtonProps = LinkSquareButtonProps & {
    code: number
    filled?: boolean
}
const LinkIconButton: VoidComponent<LinkIconButtonProps> = ($props) => {
    const [props, other] = splitProps($props, [_classList, _code, _filled])
    return (<LinkSquareButton
        classList={{'icon-btn': true, ...props[_classList]}}
        {...other}>
        <Icon code={props[_code]} filled={props[_filled]}/>
    </LinkSquareButton>)
}

type EmojiButtonProps = SquareButtonProps & {
    emoji: string
}
const EmojiButton: VoidComponent<EmojiButtonProps> = ($props) => {
    const [props, other] = splitProps($props, [_classList, _emoji])
    return (<SquareButton
        classList={{'emoji-btn': true, ...props[_classList]}}
        {...other}>
        <Emoji emoji={props[_emoji]}/>
    </SquareButton>)
}

type LinkEmojiButtonProps = LinkSquareButtonProps & {
    emoji: string
}
const LinkEmojiButton: VoidComponent<LinkEmojiButtonProps> = ($props) => {
    const [props, other] = splitProps($props, [_classList, _emoji])
    return (<LinkSquareButton
        classList={{'emoji-btn': true, ...props[_classList]}}
        {...other}>
        <Emoji emoji={props[_emoji]}/>
    </LinkSquareButton>)
}

type FloatingActionButtonProps = ButtonProps
const FloatingActionButton: ParentComponent<FloatingActionButtonProps> = ($props) => {
    const [props, other] = splitProps($props, [_classList])
    return (<Button
        classList={{'floating-action-btn': true, ...props[_classList]}}
        {...other}
    />)
}

type LinkFloatingActionActionButtonProps = LinkButtonProps
const LinkFloatingActionButton: ParentComponent<LinkFloatingActionActionButtonProps> = ($props) => {
    const [props, other] = splitProps($props, [_classList])
    return (<LinkButton
        classList={{'floating-action-btn': true, ...props[_classList]}}
        {...other}
    />)
}

export {
    Button,
    LinkButton,
    IconButton,
    LinkIconButton,
    FloatingActionButton,
    LinkFloatingActionButton,
    SquareButton,
    LinkSquareButton,
    EmojiButton,
    LinkEmojiButton,
    ButtonVariant,
    ButtonIndicatorPosition
}
export type {
    ButtonProps,
    LinkButtonProps,
    IconButtonProps,
    LinkIconButtonProps,
    FloatingActionButtonProps,
    LinkFloatingActionActionButtonProps,
    SquareButtonProps,
    LinkSquareButtonProps,
    EmojiButtonProps,
    LinkEmojiButtonProps,
}
export default Button