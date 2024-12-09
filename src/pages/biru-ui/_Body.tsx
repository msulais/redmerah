import { createMemo, Match, Switch as SolidSwitch, type ParentComponent, type VoidComponent } from "solid-js"

import { Pages } from "./_enums"

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
		<h1>{props.title}</h1>
		<p>{props.description}</p>
		{props.children}
	</div>)
}

export const Playground: ParentComponent = (props) => {
	return (<div class={CSS.body_playground}>
		{props.children}
	</div>)
}

export const PlaygroundOptions: ParentComponent = (props) => {
	return (<div class={CSS.body_playground_options}>
		{props.children}
	</div>)
}

const _: VoidComponent<{
	page: Pages
}> = (props) => {
	const page = createMemo(() => props.page)
	return (<SolidSwitch>
		<Match when={page() == Pages.button        }><Button        /></Match>
		<Match when={page() == Pages.checkbox      }><CheckBox      /></Match>
		<Match when={page() == Pages.colorpicker   }><ColorPicker   /></Match>
		<Match when={page() == Pages.datepicker    }><DatePicker    /></Match>
		<Match when={page() == Pages.datetimepicker}><DateTimePicker/></Match>
		<Match when={page() == Pages.dialog        }><Dialog        /></Match>
		<Match when={page() == Pages.divider       }><Divider       /></Match>
		<Match when={page() == Pages.drawer        }><Drawer        /></Match>
		<Match when={page() == Pages.dropdown      }><Dropdown      /></Match>
		<Match when={page() == Pages.expander      }><Expander      /></Match>
		<Match when={page() == Pages.icon          }><Icon          /></Match>
		<Match when={page() == Pages.list          }><List          /></Match>
		<Match when={page() == Pages.menu          }><Menu          /></Match>
		<Match when={page() == Pages.modal         }><Modal         /></Match>
		<Match when={page() == Pages.popover       }><Popover       /></Match>
		<Match when={page() == Pages.textfield     }><TextField     /></Match>
		<Match when={page() == Pages.toast         }><Toast         /></Match>
		<Match when={page() == Pages.tooltip       }><Tooltip       /></Match>
		<Match when={page() == Pages.emoji         }><Emoji         /></Match>
		<Match when={page() == Pages.emojipicker   }><EmojiPicker   /></Match>
		<Match when={page() == Pages.switch        }><Switch        /></Match>
	</SolidSwitch>)
}

export default _