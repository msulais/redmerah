import { onMount as $mount, createSignal as $signal, type VoidComponent } from "solid-js"
import { createStore as $store } from "solid-js/store"

import type { Settings } from "./_types"
import { remove_splash_screen } from "@/scripts/splash"
import { ColorPickerMode, Commands } from "./_enums"

import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'
import { IDB, idb_store_put } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import type { HEXColor, HSLColor } from "@/types/color"
import { IDBStoreKeysLastInput, IDBStoreKeysSettings, IDBStoreNames, type IDBStoreSettings, type IDBStoreLastInput } from "./_storage"
import { hex_to_hsl, hsl_to_hex } from "@/utils/color"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { promise_done } from "@/utils/object"

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.color_picker)
	const [input, set_input] = $signal<HSLColor>({
		h: 0.3, s: 0.3, l: .33
	})
	const [settings, set_settings] = $store<Settings>({
		mode: ColorPickerMode.image
	})
	let timeout_savelastinput_id: number | null = null

	function init_database(): void {
		db.open({
			on_success() {
				init_settings()
				init_last_input()
			},
			on_upgrade_needed(_, db) {
				db.create_store<IDBStoreSettings>({
					name: IDBStoreNames.settings,
					key_path: 'key',
					indexs: ["key", 'value']
				})
				db.create_store<IDBStoreLastInput>({
					name: IDBStoreNames.last_input,
					key_path: 'key',
					indexs: ['key', 'value']
				})
			},
		})
	}

	function init_settings(): void {
		const store = db.read_store(IDBStoreNames.settings)
		if (!store) return

		promise_done(db.get<IDBStoreSettings<ColorPickerMode>>(
			store,
			IDBStoreKeysSettings.mode
		), (result) => set_settings('mode', m => result?.value ?? m))
	}

	function init_last_input(): void {
		const store = db.read_store(IDBStoreNames.last_input)
		if (!store) return

		promise_done(db.get<IDBStoreLastInput<HEXColor>>(
			store,
			IDBStoreKeysLastInput.hex_color
		), (result) => set_input(m => result? hex_to_hsl(result.value) : m))
	}

	function save_settings(...items: [key: IDBStoreKeysSettings, value: unknown][]): void {
		const store = db.write_store(IDBStoreNames.settings)
		if (!store) return;

		for (const item of items) {
			idb_store_put(store, {
				key: item[0],
				value: item[1]
			})
		}
	}

	function save_last_input(...items: [key: IDBStoreKeysLastInput, value: unknown][]): void {
		const store = db.write_store(IDBStoreNames.last_input)
		if (!store) return;

		for (const item of items) {
			idb_store_put(store, {
				key: item[0],
				value: item[1]
			})
		}
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
			case Commands.change_mode:{
				const [mode] = args as [ColorPickerMode]
				set_settings('mode', mode)
				save_settings([IDBStoreKeysSettings.mode, mode])
				break
			}
			case Commands.update_input: {
				const [input] = args as [HSLColor]
				set_input(input)
				if (timeout_savelastinput_id != null) {
					timeout_clear(timeout_savelastinput_id)
				}

				timeout_savelastinput_id = timeout_set(() => {
					save_last_input([IDBStoreKeysLastInput.hex_color, hsl_to_hex(input)])
					timeout_savelastinput_id = null
				}, 300)
			}
			default: return
		}
	}

	$mount(() => {
		remove_splash_screen()
		init_database()
	})

	return (<App
		appbar={<AppBar />}
		children={<Body
			command={command}
			settings={settings}
			input={input()}
		/>}
	/>)
}

export default _