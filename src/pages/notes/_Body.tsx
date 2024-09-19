import { createSignal, type VoidComponent } from "solid-js"

import CSS from './_styles.module.scss'
import { ButtonVariant, IconButton } from "@/components/Button"
import Dropdown from "@/components/Dropdown"
import TextTooltip from "@/components/Tooltip"
import { closePopoverMenu, MenuDivider, MenuHeader, MenuItem, openPopoverMenu, PopoverMenu } from "@/components/Menu"
import { _currentTarget, _hidePopover, _showPopover, _tonal } from "@/constants/string"
import ColorPicker, { openColorPicker } from "@/components/ColorPicker"

const ToolBar: VoidComponent = () => {
    const [is_popoverMenu_insert_open    , setIs_popoverMenu_insert_open    ] = createSignal<boolean>(false)
    const [is_popoverMenu_direction_open , setIs_popoverMenu_direction_open ] = createSignal<boolean>(false)
    const [is_popoverMenu_list_open      , setIs_popoverMenu_list_open      ] = createSignal<boolean>(false)
    const [is_popoverMenu_align_open     , setIs_popoverMenu_align_open     ] = createSignal<boolean>(false)
    const [is_popoverMenu_textCase_open  , setIs_popoverMenu_textCase_open  ] = createSignal<boolean>(false)
    const [is_popoverMenu_moreAction_open, setIs_popoverMenu_moreAction_open] = createSignal<boolean>(false)
    const [is_popoverMenu_color_open     , setIs_popoverMenu_color_open     ] = createSignal<boolean>(false)
    const [is_popoverMenu_format_open    , setIs_popoverMenu_format_open    ] = createSignal<boolean>(false)
    const [is_colorPicker_text_open      , setIs_colorPicker_text_open      ] = createSignal<boolean>(false)
    const [is_colorPicker_background_open, setIs_colorPicker_background_open] = createSignal<boolean>(false)
    let popoverMenu_moreAction_ref: HTMLDivElement
    let popoverMenu_format_ref    : HTMLDivElement
    let popoverMenu_color_ref     : HTMLDivElement
    let popoverMenu_textCase_ref  : HTMLDivElement
    let popoverMenu_insert_ref    : HTMLDivElement
    let popoverMenu_list_ref      : HTMLDivElement
    let popoverMenu_direction_ref : HTMLDivElement
    let popoverMenu_align_ref     : HTMLDivElement
    let colorPicker_text_ref: HTMLDialogElement
    let colorPicker_background_ref: HTMLDialogElement

    function focusToolbarMenu(menu: HTMLDivElement): void {
        menu[_hidePopover]()
        menu[_showPopover]()
    }

    const Menus: VoidComponent = () => (<>
        <PopoverMenu
            ref={r => popoverMenu_format_ref = r}
            dragable
            manualDismiss
            class={CSS.body_toolbar_menu}
            onToggleOpen={isOpen => setIs_popoverMenu_format_open(isOpen)}
            onMouseDown={ev => focusToolbarMenu(ev[_currentTarget])}
            onTouchStart={ev => focusToolbarMenu(ev[_currentTarget])}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_format_ref)}
                />
            </TextTooltip>
            <MenuHeader>Text format</MenuHeader>
            <MenuDivider />
            <div class={CSS.body_toolbar_menu_icons}>
                {/* TODO: bold */}
                <TextTooltip text="Bold"><IconButton code={0xF082}/></TextTooltip>

                {/* TODO: italic */}
                <TextTooltip text="Italic"><IconButton code={0xF14F}/></TextTooltip>

                {/* TODO: underline */}
                <TextTooltip text="Underline"><IconButton code={0xF193}/></TextTooltip>

                {/* TODO: strikethrough */}
                <TextTooltip text="Strikethrough"><IconButton code={0xF18B}/></TextTooltip>

                {/* TODO: code */}
                <TextTooltip text="Code"><IconButton code={0xE4A8}/></TextTooltip>

                {/* TODO: subscript */}
                <TextTooltip text="Subscript"><IconButton code={0xF18D}/></TextTooltip>

                {/* TODO: superscript */}
                <TextTooltip text="Superscript"><IconButton code={0xF18F}/></TextTooltip>

                {/* TODO: clear format */}
                <TextTooltip text="Clear format"><IconButton code={0xF0B6}/></TextTooltip>
            </div>
        </PopoverMenu>
        <PopoverMenu
            ref={r => popoverMenu_color_ref = r}
            dragable
            manualDismiss
            class={CSS.body_toolbar_menu}
            onToggleOpen={isOpen => setIs_popoverMenu_color_open(isOpen)}
            onMouseDown={ev => focusToolbarMenu(ev[_currentTarget])}
            onTouchStart={ev => focusToolbarMenu(ev[_currentTarget])}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_color_ref)}
                />
            </TextTooltip>
            <MenuHeader>Color</MenuHeader>
            <MenuDivider />
            <div class={CSS.body_toolbar_menu_icons}>

                {/* TODO: text color */}
                <TextTooltip text="Text color">
                    <IconButton
                        code={0xF0BA}
                        focused={is_colorPicker_text_open()}
                        onClick={ev => openColorPicker(ev, colorPicker_text_ref, { anchor: ev[_currentTarget] })}
                    />
                </TextTooltip>

                {/* TODO: background-color */}
                <TextTooltip text="Background color">
                    <IconButton
                        code={0xE4B8}
                        focused={is_colorPicker_background_open()}
                        onClick={ev => openColorPicker(ev, colorPicker_background_ref, { anchor: ev[_currentTarget] })}
                    />
                </TextTooltip>
            </div>
        </PopoverMenu>
        <PopoverMenu
            ref={r => popoverMenu_moreAction_ref = r}
            dragable
            manualDismiss
            class={CSS.body_toolbar_menu}
            onToggleOpen={isOpen => setIs_popoverMenu_moreAction_open(isOpen)}
            onMouseDown={ev => focusToolbarMenu(ev[_currentTarget])}
            onTouchStart={ev => focusToolbarMenu(ev[_currentTarget])}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_moreAction_ref)}
                />
            </TextTooltip>
            <MenuHeader>More action</MenuHeader>
            <MenuDivider />
            <div class={CSS.body_toolbar_menu_icons}>

                {/* TODO: undo */}
                <TextTooltip text="Undo"><IconButton code={0xE177} /></TextTooltip>

                {/* TODO: redo */}
                <TextTooltip text="Redo"><IconButton code={0xE105} /></TextTooltip>

                {/* TODO: print */}
                <TextTooltip text="Print"><IconButton code={0xECFF} /></TextTooltip>

                {/* TODO: find */}
                <TextTooltip text="Find"><IconButton code={0xEDDF} /></TextTooltip>

                {/* TODO: download */}
                <TextTooltip text="Download"><IconButton code={0xE0B9} /></TextTooltip>
            </div>
        </PopoverMenu>
        <PopoverMenu
            ref={r => popoverMenu_textCase_ref = r}
            dragable
            manualDismiss
            class={CSS.body_toolbar_menu}
            onToggleOpen={isOpen => setIs_popoverMenu_textCase_open(isOpen)}
            onMouseDown={ev => focusToolbarMenu(ev[_currentTarget])}
            onTouchStart={ev => focusToolbarMenu(ev[_currentTarget])}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_textCase_ref)}
                />
            </TextTooltip>
            <MenuHeader>Text case</MenuHeader>
            <MenuDivider />

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
            dragable
            manualDismiss
            class={CSS.body_toolbar_menu}
            onToggleOpen={isOpen => setIs_popoverMenu_insert_open(isOpen)}
            onMouseDown={ev => focusToolbarMenu(ev[_currentTarget])}
            onTouchStart={ev => focusToolbarMenu(ev[_currentTarget])}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_insert_ref)}
                />
            </TextTooltip>
            <MenuHeader>Insert</MenuHeader>
            <MenuDivider />
            <div class={CSS.body_toolbar_menu_icons}>

                {/* TODO: insert file */}
                <TextTooltip text="File"><IconButton code={0xE5FF}/></TextTooltip>

                {/* TODO: insert formula */}
                <TextTooltip text="Formula"><IconButton code={0xEA95}/></TextTooltip>

                {/* TODO: insert image */}
                <TextTooltip text="Image"><IconButton code={0xE8FE}/></TextTooltip>

                {/* TODO: insert link */}
                <TextTooltip text="Link"><IconButton code={0xE9EF}/></TextTooltip>

                {/* TODO: insert label */}
                <TextTooltip text="Label"><IconButton code={0xF00D}/></TextTooltip>

                {/* TODO: insert reminder */}
                <TextTooltip text="Reminder"><IconButton code={0xE01B}/></TextTooltip>

                {/* TODO: insert time */}
                <TextTooltip text="Time"><IconButton code={0xE46A}/></TextTooltip>

                {/* TODO: insert date */}
                <TextTooltip text="Date"><IconButton code={0xE2CC}/></TextTooltip>
            </div>
        </PopoverMenu>
        <PopoverMenu
            ref={r => popoverMenu_direction_ref = r}
            dragable
            manualDismiss
            class={CSS.body_toolbar_menu}
            onToggleOpen={isOpen => setIs_popoverMenu_direction_open(isOpen)}
            onMouseDown={ev => focusToolbarMenu(ev[_currentTarget])}
            onTouchStart={ev => focusToolbarMenu(ev[_currentTarget])}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_direction_ref)}
                />
            </TextTooltip>
            <MenuHeader>Direction &<br/>
            indentation</MenuHeader>
            <MenuDivider />
            <div class={CSS.body_toolbar_menu_icons}>

                {/* TODO: ltr */}
                <TextTooltip text="Left to right"><IconButton code={0xF16D} selected variant={ButtonVariant[_tonal]}/></TextTooltip>

                {/* TODO: rtl */}
                <TextTooltip text="Right to left"><IconButton code={0xF16B}/></TextTooltip>

                {/* TODO: increase indent */}
                <TextTooltip text="Increase indent"><IconButton code={0xF13D}/></TextTooltip>

                {/* TODO: decrease indent */}
                <TextTooltip text="Decrease indent"><IconButton code={0xF12B}/></TextTooltip>
            </div>
        </PopoverMenu>
        <PopoverMenu
            ref={r => popoverMenu_list_ref = r}
            dragable
            manualDismiss
            class={CSS.body_toolbar_menu}
            onToggleOpen={isOpen => setIs_popoverMenu_list_open(isOpen)}
            onMouseDown={ev => focusToolbarMenu(ev[_currentTarget])}
            onTouchStart={ev => focusToolbarMenu(ev[_currentTarget])}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_list_ref)}
                />
            </TextTooltip>
            <MenuHeader>List</MenuHeader>
            <MenuDivider />
            <div class={CSS.body_toolbar_menu_icons}>

                {/* TODO: unordered list */}
                <TextTooltip text="Unordered list"><IconButton code={0xF086}/></TextTooltip>

                {/* TODO: ordered list */}
                <TextTooltip text="Ordered list"><IconButton code={0xF157}/></TextTooltip>

                {/* TODO: check list */}
                <TextTooltip text="Check list"><IconButton code={0xF032}/></TextTooltip>
            </div>
        </PopoverMenu>
        <PopoverMenu
            ref={r => popoverMenu_align_ref = r}
            dragable
            manualDismiss
            class={CSS.body_toolbar_menu}
            onToggleOpen={isOpen => setIs_popoverMenu_align_open(isOpen)}
            onMouseDown={ev => focusToolbarMenu(ev[_currentTarget])}
            onTouchStart={ev => focusToolbarMenu(ev[_currentTarget])}>
            <TextTooltip text="Close">
                <IconButton
                    class={CSS.body_toolbar_menu_close}
                    compact
                    code={0xE5E9}
                    onClick={() => closePopoverMenu(popoverMenu_align_ref)}
                />
            </TextTooltip>
            <MenuHeader>Alignment</MenuHeader>
            <MenuDivider />
            <div class={CSS.body_toolbar_menu_icons}>

                {/* TODO: left */}
                <TextTooltip text="Left"><IconButton code={0xF070} selected variant={ButtonVariant[_tonal]}/></TextTooltip>

                {/* TODO: center */}
                <TextTooltip text="Center"><IconButton code={0xF056}/></TextTooltip>

                {/* TODO: right */}
                <TextTooltip text="Right"><IconButton code={0xF076}/></TextTooltip>

                {/* TODO: justify */}
                <TextTooltip text="Justify"><IconButton code={0xF062}/></TextTooltip>
            </div>
        </PopoverMenu>
    </>)

    const ColorPickers: VoidComponent = () => (<>

        {/* TODO: text color */}
        <ColorPicker
            ref={r => colorPicker_text_ref = r}
            disabledAction
            dragable
            onToggleOpen={isOpen => setIs_colorPicker_text_open(isOpen)}
        />

        {/* TODO: background color */}
        <ColorPicker
            ref={r => colorPicker_background_ref = r}
            disabledAction
            dragable
            onToggleOpen={isOpen => setIs_colorPicker_background_open(isOpen)}
        />
    </>)

    return (<div class={CSS.body_toolbar}>
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
        <TextTooltip text="Text format">
            <IconButton
                code={0xF080}
                focused={is_popoverMenu_format_open()}
                onClick={ev => is_popoverMenu_format_open()
                    ? closePopoverMenu(popoverMenu_format_ref)
                    : openPopoverMenu(ev, popoverMenu_format_ref, { anchor: ev[_currentTarget] })
                }
            />
        </TextTooltip>
        <TextTooltip text="Color">
            <IconButton
                code={0xE4B6}
                focused={is_popoverMenu_color_open()}
                onClick={ev => is_popoverMenu_color_open()
                    ? closePopoverMenu(popoverMenu_color_ref)
                    : openPopoverMenu(ev, popoverMenu_color_ref, { anchor: ev[_currentTarget] })
                }
            />
        </TextTooltip>
        <TextTooltip text="Insert">
            <IconButton
                code={0xE00B}
                focused={is_popoverMenu_insert_open()}
                onClick={ev => is_popoverMenu_insert_open()
                    ? closePopoverMenu(popoverMenu_insert_ref)
                    : openPopoverMenu(ev, popoverMenu_insert_ref, { anchor: ev[_currentTarget] })
                }
            />
        </TextTooltip>
        <TextTooltip text="Text case">
            <IconButton
                code={0xF0B0}
                focused={is_popoverMenu_textCase_open()}
                onClick={ev => is_popoverMenu_textCase_open()
                    ? closePopoverMenu(popoverMenu_textCase_ref)
                    : openPopoverMenu(ev, popoverMenu_textCase_ref, { anchor: ev[_currentTarget] })
                }
            />
        </TextTooltip>
        <TextTooltip text="List">
            <IconButton
                code={0xF098}
                focused={is_popoverMenu_list_open()}
                onClick={ev => is_popoverMenu_list_open()
                    ? closePopoverMenu(popoverMenu_list_ref)
                    : openPopoverMenu(ev, popoverMenu_list_ref, { anchor: ev[_currentTarget] })
                }
            />
        </TextTooltip>
        <TextTooltip text="Text direction & indentation">
            <IconButton
                code={0xF169}
                focused={is_popoverMenu_direction_open()}
                onClick={ev => is_popoverMenu_direction_open()
                    ? closePopoverMenu(popoverMenu_direction_ref)
                    : openPopoverMenu(ev, popoverMenu_direction_ref, { anchor: ev[_currentTarget] })
                }
            />
        </TextTooltip>
        <TextTooltip text="Text align">
            <IconButton
                code={0xF05C}
                focused={is_popoverMenu_align_open()}
                onClick={ev => is_popoverMenu_align_open()
                    ? closePopoverMenu(popoverMenu_align_ref)
                    : openPopoverMenu(ev, popoverMenu_align_ref, { anchor: ev[_currentTarget] })
                }
            />
        </TextTooltip>
        <TextTooltip text="More action">
            <IconButton
                code={0xEAD9}
                focused={is_popoverMenu_moreAction_open()}
                onClick={ev => is_popoverMenu_moreAction_open()
                    ? closePopoverMenu(popoverMenu_moreAction_ref)
                    : openPopoverMenu(ev, popoverMenu_moreAction_ref, { anchor: ev[_currentTarget] })
                }
            />
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