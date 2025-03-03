import { onMount, createSignal, type VoidComponent } from "solid-js"
import { createStore as $store } from "solid-js/store"

import type { Settings } from "./_types"
import { removeSplashScreen } from "@/utils/splash"
import { ColorPickerMode, Commands } from "./_enums"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import type { HEXColor, HSLColor } from "@/types/color"
import { IDBStoreKeysLastInput, IDBStoreKeysSettings, IDBStoreNames, type IDBStoreSettings, type IDBStoreLastInput } from "./_storage"
import { colorHexToHsl, colorHslToHex } from "@/utils/color"

import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.colorPicker)
	const [input, setInput] = createSignal<HSLColor>({
		h: 0.3, s: 0.3, l: .33
	})
	const [settings, setSettings] = $store<Settings>({
		mode: ColorPickerMode.image
	})
	let timeSaveLastInputId: number | NodeJS.Timeout | null = null

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initSettings()
				initLastInput()
			},
			onUpgrade(_, db) {
				db.createStore<IDBStoreSettings>({
					name: IDBStoreNames.settings,
					keyPath: 'key',
					indexs: ["key", 'value']
				})
				db.createStore<IDBStoreLastInput>({
					name: IDBStoreNames.lastInput,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
			},
		})
	}

	function initSettings(): void {
		const store = db.readStore(IDBStoreNames.settings)
		if (!store) return

		db.get<IDBStoreSettings<ColorPickerMode>>(
			store,
			IDBStoreKeysSettings.mode
		).then((result) => setSettings('mode', m => result?.value ?? m))
	}

	function initLastInput(): void {
		const store = db.readStore(IDBStoreNames.lastInput)
		if (!store) return

		db.get<IDBStoreLastInput<HEXColor>>(
			store,
			IDBStoreKeysLastInput.hexColor
		).then((result) => setInput(m => result? colorHexToHsl(result.value) : m))
	}

	function saveSettings(...items: [key: IDBStoreKeysSettings, value: unknown][]): void {
		const store = db.writeStore(IDBStoreNames.settings)
		if (!store) return;

		for (const item of items) {
			store.put({
				key: item[0],
				value: item[1]
			})
		}
	}

	function saveLastInput(...items: [key: IDBStoreKeysLastInput, value: unknown][]): void {
		const store = db.writeStore(IDBStoreNames.lastInput)
		if (!store) return;

		for (const item of items) {
			store.put({
				key: item[0],
				value: item[1]
			})
		}
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.updateMode:{
			const [mode] = args as [ColorPickerMode]
			setSettings('mode', mode)
			saveSettings([IDBStoreKeysSettings.mode, mode])
			break
		}
		case Commands.updateInput: {
			const [input] = args as [HSLColor]
			setInput(input)
			if (timeSaveLastInputId != null) {
				clearTimeout(timeSaveLastInputId)
			}

			timeSaveLastInputId = setTimeout(() => {
				saveLastInput([IDBStoreKeysLastInput.hexColor, colorHslToHex(input)])
				timeSaveLastInputId = null
			}, 200)
			break
		}}
		return
	}

	onMount(() => {
		removeSplashScreen()
		initDatabase()
	})

	return (<App
		c:appBar={<AppBar />}
		children={<Body
			command={command}
			settings={settings}
			input={input()}
		/>}
	/>)
}

export default _