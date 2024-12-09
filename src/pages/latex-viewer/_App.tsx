import { onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types";
import { IDB, idb_store_put } from "@/utils/indexeddb";
import { DatabaseNames } from "@/enums/storage";
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreLastInput, type ObjectStoreSettings } from "./_storage";
import { createStore } from "solid-js/store";
import { Commands } from "./_enums";
import { DEFAULT_LATEX_TEXT } from "./_latex";
import { remove_splash_screen } from "@/scripts/splash";
import { array_join, array_map, array_slice } from "@/utils/array";
import { navigator_clipboard_writetext } from "@/utils/navigator";
import { promise_done } from "@/utils/object";

import Icon from "@/components/Icon";
import Toast, { open_toast } from "@/components/Toast";
import App from "@/components/App";
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.latex_viewer)
	const [latex, set_latex] = createStore<string[]>([DEFAULT_LATEX_TEXT])
	const [settings, set_settings] = createStore<Settings>({
		text_wrap: true,
		font_size: 14,
		suffix: '\\]',
		prefix: '\\['
	})
	let toast_copied_ref: HTMLDivElement

	function save_settings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_settings = db.write_store(ObjectStoreNames.settings)
		if (!store_settings) return;

		for (const item of items) {
			idb_store_put(store_settings, {
				key: item[0],
				value: item[1]
			})
		}
	}

	function save_last_input(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_lastinput = db.write_store(ObjectStoreNames.last_input)
		if (!store_lastinput) return;

		for (const item of items) {
			idb_store_put(store_lastinput, {
				key: item[0],
				value: item[1]
			})
		}
	}

	function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
		case Commands.add_equation: {
			const index = args[0] as number
			set_latex(prev => [...array_slice(prev, 0, index), '', ...array_slice(prev, index)])
			save_last_input([ObjectStoreKeys.lastInput_latex, [...latex]])
			break
		}
		case Commands.delete_equation: {
			const index = args[0] as number
			set_latex(prev => [...array_slice(prev, 0, index), ...array_slice(prev, index + 1)])
			save_last_input([ObjectStoreKeys.lastInput_latex, [...latex]])
			break
		}
		case Commands.toggle_textwrap: {
			set_settings('text_wrap', t => !t)
			save_settings([ObjectStoreKeys.settings_textwrap, settings.text_wrap])
			break
		}
		case Commands.change_fontsize: {
			set_settings('font_size', args[0] as number)
			save_settings([ObjectStoreKeys.settings_fontsize, settings.font_size])
			break
		}
		case Commands.change_prefix: {
			const prefix = args[0] as string
			set_settings('prefix', prefix)
			save_settings([ObjectStoreKeys.settings_prefix, settings.prefix])
			break
		}
		case Commands.change_suffix: {
			const suffix = args[0] as string
			set_settings('suffix', suffix)
			save_settings([ObjectStoreKeys.settings_suffix, settings.suffix])
			break
		}
		case Commands.update_latex_input: {
			const text = args[0] as string
			const index = args[1] as number
			set_latex(index, text)
			save_last_input([ObjectStoreKeys.lastInput_latex, [...latex]])
			break
		}
		case Commands.reset_inputs: {
			set_latex([''])
			save_last_input([ObjectStoreKeys.lastInput_latex, ['']])
			break
		}
		case Commands.copy_all: {
			const event = args[0] as Event
			promise_done(
				navigator_clipboard_writetext(
					array_join(array_map(latex, l => settings.prefix + l + settings.suffix), '\n\n')
				),
				() => open_toast(event, toast_copied_ref)
			)
			break
		}
		default: return
	}}

	function init_settings(): void {
		const store_settings = db.read_store(ObjectStoreNames.settings)
		if (store_settings == null) return

		promise_done(db.get<ObjectStoreSettings<boolean>>(
			store_settings,
			ObjectStoreKeys.settings_textwrap
		), result => set_settings('text_wrap', t => result?.value ?? t))

		promise_done(db.get<ObjectStoreSettings<number>>(
			store_settings,
			ObjectStoreKeys.settings_fontsize
		), result => set_settings('font_size', f => result?.value ?? f))

		promise_done(db.get<ObjectStoreSettings<string>>(
			store_settings,
			ObjectStoreKeys.settings_prefix
		), result => set_settings('prefix', p => result?.value ?? p))

		promise_done(db.get<ObjectStoreSettings<string>>(
			store_settings,
			ObjectStoreKeys.settings_suffix
		), result => set_settings('suffix', s => result?.value ?? s))
	}

	function init_last_input(): void {
		const store_lastinput = db.read_store(ObjectStoreNames.last_input)
		if (store_lastinput == null) return

		promise_done(db.get<ObjectStoreLastInput<string[]>>(
			store_lastinput,
			ObjectStoreKeys.lastInput_latex
		), result => set_latex(result?.value ??[DEFAULT_LATEX_TEXT]))
	}

	function init_database(): void {
		db.open({
			on_success() {
				init_settings()
				init_last_input()
			},
			on_error() {
				set_latex([DEFAULT_LATEX_TEXT])
			},
			on_upgrade_needed(_, db) {
				db.create_store({
					name: ObjectStoreNames.settings,
					key_path: 'key',
					indexs: ['key', 'value']
				})
				db.create_store({
					name: ObjectStoreNames.last_input,
					key_path: 'key',
					indexs: ['key', 'value']
				})
			}
		})
	}

	onMount(() => {
		init_database()
		remove_splash_screen()
	})

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toast_copied_ref = r}
			leading={<Icon code={0xE51B}/>}>
			Copied to clipboard
		</Toast>
	</>)

	return (<App
		appbar={<AppBar
			settings={settings}
			command={command}
		/>}>
		<Body
			settings={settings}
			command={command}
			latex={latex}
		/>
		<Toasts/>
	</App>)
}

export default _