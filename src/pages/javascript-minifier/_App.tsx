import { createSignal, onMount, type VoidComponent } from "solid-js"
import { minify, type ECMA } from 'terser'
import beautify from 'js-beautify'

import type { Settings } from "./_types"
import { IDB, idbStorePut } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreLastInput, type ObjectStoreSettings } from "./_storage"
import { createStore } from "solid-js/store"
import { Commands, TextTypes } from "./_enums"
import { DEFAULT_JAVASCRIPT_INPUT_TEXT } from "./_javascript"
import { fileDownload, fileOpen, fileReadAsText } from "@/utils/file"
import { removeSplashScreen } from "@/scripts/splash"
import { promiseDone } from "@/utils/object"
import { arrayLength } from "@/utils/array"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { ICON_COPY, ICON_DOCUMENT_ERROR, ICON_SCAN_TEXT, ICON_WARNING } from "@/constants/icons"

import Icon from "@/components/Icon"
import Toast, { closeToast, openToast, ToastPosition } from "@/components/Toast"
import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.javascriptMinifier)
	const [inputText, setInputText] = createSignal<string>('')
	const [outputText, setOutputText] = createSignal<string>('')
	const [errorText, setErrorText] = createSignal<string>('')
	const [settings, setSettings] = createStore<Settings>({
		textWrap: true,
		fontSize: 14,
		minifyOptions: {
			beautify: false,
			ecma: 2015,
			ie8: true,
			keepClassNames: false,
			keepFunctionNames: false,
			module: false,
			safari10: true,
			topLevel: false
		}
	})
	let toastNoFileSelectedRef: HTMLDivElement
	let toastErrorReadingFilesRef: HTMLDivElement
	let toastCopiedRef: HTMLDivElement
	let toastCompileErrorRef: HTMLDivElement

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.settings)
		if (!store) return;

		for (const item of items) {
			idbStorePut(store, { key: item[0], value: item[1] })
		}
	}

	function storeLastInput(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.lastInput)
		if (!store) return;

		for (const item of items) {
			idbStorePut(store, { key: item[0], value: item[1] })
		}
	}

	function updateOutput(): void {
		const options = settings.minifyOptions
		promiseDone(
			minify(inputText(), {
				ecma: options.ecma,
				ie8: options.ie8,
				toplevel: options.topLevel,
				keep_classnames: options.keepClassNames,
				keep_fnames: options.keepFunctionNames,
				safari10: options.safari10,
				module: options.module
			}),
			(data) => {
				setOutputText(d => {
					let text = data.code ?? d
					if (options.beautify) {
						text = beautify(text)
					}
					return text
				})
				closeToast(toastCompileErrorRef)
			},
			(er) => {
				setErrorText(er + '')
				openToast(toastCompileErrorRef, {
					autoclose: false,
					position: ToastPosition.rightBottom
				})
			}
		)
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
		case Commands.updateInputText: {
			const [text] = args as [string]
			setInputText(text)
			storeLastInput([ObjectStoreKeys.lastInput_inputText, text])
			updateOutput()
			break
		}
		case Commands.resetInputs:
			setInputText(DEFAULT_JAVASCRIPT_INPUT_TEXT)
			storeLastInput(
				[ObjectStoreKeys.lastInput_inputText, DEFAULT_JAVASCRIPT_INPUT_TEXT],
			)
			updateOutput()
			break
		case Commands.openFile: {
			promiseDone(fileOpen('text/javascript', true), async (files) => {
				if (files == null || arrayLength(files as unknown as any[]) == 0) {
					openToast(toastNoFileSelectedRef)
					return
				}

				let text: string = ''
				try {
					for (let i = 0; i < arrayLength(files as unknown as any[]); i++) {
						if (i > 0) text += '\n\n'

						const file = files[i]
						text += await fileReadAsText(file)
					}
				} catch {
					openToast(toastErrorReadingFilesRef)
					return
				}

				setInputText(text)
				storeLastInput([ObjectStoreKeys.lastInput_inputText, text])
				updateOutput()
			})
			break
		}
		case Commands.copyAll: {
			const [type] = args as [TextTypes]
			let text = ''

			switch (type) {
			case TextTypes.input:
				text = inputText()
				break
			case TextTypes.output:
				text = outputText()
				break
			}

			promiseDone(
				navigatorClipboardWriteText(text),
				() => openToast(toastCopiedRef)
			)
			break
		}
		case Commands.downloadFile: {
			const [type] = args as [TextTypes]
			let text = ''
			let filename = ''
			switch (type) {
			case TextTypes.input:
				text = inputText()
				filename = 'source.js'
				break
			case TextTypes.output:
				text = outputText()
				filename = 'result.min.js'
				break
			}

			fileDownload(new Blob([text]), filename)
			break
		}
		case Commands.updateSupportIE8: {
			const [value] = args as [boolean]
			setSettings('minifyOptions', 'ie8', value)
			updateOutput()
			saveSettings([ObjectStoreKeys.settings_minifyIE8, value])
			break
		}
		case Commands.updateSupportSafari10: {
			const [value] = args as [boolean]
			setSettings('minifyOptions', 'safari10', value)
			updateOutput()
			saveSettings([ObjectStoreKeys.settings_minifySafari10, value])
			break
		}
		case Commands.updateModule: {
			const [value] = args as [boolean]
			setSettings('minifyOptions', 'module', value)
			updateOutput()
			saveSettings([ObjectStoreKeys.settings_minifyModule, value])
			break
		}
		case Commands.updateKeepClassNames: {
			const [value] = args as [boolean]
			setSettings('minifyOptions', 'keepClassNames', value)
			updateOutput()
			saveSettings([ObjectStoreKeys.settings_minifyKeepClassNames, value])
			break
		}
		case Commands.updateKeepFunctionNames: {
			const [value] = args as [boolean]
			setSettings('minifyOptions', 'keepFunctionNames', value)
			updateOutput()
			saveSettings([ObjectStoreKeys.settings_minifyKeepFunctionNames, value])
			break
		}
		case Commands.updateTopLevel: {
			const [value] = args as [boolean]
			setSettings('minifyOptions', 'topLevel', value)
			updateOutput()
			saveSettings([ObjectStoreKeys.settings_minifyToplevel, value])
			break
		}
		case Commands.updateBeautify: {
			const [value] = args as [boolean]
			setSettings('minifyOptions', 'beautify', value)
			updateOutput()
			saveSettings([ObjectStoreKeys.settings_minifyBeautify, value])
			break
		}
		case Commands.updateEcma: {
			const [value] = args as [ECMA]
			setSettings('minifyOptions', 'ecma', value)
			updateOutput()
			saveSettings([ObjectStoreKeys.settings_minifyEcma, value])
			break
		}}
		return
	}

	function initSettings(): void {
		const store = db.readStore(ObjectStoreNames.settings)
		if (store == null) return

		promiseDone(db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_textWrap
		),  result => setSettings('textWrap', t => result?.value ?? t))

		promiseDone(db.get<ObjectStoreSettings<number>>(
			store,
			ObjectStoreKeys.settings_fontSize
		), result => setSettings('fontSize', f => result?.value ?? f))

		promiseDone(db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_minifyBeautify
		), result => setSettings('minifyOptions', 'beautify', f => result?.value ?? f))

		promiseDone(db.get<ObjectStoreSettings<ECMA>>(
			store,
			ObjectStoreKeys.settings_minifyEcma
		), result => setSettings('minifyOptions', 'ecma', f => result?.value ?? f))

		promiseDone(db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_minifyModule
		), result => setSettings('minifyOptions', 'module', f => result?.value ?? f))

		promiseDone(db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_minifyToplevel
		), result => setSettings('minifyOptions', 'topLevel', f => result?.value ?? f))

		promiseDone(db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_minifyIE8
		), result => setSettings('minifyOptions', 'ie8', f => result?.value ?? f))

		promiseDone(db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_minifyKeepClassNames
		), result => setSettings('minifyOptions', 'keepClassNames', f => result?.value ?? f))

		promiseDone(db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_minifyKeepFunctionNames
		), result => setSettings('minifyOptions', 'keepFunctionNames', f => result?.value ?? f))

		promiseDone(db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_minifySafari10
		), result => setSettings('minifyOptions', 'safari10', f => result?.value ?? f))
	}

	function initLastInput(): void {
		const store = db.readStore(ObjectStoreNames.lastInput)
		if (store == null) return

		promiseDone(db.get<ObjectStoreLastInput<string>>(
			store,
			ObjectStoreKeys.lastInput_inputText
		), result => {
			setInputText(result?.value ?? DEFAULT_JAVASCRIPT_INPUT_TEXT)
			updateOutput()
		})
	}

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initSettings()
				initLastInput()
			},
			onError() {
				setInputText(DEFAULT_JAVASCRIPT_INPUT_TEXT)
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
			Copied
		</Toast>
		<Toast
			ref={r => toastCompileErrorRef = r}
			c:leading={<Icon c:code={ICON_WARNING}/>}>
			{errorText()}
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
			inputText={inputText()}
			outputText={outputText()}
		/>
		<Toasts/>
	</App>)
}

export default _