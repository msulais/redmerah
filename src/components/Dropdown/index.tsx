import { For, Show, createEffect, createSelector, createSignal, mergeProps, onCleanup, onMount, splitProps, type JSX, type VoidComponent } from "solid-js";

import { _auto, _CENTER_BOTTOM, _CENTER_BOTTOM_TO_RIGHT, _children, _classList, _currentTarget, _disabled, _disconnect, _dividerIndexs, _dropdownAttr, _filter, _firstElementChild, _footer, _header, _headers, _includes, _item, _items, _join, _labelElement, _length, _map, _maxHeight, _multiple, _observe, _onClick, _onClicks, _onValueChanged, _optionIconTooltip, _push, _px, _readOnly, _ref, _refs, _scrollTo, _scrollTop, _selectedItems, _selectedValues, _some, _trailing, _trailings, _width } from "@/data/string";
import { closePopover, openPopover, repositionPopover } from "@/utils/popover";
import { getBoundingClientRect } from "@/utils/element";
import { PopoverPosition } from "@/enums/position";
import type { ComponentEvent } from "@/types/event";
import { removeAttribute, setAttribute, toggleAttribute } from "@/utils/attributes";
import { createStore } from "solid-js/store";
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout";
import Tooltip from "../Tooltip";

import Icon from "@/components/Icon";
import TextField, { TextFieldTrailingButton, type TextFieldProps } from "@/components/TextField";
import Menu, { MenuDivider, MenuHeader, MenuItem, type MenuProps } from "@/components/Menu";
import './index.scss'

const _data_dropdown_readonly = 'data-dropdown-readonly'

export type DropdownItem = [value: string, text: string, trailingText: string] | [value: string, text: string]

type DropdownProps = Omit<TextFieldProps, 'value'> & {
    items: DropdownItem[]
    selectedValues?: string[]
    dividerIndexs?: number[]
    headers?: [index: number, text: JSX.Element][]
    multiple?: boolean
    header?: JSX.Element
    footer?: JSX.Element
    optionIconTooltip?: string
    refs?: (el: HTMLButtonElement, value: string) => unknown
    onClicks?: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>) => boolean | unknown
    onValueChanged?: (values: string[]) => unknown
    dropdownAttr?: MenuProps & { ref?: (el: HTMLDialogElement) => void }
}

