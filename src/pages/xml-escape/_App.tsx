import { createStore } from "solid-js/store"
import { createSignal, onMount, type VoidComponent } from "solid-js"

import type { Settings } from "./_types"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreLastInput, type ObjectStoreSettings } from "./_storage"
import { Commands, TextTypes } from "./_enums"
import { DEFAULT_UNESCAPE_XML_TEXT } from "./_unescape-xml"
import { removeSplashScreen } from "@/utils/splash"
import { ICON_COPY } from "@/constants/icons"

import Icon from "@/components/Icon"
import Toast, { openToast } from "@/components/Toast"
import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.xmlEscape)
	const [unescapeText, setUnescapeText] = createSignal<string>('')
	const [escapeText, setEscapeText] = createSignal<string>('')
	const [settings, setSettings] = createStore<Settings>({
		textWrap: true,
		fontSize: 14
	})
	let toastCopiedRef: HTMLDivElement

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.settings)
		if (!store) return;

		for (const item of items) {
			store.put({ key: item[0], value: item[1] })
		}
	}

	function storeLastInput(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.lastInput)
		if (!store) return;

		for (const item of items) {
			store.put({ key: item[0], value: item[1] })
		}
	}

	function updateOutputAndSave(source: TextTypes): void {
		switch (source) {
		case TextTypes.escape: {
			setUnescapeText(
				escapeText()
				.replace(/&amp;/g, '&' )
				.replace(/&quot;/g, '"' )
				.replace(/&apos;/g, '\'')
				.replace(/&lt;/g, '<' )
				.replace(/&gt;/g, '>' )
			)
			break
		}
		case TextTypes.unescape: {
			setEscapeText(
				unescapeText()
				.replace(/&/g, '&amp;') // must first
				.replace(/'/g, '&apos;')
				.replace(/"/g, '&quot;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
			)
		}}

		storeLastInput([ObjectStoreKeys.lastInput_unescapeText, unescapeText()])
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.toggleTextWrap:
			setSettings('textWrap', t => !t)
			saveSettings([ObjectStoreKeys.settings_textWrap, settings.textWrap])
			break
		case Commands.updateFontSize: {
			const [fontSize] = args as [number]
			setSettings('fontSize', fontSize)
			saveSettings([ObjectStoreKeys.settings_fontSize, fontSize])
			break
		}
		case Commands.updateEscapeText: {
			const [text] = args as [string]
			setEscapeText(text)
			updateOutputAndSave(TextTypes.escape)
			break
		}
		case Commands.updatedUnescapeText: {
			const [text] = args as [string]
			setUnescapeText(text)
			updateOutputAndSave(TextTypes.unescape)
			break
		}
		case Commands.resetInputs:
			setUnescapeText(DEFAULT_UNESCAPE_XML_TEXT)
			updateOutputAndSave(TextTypes.unescape)
			break
		case Commands.copyAll: {
			const [type] = args as [TextTypes]
			let text = ''

			switch (type) {
			case TextTypes.escape:
				text = escapeText()
				break
			case TextTypes.unescape:
				text = unescapeText()
				break
			}

			navigator.clipboard.writeText(text)
			.then(() => openToast(toastCopiedRef))
			break
		}}
		return
	}

	function initSettings(): void {
		const store = db.readStore(ObjectStoreNames.settings)
		if (store === null) return

		db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_textWrap
		).then(result => setSettings('textWrap', t => result?.value ?? t))

		db.get<ObjectStoreSettings<number>>(
			store,
			ObjectStoreKeys.settings_fontSize
		).then(result => setSettings('fontSize', f => result?.value ?? f))
	}

	function initLastInput(): void {
		const store = db.readStore(ObjectStoreNames.lastInput)
		if (store === null) return

		db.get<ObjectStoreLastInput<string>>(
			store,
			ObjectStoreKeys.lastInput_unescapeText
		).then(result => {
			setUnescapeText(result?.value ?? DEFAULT_UNESCAPE_XML_TEXT)
			updateOutputAndSave(TextTypes.unescape)
		})
	}

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initSettings()
				initLastInput()
			},
			onError() {
				setUnescapeText(DEFAULT_UNESCAPE_XML_TEXT)
				updateOutputAndSave(TextTypes.unescape)
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
			Copied
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
			escapedText={escapeText()}
			unescapedText={unescapeText()}
		/>
		<Toasts/>
	</App>)
}

export default _