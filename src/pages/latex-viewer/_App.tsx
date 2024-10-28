import { onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types";
import { _latexViewer, _writeObjectStore, _settings, _forEach, _put, _lastInput, _textWrap, _fontSize, _clipboard, _writeText, _join, _then, _readObjectStore, _get, _value, _open, _createObjectStore, _key, _slice, _map, _prefix, _suffix } from "@/constants/string";
import { IDB } from "@/utils/indexeddb";
import { DatabaseNames } from "@/enums/storage";
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreLastInput, type ObjectStoreSettings } from "./_storage";
import { createStore } from "solid-js/store";
import { Commands } from "./_enums";
import { defaultLatexText } from "./_latex";
import { getNavigator } from "@/constants/window"
import { removeSplashScreen } from "@/scripts/splash";

import Icon from "@/components/Icon";
import Toast, { openToast } from "@/components/Toast";
import App from "@/components/App";
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames[_latexViewer])
	const [latex, setLatex] = createStore<string[]>([defaultLatexText])
	const [settings, setSettings] = createStore<Settings>({
		textWrap: true,
		fontSize: 14,
		suffix: '\\]',
		prefix: '\\['
	})
	let toast_copied_ref: HTMLDivElement

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_settings = db[_writeObjectStore](ObjectStoreNames[_settings])
		if (!store_settings) return;

		items[_forEach](item => store_settings[_put]({
			key: item[0],
			value: item[1]
		}))
	}

	function saveLastInput(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_lastInput = db[_writeObjectStore](ObjectStoreNames[_lastInput])
		if (!store_lastInput) return;

		items[_forEach](item => store_lastInput[_put]({
			key: item[0],
			value: item[1]
		}))
	}

	function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
		case Commands.add_equation: {
			const index = args[0] as number
			setLatex(prev => [...prev[_slice](0, index), '', ...prev[_slice](index)])
			saveLastInput([ObjectStoreKeys.lastInput_latex, [...latex]])
			break
		}
		case Commands.delete_equation: {
			const index = args[0] as number
			setLatex(prev => [...prev[_slice](0, index), ...prev[_slice](index + 1)])
			saveLastInput([ObjectStoreKeys.lastInput_latex, [...latex]])
			break
		}
		case Commands.toggle_textWrap: {
			setSettings(_textWrap, t => !t)
			saveSettings([ObjectStoreKeys.settings_textWrap, settings[_textWrap]])
			break
		}
		case Commands.change_fontSize: {
			setSettings(_fontSize, args[0] as number)
			saveSettings([ObjectStoreKeys.settings_fontSize, settings[_fontSize]])
			break
		}
		case Commands.change_prefix: {
			const prefix = args[0] as string
			setSettings(_prefix, prefix)
			saveSettings([ObjectStoreKeys.settings_prefix, settings[_prefix]])
			break
		}
		case Commands.change_suffix: {
			const suffix = args[0] as string
			setSettings(_suffix, suffix)
			saveSettings([ObjectStoreKeys.settings_suffix, settings[_prefix]])
			break
		}
		case Commands.update_latex_input: {
			const text = args[0] as string
			const index = args[1] as number
			setLatex(index, text)
			saveLastInput([ObjectStoreKeys.lastInput_latex, [...latex]])
			break
		}
		case Commands.reset_inputs: {
			setLatex([''])
			saveLastInput([ObjectStoreKeys.lastInput_latex, ['']])
			break
		}
		case Commands.copy_all: {
			const event = args[0] as Event
			getNavigator()
			[_clipboard]
			[_writeText](latex[_map](l => settings[_prefix] + l + settings[_suffix])[_join]('\n\n'))
			[_then](() => openToast(event, toast_copied_ref))
			break
		}
		default: return
	}}

	function initSettings(): void {
		const store_settings = db[_readObjectStore](ObjectStoreNames[_settings])
		if (store_settings == null) return

		db[_get]<ObjectStoreSettings<boolean>>(store_settings, ObjectStoreKeys.settings_textWrap)[_then](
			result => setSettings(_textWrap, defaultValue => result? result[_value] : defaultValue)
		)
		db[_get]<ObjectStoreSettings<number>>(store_settings, ObjectStoreKeys.settings_fontSize)[_then](
			result => setSettings(_fontSize, defaultValue => result? result[_value] : defaultValue)
		)
		db[_get]<ObjectStoreSettings<string>>(store_settings, ObjectStoreKeys.settings_prefix)[_then](
			result => setSettings(_prefix, defaultValue => result? result[_value] : defaultValue)
		)
		db[_get]<ObjectStoreSettings<string>>(store_settings, ObjectStoreKeys.settings_suffix)[_then](
			result => setSettings(_suffix, defaultValue => result? result[_value] : defaultValue)
		)
	}

	function initLastInputs(): void {
		const store_lastInput = db[_readObjectStore](ObjectStoreNames[_lastInput])
		if (store_lastInput == null) return

		db[_get]<ObjectStoreLastInput<string[]>>(store_lastInput, ObjectStoreKeys.lastInput_latex)[_then](
			result => {
				setLatex(result == undefined? [defaultLatexText] : result[_value])
			}
		)
	}

	function initDatabase(): void {
		db[_open]({
			onSuccess(_ev, _db) {
				initSettings()
				initLastInputs()
			},
			onError() {
				setLatex([defaultLatexText])
			},
			onUpgradeNeeded(_, db) {
				db[_createObjectStore]({
					name: ObjectStoreNames[_settings],
					keyPath: _key,
					indexs: [_key, _value]
				})
				db[_createObjectStore]({
					name: ObjectStoreNames[_lastInput],
					keyPath: _key,
					indexs: [_key, _value]
				})
			}
		})
	}

	onMount(() => {
		initDatabase()
		removeSplashScreen()
	})

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toast_copied_ref = r}
			leading={<Icon code={0xE51B}/>}>
			Copied to clipboard
		</Toast>
	</>)

	return (<App
		appBar={<AppBar
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