import { Match, Switch as SolidSwitch, type ParentComponent, type VoidComponent } from "solid-js"

import { Pages } from "./_enums"
import { _bottom, _button, _checkBox, _children, _colorPicker, _datePicker, _dateTimePicker, _description, _dialog, _divider, _drawer, _dropdown, _expander, _filled, _tonal, _icon, _left, _list, _menu, _modal, _outlined, _page, _popover, _right, _textField, _title, _toast, _top, _transparent, _tooltip, _emoji, _emojiPicker, _switch } from "@/constants/string"

import CSS from './_styles.module.scss'
import Button from "./components/_Button"
import CheckBox from "./components/_CheckBox"
import ColorPicker from "./components/_ColorPicker"
import DatePicker from "./components/_DatePicker"
import DateTimePicker from "./components/_DateTimePicker"
import Dialog from "./components/_Dialog"
import Divider from './components/_Divider'
import Drawer from './components/_Drawer'
import Dropdown from './components/_Dropdown'
import Expander from './components/_Expander'
import Icon from './components/_Icon'
import List from './components/_List'
import Menu from './components/_Menu'
import Modal from './components/_Modal'
import Popover from './components/_Popover'
import TextField from './components/_TextField'
import Toast from './components/_Toast'
import Tooltip from './components/_Tooltip'
import Emoji from './components/_Emoji'
import EmojiPicker from './components/_EmojiPicker'
import Switch from './components/_Switch'

export const Page: ParentComponent<{
    title: string
    description: string
}> = (props) => {
    return (<div class={CSS.body_page}>
        <h1>{props[_title]}</h1>
        <p>{props[_description]}</p>
        {props[_children]}
    </div>)
}

export const Playground: ParentComponent = (props) => {
    return (<div class={CSS.body_playground}>
        {props[_children]}
    </div>)
}

export const PlaygroundOptions: ParentComponent = (props) => {
    return (<div class={CSS.body_playground_options}>
        {props[_children]}
    </div>)
}

const _: VoidComponent<{
    page: Pages
}> = (props) => {
    return (<SolidSwitch>
        <Match when={props[_page] == Pages[_button        ]}><Button        /></Match>
        <Match when={props[_page] == Pages[_checkBox      ]}><CheckBox      /></Match>
        <Match when={props[_page] == Pages[_colorPicker   ]}><ColorPicker   /></Match>
        <Match when={props[_page] == Pages[_datePicker    ]}><DatePicker    /></Match>
        <Match when={props[_page] == Pages[_dateTimePicker]}><DateTimePicker/></Match>
        <Match when={props[_page] == Pages[_dialog        ]}><Dialog        /></Match>
        <Match when={props[_page] == Pages[_divider       ]}><Divider       /></Match>
        <Match when={props[_page] == Pages[_drawer        ]}><Drawer        /></Match>
        <Match when={props[_page] == Pages[_dropdown      ]}><Dropdown      /></Match>
        <Match when={props[_page] == Pages[_expander      ]}><Expander      /></Match>
        <Match when={props[_page] == Pages[_icon          ]}><Icon          /></Match>
        <Match when={props[_page] == Pages[_list          ]}><List          /></Match>
        <Match when={props[_page] == Pages[_menu          ]}><Menu          /></Match>
        <Match when={props[_page] == Pages[_modal         ]}><Modal         /></Match>
        <Match when={props[_page] == Pages[_popover       ]}><Popover       /></Match>
        <Match when={props[_page] == Pages[_textField     ]}><TextField     /></Match>
        <Match when={props[_page] == Pages[_toast         ]}><Toast         /></Match>
        <Match when={props[_page] == Pages[_tooltip       ]}><Tooltip       /></Match>
        <Match when={props[_page] == Pages[_emoji         ]}><Emoji         /></Match>
        <Match when={props[_page] == Pages[_emojiPicker   ]}><EmojiPicker   /></Match>
        <Match when={props[_page] == Pages[_switch        ]}><Switch        /></Match>
    </SolidSwitch>)
}

export default _