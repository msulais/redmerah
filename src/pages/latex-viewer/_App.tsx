import { onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreLastInput, type ObjectStoreSettings } from "./_storage"
import { createStore } from "solid-js/store"
import { Commands } from "./_enums"
import { DEFAULT_LATEX_TEXT } from "./_latex"
import { removeSplashScreen } from "@/utils/splash"
import { ICON_COPY } from "@/constants/icons"

import Icon from "@/components/Icon"
import Toast, { openToast } from "@/components/Toast"
import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.latexViewer)
	const [latex, setLatex] = createStore<string[]>([DEFAULT_LATEX_TEXT])
	const [settings, setSettings] = createStore<Settings>({
		textWrap: true,
		fontSize: 14,
		suffix: '\\]',
		prefix: '\\['
	})
	let toastCopiedRef: HTMLDivElement

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.settings)
		if (!store) return;

		for (const item of items) {
			store.put({
				key: item[0],
				value: item[1]
			})
		}
	}

	function saveLastInput(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.lastInput)
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
		case Commands.addEquation: {
			const [index] = args as [number]
			setLatex(prev => [...prev.slice(0, index), '', ...prev.slice(index)])
			saveLastInput([ObjectStoreKeys.lastInput_latex, [...latex]])
			break
		}
		case Commands.deleteEquation: {
			const [index] = args as [number]
			setLatex(prev => [...prev.slice(0, index), ...prev.slice(index + 1)])
			saveLastInput([ObjectStoreKeys.lastInput_latex, [...latex]])
			break
		}
		case Commands.toggleTextWrap:
			setSettings('textWrap', t => !t)
			saveSettings([ObjectStoreKeys.settings_textWrap, settings.textWrap])
			break
		case Commands.updateFontSize: {
			const [fontSize] = args as [number]
			setSettings('fontSize', fontSize)
			saveSettings([ObjectStoreKeys.settings_fontSize, settings.fontSize])
			break
		}
		case Commands.updatePrefix: {
			const [prefix] = args as [string]
			setSettings('prefix', prefix)
			saveSettings([ObjectStoreKeys.settings_prefix, settings.prefix])
			break
		}
		case Commands.updateSuffix: {
			const [suffix] = args as [string]
			setSettings('suffix', suffix)
			saveSettings([ObjectStoreKeys.settings_suffix, settings.suffix])
			break
		}
		case Commands.updateLatexInput: {
			const [text, index] = args as [string, number]
			setLatex(index, text)
			saveLastInput([ObjectStoreKeys.lastInput_latex, [...latex]])
			break
		}
		case Commands.resetInputs:
			setLatex([''])
			saveLastInput([ObjectStoreKeys.lastInput_latex, ['']])
			break
		case Commands.copyAll: {
			navigator.clipboard.writeText(
				latex.map(l => settings.prefix + l + settings.suffix).join('\n\n')
			).then(() => openToast(toastCopiedRef))
			break
		}
		default: return
	}}

	function initSettings(): void {
		const store = db.readStore(ObjectStoreNames.settings)
		if (store == null) return

		db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_textWrap
		).then(result => setSettings('textWrap', t => result?.value ?? t))

		db.get<ObjectStoreSettings<number>>(
			store,
			ObjectStoreKeys.settings_fontSize
		).then(result => setSettings('fontSize', f => result?.value ?? f))

		db.get<ObjectStoreSettings<string>>(
			store,
			ObjectStoreKeys.settings_prefix
		).then(result => setSettings('prefix', p => result?.value ?? p))

		db.get<ObjectStoreSettings<string>>(
			store,
			ObjectStoreKeys.settings_suffix
		).then(result => setSettings('suffix', s => result?.value ?? s))
	}

	function initLastInput(): void {
		const store_lastinput = db.readStore(ObjectStoreNames.lastInput)
		if (store_lastinput == null) return

		db.get<ObjectStoreLastInput<string[]>>(
			store_lastinput,
			ObjectStoreKeys.lastInput_latex
		).then(result => setLatex(result?.value ??[DEFAULT_LATEX_TEXT]))
	}

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initSettings()
				initLastInput()
			},
			onError() {
				setLatex([DEFAULT_LATEX_TEXT])
			},
			onUpgrade(_, db) {
				db.createStore({
					name: ObjectStoreNames.settings,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
				db.createStore({
					name: ObjectStoreNames.lastInput,
					keyPath: 'key',
					indexs: ['key', 'value']
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
			ref={r => toastCopiedRef = r}
			c:leading={<Icon c:code={ICON_COPY}/>}>
			Copied to clipboard
		</Toast>
	</>)

	return (<App
		c:appBar={<AppBar
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