import type { ParentComponent } from "solid-js";
import { Show, children, createEffect, createMemo, createSignal, mergeProps, onCleanup, onMount, splitProps, type JSX } from "solid-js";

import { _children, _classList, _disconnect, _filledTonal, _header, _height, _isOpen, _leading, _observe, _onToggle, _openByDefault, _px, _ref, _showExpandIcon, _subtitle, _title, _trailing, _variant } from "@/data/string";
import { getBoundingClientRect } from "@/utils/element";
import { stopPropagation } from "@/utils/event";
import { toggleAttribute } from "@/utils/attributes";
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout";

import Icon from "@/components/Icon";
import List from "@/components/List";
import './index.scss'

type ExpanderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onToggle' | 'ref' | 'title'> & {
    title?: JSX.Element
    subtitle?: JSX.Element
    leading?: JSX.Element
    trailing?: JSX.Element

    /**
     * Force expander to open
     */
    isOpen?: boolean
    showExpandIcon?: boolean
    openByDefault?: boolean
    ref?: (el: HTMLDivElement) => unknown
    onToggle?: (isOpen: boolean) => unknown
    variant?: ExpanderVariant
}

export enum ExpanderVariant {
    outlined = 'outlined',
    filledTonal = 'filled-tonal',
    filled = 'filled',
    transparent = 'transparent'
}

const Expander: ParentComponent<ExpanderProps> = ($props) => {
    const $$props = mergeProps({showExpandIcon: true}, $props)
    const [props, other] = splitProps($$props, [
        _title, _children, _isOpen, _ref,
        _openByDefault, _onToggle, _variant,
        _subtitle, _leading, _trailing, 
        _classList, _showExpandIcon
    ])
    const [isLocalOpen, setIsLocalOpen] = createSignal<boolean>(false)
    const [contentHeight, setContentHeight] = createSignal<number>(0)
    const [isMounted, setIsMounted] = createSignal<boolean>(false)
    const open = createMemo<boolean>(() => props[_isOpen] ?? isLocalOpen())
    const trailingComponent = children(() => props[_trailing])
    let isForceOpen: boolean = false
    let contentRef: HTMLDivElement
    let expanderRef: HTMLDivElement

    function toggleOpen(ev: Event): void {
        setContentHeight(getBoundingClientRect(contentRef)[_height] + 1)
        setIsLocalOpen(o => !o)
        stopPropagation(ev)

        if (props[_onToggle]) props[_onToggle](open())
    }

    onMount(() => {
        let t: number | null = null
        const observer = new ResizeObserver(() => {
            if (!contentRef) return

            if (t != null) clearTimeDelayed(t)
            
            t = setTimeDelayed(() => {
                const height = getBoundingClientRect(contentRef)[_height] + 1
                if (contentHeight() != height) setContentHeight(height)
                t = null
            }, 50)
        })

        isForceOpen = props[_isOpen] ?? isForceOpen
        setContentHeight(getBoundingClientRect(contentRef)[_height] + 1)
        if (props[_openByDefault]) setIsLocalOpen(true)

        setIsMounted(true)
        observer[_observe](expanderRef!, { box: "border-box" })

        onCleanup(() => {
            observer[_disconnect]()
        })
    })

    // listening `props.isOpen` prop
    createEffect(() => {
        if (props[_isOpen] && props[_isOpen] != isForceOpen) {
            isForceOpen = props[_isOpen]
            if (props[_onToggle]) props[_onToggle](open())
        }
    })

    return (<div 
        class="expander"
        ref={r => {
            expanderRef = r
            if (props[_ref]) props[_ref](r)
        }}
        data-open={toggleAttribute(open())}
        {...other}>
        <List 
            classList={{
                'expander-header': true,
                ...props[_classList]
            }}
            tabIndex={0}
            onClick={(ev) => toggleOpen(ev)}
            leading={props[_leading]} 
            data-variant={props[_variant] ?? ExpanderVariant[_filledTonal]}
            data-open={toggleAttribute(open())}
            subtitle={props[_subtitle]}
            trailing={<Show when={props[_showExpandIcon]} fallback={trailingComponent()}>
                {trailingComponent()}<Icon classList={{"expander-header-icon": true}} code={0xE3FC} />
            </Show>}>
            {props[_title]}
        </List>
        <div 
            data-open={toggleAttribute(open())}
            data-variant={props[_variant] ?? ExpanderVariant[_filledTonal]}
            class="expander-content" 
            style={{ height: isMounted() 
                ? (open()? contentHeight() : 0) + _px 
                : undefined 
            }}>
            <div ref={r => contentRef = r}>{props[_children]}</div>
        </div>
    </div>)
}

export default Expander