import { createSignal, type VoidComponent } from "solid-js"

import CSS from './_styles.module.scss'
import { IconButton } from "@/components/Button"
import Divider from "@/components/Divider"
import Dropdown from "@/components/Dropdown"
import TextTooltip from "@/components/Tooltip"
import { closePopoverMenu, MenuHeader, MenuItem, openPopoverMenu, PopoverMenu } from "@/components/Menu"
import { _currentTarget } from "@/constants/string"
import ColorPicker, { openColorPicker } from "@/components/ColorPicker"

const ToolBar: VoidComponent = () => {
    const [is_popover_textFormat_open    , setIs_popover_textFormat_open    ] = createSignal<boolean>(false)
    const [is_popoverMenu_insert_open    , setIs_popoverMenu_insert_open    ] = createSignal<boolean>(false)
    const [is_popoverMenu_indent_open    , setIs_popoverMenu_indent_open    ] = createSignal<boolean>(false)
    const [is_popoverMenu_direction_open , setIs_popoverMenu_direction_open ] = createSignal<boolean>(false)
    const [is_popoverMenu_list_open      , setIs_popoverMenu_list_open      ] = createSignal<boolean>(false)
    const [is_popoverMenu_align_open     , setIs_popoverMenu_align_open     ] = createSignal<boolean>(false)
    const [is_popoverMenu_textCase_open  , setIs_popoverMenu_textCase_open  ] = createSignal<boolean>(false)
    const [is_colorPicker_text_open      , setIs_colorPicker_text_open      ] = createSignal<boolean>(false)
    const [is_colorPicker_background_open, setIs_colorPicker_background_open] = createSignal<boolean>(false)
    let popover_textFormat_ref: HTMLDivElement
    let popoverMenu_textCase_ref : HTMLDivElement
    let popoverMenu_insert_ref   : HTMLDivElement
    let popoverMenu_list_ref     : HTMLDivElement
    let popoverMenu_indent_ref   : HTMLDivElement
    let popoverMenu_direction_ref: HTMLDivElement
    let popoverMenu_align_ref    : HTMLDivElement
    let colorPicker_text_ref: HTMLDialogElement
    let colorPicker_background_ref: HTMLDialogElement

    const Popovers: VoidComponent = () => (<></>)

    const Menus: VoidComponent = () => (<>
        <PopoverMenu
            ref={r => popoverMenu_textCase_ref = r}
            class={CSS.body_toolbar_menu}
            style={{'min-width': '164px'}}
            onToggleOpen={isOpen => setIs_popoverMenu_textCase_open(isOpen)}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_textCase_ref)}
                />
            </TextTooltip>
            <MenuHeader>Text case</MenuHeader>

            {/* TODO: upper case */}
            <MenuItem>UPPER CASE</MenuItem>

            {/* TODO: lower case */}
            <MenuItem>lower case</MenuItem>

            {/* TODO: title case */}
            <MenuItem>Title Case</MenuItem>

            {/* TODO: toggle case */}
            <MenuItem>tOGGLE cASE</MenuItem>
        </PopoverMenu>
        <PopoverMenu
            ref={r => popoverMenu_insert_ref = r}
            class={CSS.body_toolbar_menu}
            style={{'min-width': '164px'}}
            onToggleOpen={isOpen => setIs_popoverMenu_insert_open(isOpen)}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_insert_ref)}
                />
            </TextTooltip>
            <MenuHeader>Insert</MenuHeader>

            {/* TODO: file */}
            <MenuItem iconCode={0xE5FF}>File</MenuItem>

            {/* TODO: formula */}
            <MenuItem iconCode={0xEA95}>Formula</MenuItem>

            {/* TODO: image */}
            <MenuItem iconCode={0xE8FE}>Image</MenuItem>

            {/* TODO: link */}
            <MenuItem iconCode={0xE9EF}>Link</MenuItem>
        </PopoverMenu>
        <PopoverMenu
            ref={r => popoverMenu_indent_ref = r}
            class={CSS.body_toolbar_menu}
            style={{'min-width': '164px'}}
            onToggleOpen={isOpen => setIs_popoverMenu_indent_open(isOpen)}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_indent_ref)}
                />
            </TextTooltip>
            <MenuHeader>Indentation</MenuHeader>

            {/* TODO: increase indent */}
            <MenuItem iconCode={0xF13D}>Increase indent</MenuItem>

            {/* TODO: decrease indent */}
            <MenuItem iconCode={0xF12B}>Decrease indent</MenuItem>
        </PopoverMenu>
        <PopoverMenu
            ref={r => popoverMenu_direction_ref = r}
            class={CSS.body_toolbar_menu}
            style={{'min-width': '164px'}}
            onToggleOpen={isOpen => setIs_popoverMenu_direction_open(isOpen)}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_direction_ref)}
                />
            </TextTooltip>
            <MenuHeader>Direction</MenuHeader>

            {/* TODO: left to right */}
            <MenuItem iconCode={0xF16D} selected>Left to right</MenuItem>

            {/* TODO: right to left */}
            <MenuItem iconCode={0xF16B}>Right to left</MenuItem>
        </PopoverMenu>
        <PopoverMenu
            ref={r => popoverMenu_list_ref = r}
            class={CSS.body_toolbar_menu}
            style={{'min-width': '164px'}}
            onToggleOpen={isOpen => setIs_popoverMenu_list_open(isOpen)}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_list_ref)}
                />
            </TextTooltip>
            <MenuHeader>List</MenuHeader>

            {/* TODO: unordered list */}
            <MenuItem iconCode={0xF086}>Unordered list</MenuItem>

            {/* TODO: ordered llist */}
            <MenuItem iconCode={0xF157}>Ordered list</MenuItem>
        </PopoverMenu>
        <PopoverMenu
            ref={r => popoverMenu_align_ref = r}
            class={CSS.body_toolbar_menu}
            style={{'min-width': '164px'}}
            onToggleOpen={isOpen => setIs_popoverMenu_align_open(isOpen)}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_align_ref)}
                />
            </TextTooltip>
            <MenuHeader>Alignment</MenuHeader>

            {/* TODO: left */}
            <MenuItem iconCode={0xF070} selected>Left</MenuItem>

            {/* TODO: center */}
            <MenuItem iconCode={0xF056}>Center</MenuItem>

            {/* TODO: right */}
            <MenuItem iconCode={0xF076}>Right</MenuItem>

            {/* TODO: justify */}
            <MenuItem iconCode={0xF062}>Justify</MenuItem>
        </PopoverMenu>
    </>)

    const ColorPickers: VoidComponent = () => (<>

        {/* TODO: text color */}
        <ColorPicker
            ref={r => colorPicker_text_ref = r}
            disabledAction
            onToggleOpen={isOpen => setIs_colorPicker_text_open(isOpen)}
        />

        {/* TODO: background color */}
        <ColorPicker
            ref={r => colorPicker_background_ref = r}
            disabledAction
            onToggleOpen={isOpen => setIs_colorPicker_background_open(isOpen)}
        />
    </>)

    return (<div class={CSS.body_toolbar}>

        {/* TODO: style */}
        <Dropdown
            labelText={"Style"}
            selectedValues={['n']}
            style={{
                width: '84px'
            }}
            items={[
                ['n', "Normal"],
                ['h1', "Header 1"],
                ['h2', "Header 2"],
                ['h3', "Header 3"],
                ['q', "Blockquote"],
                ['c', "Blockcode"],
            ]}
        />
        <TextTooltip text="Bold">
            <IconButton code={0xF082}/>
        </TextTooltip>
        <TextTooltip text="Italic">
            <IconButton code={0xF14F}/>
        </TextTooltip>
        <TextTooltip text="Underline">
            <IconButton code={0xF193}/>
        </TextTooltip>
        <TextTooltip text="Strikethrough">
            <IconButton code={0xF18B}/>
        </TextTooltip>
        <TextTooltip text="Code">
            <IconButton code={0xE4A8}/>
        </TextTooltip>
        <TextTooltip text="Subscript">
            <IconButton code={0xF18D}/>
        </TextTooltip>
        <TextTooltip text="Superscript">
            <IconButton code={0xF18F}/>
        </TextTooltip>
        <Divider vertical style={{height: '20px'}}/>
        <TextTooltip text="Search">
            <IconButton code={0xEDDF}/>
        </TextTooltip>
        <TextTooltip text="Clear format">
            <IconButton code={0xE424}/>
        </TextTooltip>
        <TextTooltip text="Undo">
            <IconButton code={0xE177}/>
        </TextTooltip>
        <TextTooltip text="Redo">
            <IconButton code={0xE105}/>
        </TextTooltip>
        <TextTooltip text="Print">
            <IconButton code={0xECFF}/>
        </TextTooltip>
        <Divider vertical style={{height: '20px'}}/>
        <TextTooltip text="Text color">
            <IconButton
                code={0xF0BA}
                focused={is_colorPicker_text_open()}
                onClick={ev => openColorPicker(ev, colorPicker_text_ref, {
                    anchor: ev[_currentTarget],
                    dragable: true,
                    gap: 8
                })}
            />
        </TextTooltip>
        <TextTooltip text="Background color">
            <IconButton
                code={0xE4B8}
                focused={is_colorPicker_background_open()}
                onClick={ev => openColorPicker(ev, colorPicker_background_ref, {
                    anchor: ev[_currentTarget],
                    dragable: true,
                    gap: 8
                })}
            />
        </TextTooltip>
        <Divider vertical style={{height: '20px'}}/>
        <TextTooltip text="Insert">
            <IconButton
                code={0xE00B}
                focused={is_popoverMenu_insert_open()}
                onClick={ev => is_popoverMenu_insert_open()
                    ? closePopoverMenu(popoverMenu_insert_ref)
                    : openPopoverMenu(ev, popoverMenu_insert_ref, {
                        anchor: ev[_currentTarget],
                        gap: 8,
                        manualDismiss: true,
                        dragable: true
                    })
                }
            />
        </TextTooltip>
        <TextTooltip text="Text case">
            <IconButton
                code={0xF0B0}
                focused={is_popoverMenu_textCase_open()}
                onClick={ev => is_popoverMenu_textCase_open()
                    ? closePopoverMenu(popoverMenu_textCase_ref)
                    : openPopoverMenu(ev, popoverMenu_textCase_ref, {
                        anchor: ev[_currentTarget],
                        gap: 8,
                        manualDismiss: true,
                        dragable: true
                    })
                }
            />
        </TextTooltip>
        <TextTooltip text="List">
            <IconButton
                code={0xF098}
                focused={is_popoverMenu_list_open()}
                onClick={ev => is_popoverMenu_list_open()
                    ? closePopoverMenu(popoverMenu_list_ref)
                    : openPopoverMenu(ev, popoverMenu_list_ref, {
                        anchor: ev[_currentTarget],
                        gap: 8,
                        manualDismiss: true,
                        dragable: true
                    })
                }
            />
        </TextTooltip>
        <TextTooltip text="Indentation">
            <IconButton
                code={0xF13D}
                focused={is_popoverMenu_indent_open()}
                onClick={ev => is_popoverMenu_indent_open()
                    ? closePopoverMenu(popoverMenu_indent_ref)
                    : openPopoverMenu(ev, popoverMenu_indent_ref, {
                        anchor: ev[_currentTarget],
                        dragable: true,
                        gap: 8,
                        manualDismiss: true
                    })
                }
            />
        </TextTooltip>
        <TextTooltip text="Text direction">
            <IconButton
                code={0xF169}
                focused={is_popoverMenu_direction_open()}
                onClick={ev => is_popoverMenu_direction_open()
                    ? closePopoverMenu(popoverMenu_direction_ref)
                    : openPopoverMenu(ev, popoverMenu_direction_ref, {
                        anchor: ev[_currentTarget],
                        dragable: true,
                        gap: 8,
                        manualDismiss: true
                    })
                }
            />
        </TextTooltip>
        <TextTooltip text="Text align">
            <IconButton
                code={0xF05C}
                focused={is_popoverMenu_align_open()}
                onClick={ev => is_popoverMenu_align_open()
                    ? closePopoverMenu(popoverMenu_align_ref)
                    : openPopoverMenu(ev, popoverMenu_align_ref, {
                        anchor: ev[_currentTarget],
                        dragable: true,
                        gap: 8,
                        manualDismiss: true
                    })
                }
            />
        </TextTooltip>
        <TextTooltip text="More actions">
            <IconButton code={0xEAD9}/>
        </TextTooltip>
        <Menus/>
        <ColorPickers />
    </div>)
}

const _: VoidComponent = () => {
    return (<main class={CSS.body}>
        <ToolBar />
    </main>)
}

export default _