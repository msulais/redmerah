import { createSignal, onMount, type VoidComponent } from "solid-js"
import { marked } from 'marked'
import beautiful from 'simply-beautiful'

import type { Settings } from "./_types"
import { IDB, idbStorePut } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreLastInput, type ObjectStoreSettings } from "./_storage"
import { createStore } from "solid-js/store"
import { Commands } from "./_enums"
import { DEFAULT_CSS_TEXT } from "./_css"
import { DEFAULT_MARKDOWN_TEXT } from "./_markdown"
import { fileDownload, fileOpen, fileReadAsText } from "@/utils/file"
import { removeSplashScreen } from "@/utils/splash"
import { promiseDone } from "@/utils/object"
import { arrayLength } from "@/utils/array"
import { stringReplace } from "@/utils/string"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { ICON_COPY, ICON_DOCUMENT_ERROR, ICON_SCAN_TEXT } from "@/constants/icons"

import Icon from "@/components/Icon"
import Toast, { openToast } from "@/components/Toast"
import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.markdownConverter)
	const [textHTML, setTextHTML] = createSignal<string>('')
	const [textMarkdown, setTextMarkdown] = createSignal<string>('')
	const [textCSS, setTextCSS] = createSignal<string>('')
	const [settings, setSettings] = createStore<Settings>({
		textWrap: true,
		fontSize: 14
	})
	let toastNoFileSelectedRef: HTMLDivElement
	let toastErrorReadingFilesRef: HTMLDivElement
	let toastCopiedRef: HTMLDivElement

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
		setTextHTML(marked(textMarkdown(), { async: false }) as string)
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.toggleTextWrap:
			setSettings('textWrap', t => !t)
			saveSettings([ObjectStoreKeys.settings_textWrap, settings.textWrap])
			break
		case Commands.updateFontSize: {
			const [font_size] = args as [number]
			setSettings('fontSize', font_size)
			saveSettings([ObjectStoreKeys.settings_fontSize, font_size])
			break
		}
		case Commands.updateCSSText: {
			const [text] = args as [string]
			setTextCSS(text)
			storeLastInput([ObjectStoreKeys.lastInput_css, text])
			break
		}
		case Commands.updateMarkdownText: {
			const [text] = args as [string]
			setTextMarkdown(text)
			storeLastInput([ObjectStoreKeys.lastinput_markdown, text])
			updateOutput()
			break
		}
		case Commands.resetInputs:
			setTextMarkdown(DEFAULT_MARKDOWN_TEXT)
			setTextCSS(DEFAULT_CSS_TEXT)
			storeLastInput(
				[ObjectStoreKeys.lastinput_markdown, DEFAULT_MARKDOWN_TEXT],
				[ObjectStoreKeys.lastInput_css, DEFAULT_CSS_TEXT]
			)
			updateOutput()
			break
		case Commands.openFile: {
			promiseDone(fileOpen('text/*', true), async (files) => {
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

				setTextMarkdown(text)
				storeLastInput([ObjectStoreKeys.lastinput_markdown, text])
				updateOutput()
			})
			break
		}
		case Commands.copyAll: {
			const [type] = args as ['markdown' | 'css' | 'html']
			let text = ''

			switch (type) {
				case "markdown": text = textMarkdown(); break
				case "css":text = textCSS(); break
				case "html": text = stringReplace(beautiful.html(textHTML()), /(?<=>)\n+(?=<)/gs, '\n'); break
			}

			promiseDone(
				navigatorClipboardWriteText(text),
				() => openToast(toastCopiedRef)
			)
			break
		}
		case Commands.downloadFile: {
			const [type] = args as ['markdown' | 'css' | 'html']
			let text = ''
			let filename = ''
			switch (type) {
			case "markdown":
				text = textMarkdown()
				filename = 'markdown.md'
				break
			case "css":
				text = textCSS()
				filename = 'cascading-style-sheets.css'
				break
			case "html":
				text = stringReplace(beautiful.html(textHTML()), /(?<=>)\n+(?=<)/gs, '\n')
				filename = 'hypertext-markup-language.html'
				break
			}

			fileDownload(new Blob([text]), filename)
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
	}

	function initLastInput(): void {
		const store = db.readStore(ObjectStoreNames.lastInput)
		if (store == null) return

		promiseDone(db.get<ObjectStoreLastInput<string>>(
			store,
			ObjectStoreKeys.lastInput_css
		), r => setTextCSS(r?.value ?? DEFAULT_CSS_TEXT))

		promiseDone(db.get<ObjectStoreLastInput<string>>(
			store,
			ObjectStoreKeys.lastinput_markdown
		), result => {
			setTextMarkdown(result?.value ?? DEFAULT_MARKDOWN_TEXT)
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
				setTextMarkdown(DEFAULT_MARKDOWN_TEXT)
				setTextCSS(DEFAULT_CSS_TEXT)
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
	</>)

	return (<App
		c:appBar={<AppBar
			settings={settings}
			command={command}
		/>}>
		<Body
			settings={settings}
			command={command}
			textMarkdown={textMarkdown()}
			textCSS={textCSS()}
			textHTML={textHTML()}
		/>
		<Toasts/>
	</App>)
}

export default _