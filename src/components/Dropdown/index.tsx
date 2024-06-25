import { For, Show, createEffect, createSelector, createSignal, onCleanup, onMount, splitProps, type ParentComponent, type VoidComponent } from "solid-js";

import Icon from "@/components/Icon";
import TextField, { TextFieldTrailingButton, type TextFieldProps } from "@/components/TextField";
import Menu, { MenuItem } from "@/components/Menu";
import './index.scss'

import { _CENTER_BOTTOM, _CENTER_BOTTOM_TO_RIGHT, _children, _classList, _currentTarget, _disabled, _disconnect, _filter, _firstElementChild, _includes, _item, _items, _join, _labelElement, _length, _map, _multiple, _observe, _onClick, _onValueChanged, _push, _px, _readOnly, _ref, _scrollTo, _scrollTop, _selectedItems, _selectedValues, _some, _trailing, _width } from "@/data/string";
import { closePopover, openPopover, repositionPopover } from "@/utils/popover";
import { getBoundingClientRect } from "@/utils/element";
import { PopoverPosition } from "@/enums/position";
import type { ComponentEvent } from "@/types/event";
import { removeAttribute, setAttribute, toggleAttribute } from "@/utils/attributes";
import { createStore } from "solid-js/store";
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout";

type DropdownItem = [text: string, value: string]

type DropdownProps = Omit<TextFieldProps, 'value'> & {
    items: DropdownItem[]
    selectedValues?: string[]
    multiple?: boolean
    onValueChanged?: (values: string[]) => unknown
}

const Dropdown: VoidComponent<DropdownProps> = ($props) => {
    const [props, other] = splitProps($props, [_readOnly, _disabled, _onValueChanged, _items, _selectedValues, _labelElement, _multiple, _trailing])
    const [selectedItems, setSelectedItems] = createStore<DropdownItem[]>([])
    const [width, setWidth] = createSignal<number>(0)
    const [isFocus, setIsFocus] = createSignal<boolean>(false)
    const isSelected = createSelector<DropdownItem[], string>(
        () => selectedItems, 
        (item, items) => items[_some]((a) => a[1] == item)
    )
    let dropdownInputRef: HTMLElement
    let dropdownMenuRef: HTMLElement

    function initSelectedItems(): void {
        if (!props[_selectedValues]) return;
        if (!props[_multiple] && props[_selectedValues][_length] > 1) {
            for (const item of props[_items]) {
                if (props[_selectedValues][_includes](item[1])) {
                    setSelectedItems([[...item]])
                    break;
                }
            }
            return;
        }

        const items: DropdownItem[] = []
        for (const item of props[_items]) {
            if (props[_selectedValues][_includes](item[1])) items[_push]([...item])
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
            setSelectedItems(v => isSelected(item[1])
                ? v[_filter](i => i[1] != item[1]) 
                : [...v, item]
            )
        } else {
            closePopover(dropdownMenuRef)

            if (isSelected(item[1])) return;
            setSelectedItems([[...item]])
        }

        if (props[_onValueChanged]) props[_onValueChanged]([...selectedItems[_map](i => i[1])])
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
        if (props[_readOnly]) setAttribute(dropdownInputRef, 'data-dropdown-readonly')
        else removeAttribute(dropdownInputRef, 'data-dropdown-readonly')
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
            value={selectedItems[_map](i => i[0])[_join](', ')}
            trailing={<>
                {props[_trailing]}
                <Show when={!props[_readOnly]}>
                    <TextFieldTrailingButton data-focus={toggleAttribute(isFocus())} onClick={ev => openDropdownMenu(ev)}><Icon code={0xE362} filled/></TextFieldTrailingButton>
                </Show>
            </>} 
            {...other}
        />
        <Menu onToggle={v => setIsFocus(v)} ref={r => dropdownMenuRef = r} style={{'min-width': width() + _px}}>
            <For each={props[_items]}>{i => 
                <MenuItem 
                    onClick={() => selectItem(i)} 
                    selected={!props[_multiple]? isSelected(i[1]) : undefined}
                    checked={props[_multiple]? isSelected(i[1]) : undefined}>
                    {i[0]}
                </MenuItem>
            }</For>
        </Menu>
    </>)
}

export default Dropdown