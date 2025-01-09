import { createSignal, onMount, type VoidComponent } from "solid-js"
import { marked } from 'marked'
import beautiful from 'simply-beautiful'

import type { Settings } from "./_types"
import { IDB, idb_store_put } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreLastInput, type ObjectStoreSettings } from "./_storage"
import { createStore } from "solid-js/store"
import { Commands } from "./_enums"
import { DEFAULT_CSS_TEXT } from "./_css"
import { DEFAULT_MARKDOWN_TEXT } from "./_markdown"
import { file_download, file_open, file_read_as_text } from "@/utils/file"
import { remove_splash_screen } from "@/scripts/splash"
import { promise_done } from "@/utils/object"
import { array_length } from "@/utils/array"
import { string_replace } from "@/utils/string"
import { navigator_clipboard_writetext } from "@/utils/navigator"

import Icon from "@/components/Icon"
import Toast, { open_toast } from "@/components/Toast"
import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.markdown_converter)
	const [text_html, set_text_html] = createSignal<string>('')
	const [text_markdown, set_text_markdown] = createSignal<string>('')
	const [text_css, set_text_css] = createSignal<string>('')
	const [settings, set_settings] = createStore<Settings>({
		text_wrap: true,
		font_size: 14
	})
	let toast_nofileselected_ref: HTMLDivElement
	let toast_errorreadingfiles_ref: HTMLDivElement
	let toast_copied_ref: HTMLDivElement

	function save_settings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_settings = db.write_store(ObjectStoreNames.settings)
		if (!store_settings) return;

		for (const item of items) {
			idb_store_put(store_settings, { key: item[0], value: item[1] })
		}
	}

	function save_last_input(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_lastinput = db.write_store(ObjectStoreNames.last_input)
		if (!store_lastinput) return;

		for (const item of items) {
			idb_store_put(store_lastinput, { key: item[0], value: item[1] })
		}
	}

	function update_output(): void {
		set_text_html(marked(text_markdown(), { async: false }) as string)
	}

	function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
		case Commands.toggle_textwrap: {
			set_settings('text_wrap', t => !t)
			save_settings([ObjectStoreKeys.settings_textwrap, settings.text_wrap])
			break
		}
		case Commands.change_fontsize: {
			const [font_size] = args as [number]
			set_settings('font_size', font_size)
			save_settings([ObjectStoreKeys.settings_fontsize, font_size])
			break
		}
		case Commands.update_css_text: {
			const [text] = args as [string]
			set_text_css(text)
			save_last_input([ObjectStoreKeys.lastinput_css, text])
			break
		}
		case Commands.update_markdown_text: {
			const [text] = args as [string]
			set_text_markdown(text)
			save_last_input([ObjectStoreKeys.lastinput_markdown, text])
			update_output()
			break
		}
		case Commands.reset_inputs: {
			set_text_markdown(DEFAULT_MARKDOWN_TEXT)
			set_text_css(DEFAULT_CSS_TEXT)
			save_last_input(
				[ObjectStoreKeys.lastinput_markdown, DEFAULT_MARKDOWN_TEXT],
				[ObjectStoreKeys.lastinput_css, DEFAULT_CSS_TEXT]
			)
			update_output()
			break
		}
		case Commands.open_file: {
			const [event] = args as [Event]
			promise_done(file_open('text/*', true), async (files) => {
				if (files == null || array_length(files as unknown as any[]) == 0) {
					open_toast(event, toast_nofileselected_ref)
					return
				}

				let text: string = ''
				try {
					for (let i = 0; i < array_length(files as unknown as any[]); i++) {
						if (i > 0) text += '\n\n'

						const file = files[i]
						text += await file_read_as_text(file)
					}
				} catch {
					open_toast(event, toast_errorreadingfiles_ref)
					return
				}

				set_text_markdown(text)
				save_last_input([ObjectStoreKeys.lastinput_markdown, text])
				update_output()
			})
			break
		}
		case Commands.copy_all: {
			const [event, type] = args as [Event, 'markdown' | 'css' | 'html']
			let text = ''

			switch (type) {
				case "markdown": text = text_markdown(); break
				case "css":text = text_css(); break
				case "html": text = string_replace(beautiful.html(text_html()), /(?<=>)\n+(?=<)/gs, '\n'); break
			}

			promise_done(
				navigator_clipboard_writetext(text),
				() => open_toast(event, toast_copied_ref)
			)
			break
		}
		case Commands.download_file: {
			const [type] = args as ['markdown' | 'css' | 'html']
			let text = ''
			let filename = ''
			switch (type) {
				case "markdown":
					text = text_markdown()
					filename = 'markdown.md'
					break
				case "css":
					text = text_css()
					filename = 'cascading-style-sheets.css'
					break
				case "html":
					text = string_replace(beautiful.html(text_html()), /(?<=>)\n+(?=<)/gs, '\n')
					filename = 'hypertext-markup-language.html'
					break
			}

			file_download(new Blob([text]), filename)
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
		),  result => set_settings('text_wrap', t => result?.value ?? t))

		promise_done(db.get<ObjectStoreSettings<number>>(
			store_settings,
			ObjectStoreKeys.settings_fontsize
		), result => set_settings('font_size', f => result?.value ?? f))
	}

	function init_last_input(): void {
		const store_lastinput = db.read_store(ObjectStoreNames.last_input)
		if (store_lastinput == null) return

		promise_done(db.get<ObjectStoreLastInput<string>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_css
		), r => set_text_css(r?.value ?? DEFAULT_CSS_TEXT))

		promise_done(db.get<ObjectStoreLastInput<string>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_markdown
		), result => {
			set_text_markdown(result?.value ?? DEFAULT_MARKDOWN_TEXT)
			update_output()
		})
	}

	function initDatabase(): void {
		db.open({
			on_success() {
				init_settings()
				init_last_input()
			},
			on_error() {
				set_text_markdown(DEFAULT_MARKDOWN_TEXT)
				set_text_css(DEFAULT_CSS_TEXT)
				update_output()
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
		initDatabase()
		remove_splash_screen()
	})

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toast_nofileselected_ref = r}
			leading={<Icon code={0xE631}/>}>
			No file selected
		</Toast>
		<Toast
			ref={r => toast_errorreadingfiles_ref = r}
			leading={<Icon code={0xEDC5}/>}>
			Error reading files
		</Toast>
		<Toast
			ref={r => toast_copied_ref = r}
			leading={<Icon code={0xE51B}/>}>
			Copied
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
			text_markdown={text_markdown()}
			text_css={text_css()}
			text_html={text_html()}
		/>
		<Toasts/>
	</App>)
}

export default _