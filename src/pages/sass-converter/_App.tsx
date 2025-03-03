import { createSignal, onMount, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"
import { compileString } from 'sass'

import type { Settings } from "./_types"
import { removeSplashScreen } from "@/utils/splash"
import { Commands, InputViewOption } from "./_enums"
import { fileOpen, fileReadAsText, fileDownload } from "@/utils/file"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreSettings, type ObjectStoreLastInput } from "./_storage"
import { DatabaseNames } from "@/enums/storage"
import { DEFAULT_INPUT_VIEW_OPTION, DEFAULT_SASS_INPUT, DEFAULT_SCSS_INPUT } from "./_constants"
import { IDB } from "@/utils/indexeddb"
import { ICON_COPY, ICON_DOCUMENT_ERROR, ICON_SCAN_TEXT } from "@/constants/icons"

import Icon from "@/components/Icon"
import Toast, { openToast } from "@/components/Toast"
import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.sassConverter)
	const [cssText, setCSSText] = createSignal<string>('')
	const [sassText, setSASSText] = createSignal<string>(DEFAULT_SASS_INPUT)
	const [scssText, setSCSSText] = createSignal<string>(DEFAULT_SCSS_INPUT)
	const [settings, setSettings] = createStore<Settings>({
		fontSize: 14,
		textWrap: true,
		minify: false
	})
	let inputViewOption: InputViewOption = DEFAULT_INPUT_VIEW_OPTION
	let toastNoFileSelectedRef: HTMLDivElement
	let toastErrorReadingFilesRef: HTMLDivElement
	let toastCopiedRef: HTMLDivElement

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.settings)
		if (!store) return;

		for (const item of items) {
			store.put({ key: item[0], value: item[1] })
		}
	}

	function saveLastInput(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.lastInput)
		if (!store) return;

		for (const item of items) {
			store.put({ key: item[0], value: item[1] })
		}
	}

	function updateOutput(): void {
		const text = inputViewOption == InputViewOption.sass? sassText() : scssText()
		let output = ''
		try {
			output = compileString(text, {
				style: settings.minify? 'compressed' : 'expanded',
				syntax: inputViewOption == InputViewOption.sass? 'indented' : 'scss',
			}).css
		} catch { output = ''}

		setCSSText(output)
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.toggleTextWrap:
			setSettings('textWrap', t => !t)
			saveSettings([ObjectStoreKeys.settings_textWrap, settings.textWrap])
			break
		case Commands.updateFontSize:{
			const [fontSize] = args as [number]
			setSettings('fontSize', fontSize)
			saveSettings([ObjectStoreKeys.settings_fontSize, settings.fontSize])
			break
		}
		case Commands.updateSCSSText:{
			const [text] = args as [string]
			setSCSSText(text)
			saveLastInput([ObjectStoreKeys.lastInput_scss, text])
			updateOutput()
			break
		}
		case Commands.updateSASSText: {
			const [text] = args as [string]
			setSASSText(text)
			saveLastInput([ObjectStoreKeys.lastInput_sass, text])
			updateOutput()
			break
		}
		case Commands.resetInputs:
			setSCSSText(DEFAULT_SCSS_INPUT)
			setSASSText(DEFAULT_SASS_INPUT)
			saveLastInput(
				[ObjectStoreKeys.lastInput_sass, DEFAULT_SASS_INPUT],
				[ObjectStoreKeys.lastInput_scss, DEFAULT_SCSS_INPUT]
			)
			updateOutput()
			break
		case Commands.openFile:
			fileOpen('text/*', true).then(async (files) => {
				if (files == null || files.length == 0) {
					openToast(toastNoFileSelectedRef)
					return
				}

				let text: string = ''
				try {
					for (let i = 0; i < files.length; i++) {
						if (i > 0) text += '\n\n'

						const file = files[i]
						text += await fileReadAsText(file)
					}
				} catch {
					openToast(toastErrorReadingFilesRef)
					return
				}

				if (inputViewOption == InputViewOption.sass) {
					setSASSText(text)
					saveLastInput([ObjectStoreKeys.lastInput_sass, text])
				}
				else if (inputViewOption == InputViewOption.scss) {
					setSCSSText(text)
					saveLastInput([ObjectStoreKeys.lastInput_scss, text])
				}
				updateOutput()
			})
			break
		case Commands.copyAll: {
			const [type] = args as ['sass' | 'scss' | 'css']
			let text = ''
			if (type == 'sass') text = sassText()
			else if (type == 'scss') text = scssText()
			else if (type == 'css') text = cssText()

			navigator.clipboard.writeText(text).then(() => openToast(toastCopiedRef))
			break
		}
		case Commands.downloadFile: {
			const [type] = args as ['sass' | 'scss' | 'css']
			let text = ''
			let filename = ''
			if (type == 'sass') text = sassText(), filename = 'syntactically-awesome-style-sheets.sass'
			else if (type == 'scss') text = scssText(), filename = 'sassy-cascading-style-sheets.scss'
			else if (type == 'css') text = cssText(), filename = 'cascading-style-sheets.css'

			fileDownload(new Blob([text]), filename)
			break
		}
		case Commands.changeInputViewOption: {
			const [option] = args as [InputViewOption]
			inputViewOption = option
			updateOutput()
			break
		}
		case Commands.toggleMinify:
			setSettings('minify', t => !t)
			saveSettings([ObjectStoreKeys.settings_minify, settings.minify])
			updateOutput()
		}
		return
	}

	function initSettings(): void {
		const storeSettings = db.readStore(ObjectStoreNames.settings)
		if (storeSettings == null) return

		db.get<ObjectStoreSettings<boolean>>(
			storeSettings,
			ObjectStoreKeys.settings_textWrap
		).then(result => setSettings('textWrap', w => result?.value ?? w))

		db.get<ObjectStoreSettings<number>>(
			storeSettings,
			ObjectStoreKeys.settings_fontSize
		).then(result => setSettings('fontSize', d => result?.value ?? d))

		db.get<ObjectStoreSettings<boolean>>(
			storeSettings,
			ObjectStoreKeys.settings_minify
		).then(result => setSettings('minify', m => result?.value ?? m))
	}

	function initLastInputs(): void {
		const storeLastInput = db.readStore(ObjectStoreNames.lastInput)
		if (storeLastInput == null) return

		db.get<ObjectStoreLastInput<string>>(
			storeLastInput,
			ObjectStoreKeys.lastInput_scss
		).then(result => setSCSSText(result?.value ?? DEFAULT_SCSS_INPUT))

		db.get<ObjectStoreLastInput<string>>(
			storeLastInput,
			ObjectStoreKeys.lastInput_sass
		).then(result => {
			setSASSText(result?.value ?? DEFAULT_SASS_INPUT)
			updateOutput() // SASS is the default view
		})
	}

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initSettings()
				initLastInputs()
			},
			onError() {
				setSASSText(DEFAULT_SASS_INPUT)
				setSCSSText(DEFAULT_SCSS_INPUT)
				updateOutput()
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
			ref={r => toastNoFileSelectedRef = r}
			c:leading={<Icon c:code={ICON_DOCUMENT_ERROR}/>}>
			No file selected
		</Toast>
		<Toast
			ref={r => toastErrorReadingFilesRef = r}
			c:leading={<Icon c:code={ICON_SCAN_TEXT}/>}>
			Error reading files
		</Toast>
		<Toast
			ref={r => toastCopiedRef = r}
			c:leading={<Icon c:code={ICON_COPY}/>}>
			Copied to clipboard
		</Toast>
	</>)

	return (<App
		c:appBar={<AppBar
			command={command}
			settings={settings}
		/>}>
		<Body
			command={command}
			cssText={cssText()}
			sassText={sassText()}
			scssText={scssText()}
			settings={settings}
		/>
		<Toasts/>
	</App>)
}

export default _