import { createSignal, onMount, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"
import { compileString } from 'sass'

import type { Settings } from "./_types"
import { _splash, _animate, _spring, _finished, _then, _remove, _sassConverter, _clipboard, _createObjectStore, _css, _fontSize, _get, _html, _key, _lastInput, _length, _markdown, _open, _put, _readObjectStore, _settings, _textWrap, _value, _writeObjectStore, _writeText, _sass, _expanded, _compressed, _minify, _compileString, _scss, _indented } from "@/constants/string"
import { AnimationEffectTiming } from "@/enums/animation"
import { ElementIds } from "@/enums/ids"
import { getElementById } from "@/utils/element"
import { setMicrotask } from "@/utils/timeout"
import { getNavigator } from "@/constants/window"
import { Commands, InputViewOption } from "./_enums"
import { openFile, readFileAsText, downloadFile } from "@/utils/file"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreSettings, type ObjectStoreLastInput } from "./_storage"
import { DatabaseNames } from "@/enums/storage"
import { DEFAULT_INPUT_VIEW_OPTION, DEFAULT_SASS_INPUT, DEFAULT_SCSS_INPUT } from "./_constants"
import { IDB } from "@/utils/indexeddb"

import Icon from "@/components/Icon"
import Toast, { openToast } from "@/components/Toast"
import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames[_sassConverter])
	const [cssText, setCSSText] = createSignal<string>('')
	const [sassText, setSassText] = createSignal<string>(DEFAULT_SASS_INPUT)
	const [scssText, setScssText] = createSignal<string>(DEFAULT_SCSS_INPUT)
	const [settings, setSettings] = createStore<Settings>({
		fontSize: 14,
		textWrap: true,
		minify: false
	})
	let inputViewOption: InputViewOption = DEFAULT_INPUT_VIEW_OPTION
	let toast_noFileSelected_ref: HTMLDivElement
	let toast_errorReadingFiles_ref: HTMLDivElement
	let toast_copied_ref: HTMLDivElement

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_settings = db[_writeObjectStore](ObjectStoreNames[_settings])
		if (!store_settings) return;

		for (const item of items) {
			store_settings[_put]({ key: item[0], value: item[1] })
		}
	}

	function saveLastInput(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_lastInput = db[_writeObjectStore](ObjectStoreNames[_lastInput])
		if (!store_lastInput) return;

		for (const item of items) {
			store_lastInput[_put]({ key: item[0], value: item[1] })
		}
	}

	function updateOutput(): void {
		const text = inputViewOption == InputViewOption[_sass]? sassText() : scssText()
		let output = ''
		try {
			output = compileString(text, {
				style: settings[_minify]? _compressed : _expanded,
				syntax: inputViewOption == InputViewOption[_sass]? _indented : _scss,
			})[_css]
		} catch { output = ''}

		setCSSText(output)
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		// toggle_textWrap
		if (type == Commands.toggle_textWrap) {
			setSettings(_textWrap, t => !t)
			saveSettings([ObjectStoreKeys.settings_textWrap, settings[_textWrap]])
		}

		// toggle_minify
		else if (type == Commands.toggle_minify) {
			setSettings(_minify, t => !t)
			saveSettings([ObjectStoreKeys.settings_minify, settings[_minify]])
			updateOutput()
		}

		// change_fontSize
		else if (type == Commands.change_fontSize) {
			setSettings(_fontSize, args[0] as number)
			saveSettings([ObjectStoreKeys.settings_fontSize, settings[_fontSize]])
		}

		// change_input_view_option
		else if (type == Commands.change_input_view_option) {
			inputViewOption = args[0] as InputViewOption
			updateOutput()
		}

		// update_scss_text
		else if (type == Commands.update_scss_text) {
			setScssText(args[0] as string)
			saveLastInput([ObjectStoreKeys.lastInput_scss, args[0]])
			updateOutput()
		}

		// update_sass_text
		else if (type == Commands.update_sass_text) {
			setSassText(args[0] as string)
			saveLastInput([ObjectStoreKeys.lastInput_sass, args[0]])
			updateOutput()
		}

		// reset_inputs
		else if (type == Commands.reset_inputs) {
			setScssText(DEFAULT_SCSS_INPUT)
			setSassText(DEFAULT_SASS_INPUT)
			saveLastInput(
				[ObjectStoreKeys.lastInput_sass, DEFAULT_SASS_INPUT],
				[ObjectStoreKeys.lastInput_scss, DEFAULT_SCSS_INPUT]
			)
			updateOutput()
		}

		// open_file
		else if (type == Commands.open_file) {
			openFile('text/*', true)[_then](async (files) => {
				if (files == null || files[_length] == 0) {
					openToast(args[0] as Event, toast_noFileSelected_ref)
					return
				}

				let text: string = ''
				try {
					for (let i = 0; i < files[_length]; i++) {
						if (i > 0) text += '\n\n'

						const file = files[i]
						text += await readFileAsText(file)
					}
				} catch {
					openToast(args[0] as Event, toast_errorReadingFiles_ref)
					return
				}

				if (inputViewOption == InputViewOption[_sass]) {
					setSassText(text)
					saveLastInput([ObjectStoreKeys.lastInput_sass, text])
				}
				else if (inputViewOption == InputViewOption[_scss]) {
					setScssText(text)
					saveLastInput([ObjectStoreKeys.lastInput_scss, text])
				}
				updateOutput()
			})
		}

		// copy_all
		else if (type == Commands.copy_all) {
			const t = args[1] as ('sass' | 'scss' | 'css')
			let text = ''
			if (t == _sass) text = sassText()
			else if (t == _scss) text = scssText()
			else if (t == _css) text = cssText()

			getNavigator()[_clipboard][_writeText](text)
			openToast(args[0] as Event, toast_copied_ref)
		}

		// download_file
		else if (type == Commands.download_file) {
			const t = args[0] as ('sass' | 'scss' | 'css')
			let text = ''
			let filename = ''
			if (t == _sass) text = sassText(), filename = 'syntactically-awesome-style-sheets.sass'
			else if (t == _scss) text = scssText(), filename = 'sassy-cascading-style-sheets.scss'
			else if (t == _css) text = cssText(), filename = 'cascading-style-sheets.css'

			downloadFile(new Blob([text]), filename)
		}
		return
	}

	function initSettings(): void {
		const store_settings = db[_readObjectStore](ObjectStoreNames[_settings])
		if (store_settings == null) return

		db[_get]<ObjectStoreSettings<boolean>>(store_settings, ObjectStoreKeys.settings_textWrap)[_then](
			result => setSettings(_textWrap, defaultValue => result? result[_value] : defaultValue)
		)
		db[_get]<ObjectStoreSettings<number>>(store_settings, ObjectStoreKeys.settings_fontSize)[_then](
			result => setSettings(_fontSize, defaultValue => result? result[_value] : defaultValue)
		)
		db[_get]<ObjectStoreSettings<boolean>>(store_settings, ObjectStoreKeys.settings_minify)[_then](
			result => setSettings(_minify, defaultValue => result? result[_value] : defaultValue)
		)
	}

	function initLastInputs(): void {
		const store_lastInput = db[_readObjectStore](ObjectStoreNames[_lastInput])
		if (store_lastInput == null) return

		db[_get]<ObjectStoreLastInput<string>>(store_lastInput, ObjectStoreKeys.lastInput_scss)[_then](
			result => setScssText(result? result[_value] : DEFAULT_SCSS_INPUT)
		)
		db[_get]<ObjectStoreLastInput<string>>(store_lastInput, ObjectStoreKeys.lastInput_sass)[_then](
			result => {
				setSassText(result == undefined? DEFAULT_SASS_INPUT : result[_value])
				updateOutput() // SASS is the default view
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
				setSassText(DEFAULT_SASS_INPUT)
				setScssText(DEFAULT_SCSS_INPUT)
				updateOutput()
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

	function removeSplashScreen(): void {
		setMicrotask(() => {
			const splash_ref = getElementById(ElementIds[_splash]) as HTMLDivElement
			splash_ref[_animate](
				{opacity: 0},
				{
					duration: 1000,
					easing: AnimationEffectTiming[_spring]
				}
			)[_finished][_then](() => splash_ref[_remove]())
		})
	}

	onMount(() => {
		initDatabase()
		removeSplashScreen()
	})

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toast_noFileSelected_ref = r}
			leading={<Icon code={0xE631}/>}>
			No file selected
		</Toast>
		<Toast
			ref={r => toast_errorReadingFiles_ref = r}
			leading={<Icon code={0xEDC5}/>}>
			Error reading files
		</Toast>
		<Toast
			ref={r => toast_copied_ref = r}
			leading={<Icon code={0xE51B}/>}>
			Copied to clipboard
		</Toast>
	</>)

	return (<App
		appBar={<AppBar
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