const Dropdown: VoidComponent<DropdownProps> = ($props) => {
    const $$props = mergeProps({
        dividerIndexs: [],
        headers: [], 
        trailings: []
    }, $props)
    const [props, other] = splitProps($$props, [
        _refs, _trailings, _dividerIndexs, _headers, _readOnly, 
        _footer, _header, _disabled, _onValueChanged, _items, 
        _selectedValues, _labelElement, _multiple, _trailing, 
        _onClicks, _dropdownAttr, _optionIconTooltip
    ])
    const [selectedItems, setSelectedItems] = createStore<DropdownItem[]>([])
    const [width, setWidth] = createSignal<number>(0)
    const [isFocus, setIsFocus] = createSignal<boolean>(false)
    const [button_options_ref, set_button_option_ref] = createSignal<HTMLButtonElement | null>(null)
    const isSelected = createSelector<DropdownItem[], string>(
        () => selectedItems, 
        (item, items) => items[_some]((a) => a[0] == item)
    )
    let dropdownInputRef: HTMLElement
    let dropdownMenuRef: HTMLElement

    function initSelectedItems(): void {
        if (!props[_selectedValues]) return;
        if (!props[_multiple] && props[_selectedValues][_length] > 1) {
            for (const item of props[_items]) {
                if (props[_selectedValues][_includes](item[0])) {
                    setSelectedItems([[...item]])
                    break;
                }
            }
            return;
        }

        const items: DropdownItem[] = []
        for (const item of props[_items]) {
            if (props[_selectedValues][_includes](item[0])) items[_push]([...item])
        }
        setSelectedItems(items)
    }

    function openDropdownMenu(ev: ComponentEvent<MouseEvent>): void {
        if (props[_disabled] || props[_readOnly]) return;

        setWidth(getBoundingClientRect(dropdownInputRef)[_width])
        openPopover({
            event: ev, 
            allowHideAnchor: false,
            popover: dropdownMenuRef, 
            anchor: dropdownInputRef, 
            padding: 0,
            position: PopoverPosition[_CENTER_BOTTOM]
        })
    }

    function selectItem(item: DropdownItem): void {
        if (props[_multiple]) {
            setSelectedItems(v => isSelected(item[0])
                ? v[_filter](i => i[0] != item[0]) 
                : [...v, item]
            )
        } else {
            closePopover(dropdownMenuRef)

            if (isSelected(item[0])) return;
            setSelectedItems([[...item]])
        }

        if (props[_onValueChanged]) props[_onValueChanged]([...selectedItems[_map](i => i[0])])
    }

    onMount(() => {
        let t: number | null = null

        initSelectedItems()
        const observer = new ResizeObserver(() => {
            if (t != null) clearTimeDelayed(t)

            t = setTimeDelayed(() => {
                setWidth(getBoundingClientRect(dropdownInputRef)[_width])
                repositionPopover(dropdownMenuRef)
                t = null
            }, 50)
        })
        observer[_observe](dropdownInputRef!, { box: "border-box" })

        onCleanup(() => {
            observer[_disconnect]()
        })
    })
    
    createEffect(() => {
        initSelectedItems()
    })

    createEffect(() => {
        if (props[_readOnly]) setAttribute(dropdownInputRef, _data_dropdown_readonly)
        else removeAttribute(dropdownInputRef, _data_dropdown_readonly)
    })

    return (<>
        <TextField 
            readOnly
            disabled={props[_disabled]}
            focus={isFocus()}
            labelElement={{
                ...props[_labelElement],
                ref: (r) => {
                    dropdownInputRef = r
                    if (props[_labelElement] && props[_labelElement][_ref]) {
                        (props[_labelElement][_ref] as ((el: HTMLLabelElement) => void))(r)
                    }
                }, 
                classList: {'dropdown': true, ...(() => {
                    if (props[_labelElement] && props[_labelElement][_classList]) return props[_labelElement][_classList];
                    return {}
                })()},
                onClick: ev => {
                    openDropdownMenu(ev)
                    if (props[_labelElement] && props[_labelElement][_onClick]) {
                        (props[_labelElement][_onClick] as (ev: ComponentEvent<MouseEvent, HTMLLabelElement>) => unknown)(ev)
                    }
                },
            }}
            value={selectedItems[_map](i => i[1])[_join](', ')}
            trailing={<>
                {props[_trailing]}
                <Show when={!props[_readOnly]}>
                    <Tooltip anchor={button_options_ref()} text={props[_optionIconTooltip] ?? "Show options"}/>
                    <TextFieldTrailingButton ref={r => set_button_option_ref(r)} data-focus={toggleAttribute(isFocus())} onClick={ev => openDropdownMenu(ev)}><Icon code={0xE362} filled/></TextFieldTrailingButton>
                </Show>
            </>} 
            {...other}
        />
        <Menu 
            {...props[_dropdownAttr]} 
            onToggle={v => setIsFocus(v)} 
            ref={r => {
                dropdownMenuRef = r
                if (props[_dropdownAttr] && props[_dropdownAttr][_ref]) props[_dropdownAttr][_ref](r)
            }} style={{'min-width': width() + _px}}
            classList={{'dropdown-menu': true}}>
            <div class="dropdown-header">{ props[_header] }</div>
            <div class="dropdown-items">
                <For each={props[_items]}>{(i, index) => <>

                    {/* TODO: fix this ugly code */}
                    <For each={props[_headers]}>{h => <Show when={index() == h[0]}>
                        <MenuHeader>{h[1]}</MenuHeader>
                    </Show>}</For>

                    <MenuItem 
                        ref={(r) => {
                            if (props[_refs]) props[_refs](r, i[0])
                        }}
                        onClick={(ev) => {
                            if (props[_onClicks]) {
                                const isContinue = props[_onClicks](ev)
                                if (isContinue == false) return
                            }
                            selectItem(i)
                        }} 
                        trailing={i[2]}
                        selected={!props[_multiple]? isSelected(i[0]) : undefined}
                        checked={props[_multiple]? isSelected(i[0]) : undefined}>
                        {i[1]}
                    </MenuItem>
                    <Show when={(props[_dividerIndexs] as number[])[_includes](index())}>
                        <MenuDivider />
                    </Show>
                </>}</For>
            </div>
            <div class="dropdown-footer">{ props[_footer] }</div>
        </Menu>
    </>)
}

export default Dropdown