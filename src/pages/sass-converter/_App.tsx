import { createSignal, onMount, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"
import { compileString } from 'sass'

import type { Settings } from "./_types"
import { remove_splash_screen } from "@/scripts/splash"
import { Commands, InputViewOption } from "./_enums"
import { file_open, file_read_as_text, file_download } from "@/utils/file"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreSettings, type ObjectStoreLastInput } from "./_storage"
import { DatabaseNames } from "@/enums/storage"
import { DEFAULT_INPUT_VIEW_OPTION, DEFAULT_SASS_INPUT, DEFAULT_SCSS_INPUT } from "./_constants"
import { IDB, idb_store_put } from "@/utils/indexeddb"
import { promise_done } from "@/utils/object"
import { array_length } from "@/utils/array"
import { navigator_clipboard_writetext } from "@/utils/navigator"
import { ICON_COPY, ICON_DOCUMENT_ERROR, ICON_SCAN_TEXT } from "@/constants/icons"

import Icon from "@/components/Icon"
import Toast, { open_toast } from "@/components/Toast"
import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.sass_converter)
	const [css_text, set_css_text] = createSignal<string>('')
	const [sass_text, set_sass_text] = createSignal<string>(DEFAULT_SASS_INPUT)
	const [scss_text, set_scss_text] = createSignal<string>(DEFAULT_SCSS_INPUT)
	const [settings, set_settings] = createStore<Settings>({
		font_size: 14,
		text_wrap: true,
		minify: false
	})
	let input_view_option: InputViewOption = DEFAULT_INPUT_VIEW_OPTION
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
		const text = input_view_option == InputViewOption.sass? sass_text() : scss_text()
		let output = ''
		try {
			output = compileString(text, {
				style: settings.minify? 'compressed' : 'expanded',
				syntax: input_view_option == InputViewOption.sass? 'indented' : 'scss',
			}).css
		} catch { output = ''}

		set_css_text(output)
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		// toggle_textWrap
		if (type == Commands.toggle_textwrap) {
			set_settings('text_wrap', t => !t)
			save_settings([ObjectStoreKeys.settings_textwrap, settings.text_wrap])
		}

		// toggle_minify
		else if (type == Commands.toggle_minify) {
			set_settings('minify', t => !t)
			save_settings([ObjectStoreKeys.settings_minify, settings.minify])
			update_output()
		}

		// change_fontSize
		else if (type == Commands.change_fontsize) {
			set_settings('font_size', args[0] as number)
			save_settings([ObjectStoreKeys.settings_fontsize, settings.font_size])
		}

		// change_input_view_option
		else if (type == Commands.change_input_view_option) {
			input_view_option = args[0] as InputViewOption
			update_output()
		}

		// update_scss_text
		else if (type == Commands.update_scss_text) {
			set_scss_text(args[0] as string)
			save_last_input([ObjectStoreKeys.lastinput_scss, args[0]])
			update_output()
		}

		// update_sass_text
		else if (type == Commands.update_sass_text) {
			set_sass_text(args[0] as string)
			save_last_input([ObjectStoreKeys.lastinput_sass, args[0]])
			update_output()
		}

		// reset_inputs
		else if (type == Commands.reset_inputs) {
			set_scss_text(DEFAULT_SCSS_INPUT)
			set_sass_text(DEFAULT_SASS_INPUT)
			save_last_input(
				[ObjectStoreKeys.lastinput_sass, DEFAULT_SASS_INPUT],
				[ObjectStoreKeys.lastinput_scss, DEFAULT_SCSS_INPUT]
			)
			update_output()
		}

		// open_file
		else if (type == Commands.open_file) {
			promise_done(file_open('text/*', true), async (files) => {
				if (files == null || array_length(files as unknown as any[]) == 0) {
					open_toast(args[0] as Event, toast_nofileselected_ref)
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
					open_toast(args[0] as Event, toast_errorreadingfiles_ref)
					return
				}

				if (input_view_option == InputViewOption.sass) {
					set_sass_text(text)
					save_last_input([ObjectStoreKeys.lastinput_sass, text])
				}
				else if (input_view_option == InputViewOption.scss) {
					set_scss_text(text)
					save_last_input([ObjectStoreKeys.lastinput_scss, text])
				}
				update_output()
			})
		}

		// copy_all
		else if (type == Commands.copy_all) {
			const t = args[1] as ('sass' | 'scss' | 'css')
			let text = ''
			if (t == 'sass') text = sass_text()
			else if (t == 'scss') text = scss_text()
			else if (t == 'css') text = css_text()

			promise_done(
				navigator_clipboard_writetext(text),
				() => open_toast(args[0] as Event, toast_copied_ref)
			)
		}

		// download_file
		else if (type == Commands.download_file) {
			const t = args[0] as ('sass' | 'scss' | 'css')
			let text = ''
			let filename = ''
			if (t == 'sass') text = sass_text(), filename = 'syntactically-awesome-style-sheets.sass'
			else if (t == 'scss') text = scss_text(), filename = 'sassy-cascading-style-sheets.scss'
			else if (t == 'css') text = css_text(), filename = 'cascading-style-sheets.css'

			file_download(new Blob([text]), filename)
		}
		return
	}

	function init_settings(): void {
		const store_settings = db.read_store(ObjectStoreNames.settings)
		if (store_settings == null) return

		promise_done(db.get<ObjectStoreSettings<boolean>>(
			store_settings,
			ObjectStoreKeys.settings_textwrap
		), result => set_settings('text_wrap', w => result?.value ?? w))

		promise_done(db.get<ObjectStoreSettings<number>>(
			store_settings,
			ObjectStoreKeys.settings_fontsize
		), result => set_settings('font_size', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<boolean>>(
			store_settings,
			ObjectStoreKeys.settings_minify
		), result => set_settings('minify', m => result?.value ?? m))
	}

	function init_last_inputs(): void {
		const store_lastinput = db.read_store(ObjectStoreNames.last_input)
		if (store_lastinput == null) return

		promise_done(db.get<ObjectStoreLastInput<string>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_scss
		), result => set_scss_text(result?.value ?? DEFAULT_SCSS_INPUT))

		promise_done(db.get<ObjectStoreLastInput<string>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_sass
		), result => {
			set_sass_text(result?.value ?? DEFAULT_SASS_INPUT)
			update_output() // SASS is the default view
		})
	}

	function init_database(): void {
		db.open({
			on_success() {
				init_settings()
				init_last_inputs()
			},
			on_error() {
				set_sass_text(DEFAULT_SASS_INPUT)
				set_scss_text(DEFAULT_SCSS_INPUT)
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
		init_database()
		remove_splash_screen()
	})

	const Toasts: VoidComponent = () => (<>
		<Toast
			ref={r => toast_nofileselected_ref = r}
			c_leading={<Icon c_code={ICON_DOCUMENT_ERROR}/>}>
			No file selected
		</Toast>
		<Toast
			ref={r => toast_errorreadingfiles_ref = r}
			c_leading={<Icon c_code={ICON_SCAN_TEXT}/>}>
			Error reading files
		</Toast>
		<Toast
			ref={r => toast_copied_ref = r}
			c_leading={<Icon c_code={ICON_COPY}/>}>
			Copied to clipboard
		</Toast>
	</>)

	return (<App
		c_appbar={<AppBar
			command={command}
			settings={settings}
		/>}>
		<Body
			command={command}
			css_text={css_text()}
			sass_text={sass_text()}
			scss_text={scss_text()}
			settings={settings}
		/>
		<Toasts/>
	</App>)
}

export default _