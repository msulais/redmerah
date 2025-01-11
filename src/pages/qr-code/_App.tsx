import { createSignal, onMount, type VoidComponent } from "solid-js"
import { toCanvas as dataToQRCanvas, toString as dataToQRString } from "qrcode"

import type { HEXColor } from "@/types/color"
import type { Settings } from "./_types"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { Commands, CopyFileType, DownloadFileType, EncodingMode, ErrorCorrectionLevel, Pages } from "./_enums"
import { createStore } from "solid-js/store"
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_COLOR, DEFAULT_ENCODING_MODE, DEFAULT_ERROR_CORRECTION_LEVEL, DEFAULT_MARGIN, DEFAULT_VERSION } from "./_constants"
import { url_download_file } from "@/utils/url"
import { string_replace, string_touppercase } from "@/utils/string"
import { promise_done } from "@/utils/object"
import { navigator_clipboard_write, navigator_clipboard_writetext } from "@/utils/navigator"
import { file_download } from "@/utils/file"
import { IDB, idb_store_put } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreMiscellaneous, type ObjectStoreSettings } from "./_storage"
import { remove_splash_screen } from "@/scripts/splash"

import Icon from "@/components/Icon"
import Toast, { open_toast } from "@/components/Toast"
import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.qr_code)
	const [page, set_page] = createSignal<Pages>(Pages.generate)
	const [is_generate_error, set_is_generate_error] = createSignal<boolean>(true)
	const [qrcode_data, set_qrcode_data] = createSignal<string>('')
	const [settings, set_settings] = createStore<Settings>({
		background_color: DEFAULT_BACKGROUND_COLOR,
		color: DEFAULT_COLOR,
		encoding_mode: DEFAULT_ENCODING_MODE,
		error_correction_level: DEFAULT_ERROR_CORRECTION_LEVEL,
		margin: DEFAULT_MARGIN,
		version: DEFAULT_VERSION
	})
	let canvas_ref: HTMLCanvasElement
	let toast_copied_ref: HTMLDivElement
	let timeout_id: number | null = null

	function save_settings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_settings = db.write_store(ObjectStoreNames.settings)
		if (!store_settings) return;

		for (const item of items) {
			idb_store_put(store_settings, { key: item[0], value: item[1] })
		}
	}

	function save_miscellaneous(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.write_store(ObjectStoreNames.miscellaneous)
		if (store == null) return;

		for (const item of items) {
			idb_store_put(store, { key: item[0], value: item[1] })
		}
	}

	function generate(): void {
		if (timeout_id != null) timeout_clear(timeout_id)

		timeout_id = timeout_set(() => {
			dataToQRCanvas(canvas_ref, settings.encoding_mode == EncodingMode.auto
				? qrcode_data()
				: [{data: qrcode_data(), mode: settings.encoding_mode as any}],
			{
				color: {
					dark: settings.color,
					light: settings.background_color
				},
				scale: 16,
				errorCorrectionLevel: settings.error_correction_level,
				margin: settings.margin,
				version: settings.version == null? undefined : settings.version,
			}, (error) => {
				set_is_generate_error(error != null)
				if (!error) return;
				const ctx = canvas_ref.getContext('2d')
				ctx?.clearRect(0, 0, canvas_ref.width,  canvas_ref.height)
			})
			timeout_id = null
		}, 200)
	}

	function get_svg(): Promise<string> {
		return new Promise((ok, err) => {
			dataToQRString(settings.encoding_mode == EncodingMode.auto
				? qrcode_data()
				: [{data: qrcode_data(), mode: settings.encoding_mode as any}],
			{
				color: {
					dark: settings.color,
					light: settings.background_color
				},
				scale: 16,
				type: 'svg',
				errorCorrectionLevel: settings.error_correction_level,
				margin: settings.margin,
				version: settings.version == null? undefined : settings.version,
			}, (error, svg) => {
				if (error) return err(error)

				ok(string_replace(svg, /(?<!\w)(?<=d=)".+?"/gs, (value) => string_touppercase(value)))
			})
		})
	}

	function download_qrcode(type: DownloadFileType): void { switch (type) {
		case DownloadFileType.jpeg: {
			url_download_file(canvas_ref.toDataURL('image/jpeg', 0.95), 'redmerah-qr-code.jpeg')
			break
		}
		case DownloadFileType.png: {
			url_download_file(canvas_ref.toDataURL('image/png', 0.95), 'redmerah-qr-code.png')
			break
		}
		case DownloadFileType.svg: {
			promise_done(get_svg(), svg => file_download(new Blob([svg], {type: 'image/svg+xml'}), 'redmerah-qr-code.svg'))
			break
		}
	}}

	function copy_qrcode(ev: Event, type: CopyFileType): void { switch (type) {
		case CopyFileType.png: {
			canvas_ref.toBlob((blob) => {
				if (blob == null) return;

				promise_done(
					navigator_clipboard_write([new ClipboardItem({ 'image/png': blob })]),
					() => open_toast(ev, toast_copied_ref)
				)
			}, 'image/png', 0.95)
			break
		}
		case CopyFileType.svg: {
			promise_done(
				get_svg(),
				svg => promise_done(navigator_clipboard_writetext(svg), () => open_toast(ev, toast_copied_ref))
			)
			break
		}
	}}

	function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
		case Commands.change_page: {
			set_page(args[0] as Pages)
			save_miscellaneous([ObjectStoreKeys.miscellaneous_lastpage, args[0]])
			break
		}
		case Commands.change_settings_errorcorrectionlevel: {
			set_settings('error_correction_level', args[0] as Settings['error_correction_level'])
			save_settings([ObjectStoreKeys.settings_errorcorrectionlevel, args[0]])
			generate()
			break
		}
		case Commands.change_settings_color: {
			set_settings('color', args[0] as Settings['color'])
			save_settings([ObjectStoreKeys.settings_color, args[0]])
			generate()
			break
		}
		case Commands.change_settings_backgroundcolor: {
			set_settings('background_color', args[0] as Settings['background_color'])
			save_settings([ObjectStoreKeys.settings_backgroundcolor, args[0]])
			generate()
			break
		}
		case Commands.change_settings_version: {
			set_settings('version', args[0] as Settings['version'])
			save_settings([ObjectStoreKeys.settings_version, args[0]])
			generate()
			break
		}
		case Commands.change_settings_encodingmode: {
			set_settings('encoding_mode', args[0] as Settings['encoding_mode'])
			save_settings([ObjectStoreKeys.settings_encodingmode, args[0]])
			generate()
			break
		}
		case Commands.change_settings_margin: {
			set_settings('margin', args[0] as Settings['margin'])
			save_settings([ObjectStoreKeys.settings_margin, args[0]])
			generate()
			break
		}
		case Commands.change_qrcode_data: {
			set_qrcode_data(args[0] as string)
			generate()
			break
		}
		case Commands.download_qrcode: {
			download_qrcode(args[0] as DownloadFileType)
			break
		}
		case Commands.copy_qrcode: {
			copy_qrcode(args[0] as Event, args[1] as CopyFileType)
			break
		}
		default: return
	}}

	function init_database(): void {
		db.open({
			on_success() {
				init_settings()
				init_last_page()
			},
			on_upgrade_needed(_, db) {
				db.create_store<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					key_path: 'key',
					indexs: ['key', 'value']
				})
				db.create_store<ObjectStoreMiscellaneous>({
					name: ObjectStoreNames.miscellaneous,
					key_path: 'key',
					indexs: ['key', 'value']
				})
			},
		})
	}

	function init_settings(): void {
		const store_settings = db.read_store(ObjectStoreNames.settings)
		if (store_settings == null) return

		promise_done(db.get<ObjectStoreSettings<ErrorCorrectionLevel>>(
			store_settings,
			ObjectStoreKeys.settings_errorcorrectionlevel
		), result => set_settings('error_correction_level', e => result?.value ?? e))

		promise_done(db.get<ObjectStoreSettings<HEXColor>>(
			store_settings,
			ObjectStoreKeys.settings_color
		), result => set_settings('color', c => result?.value ?? c))

		promise_done(db.get<ObjectStoreSettings<HEXColor>>(
			store_settings,
			ObjectStoreKeys.settings_backgroundcolor
		), result => set_settings('background_color', b => result?.value ?? b))

		promise_done(db.get<ObjectStoreSettings<Settings['version']>>(
			store_settings,
			ObjectStoreKeys.settings_version
		), result => set_settings('version', v => result?.value ?? v))

		promise_done(db.get<ObjectStoreSettings<Settings['encoding_mode']>>(
			store_settings,
			ObjectStoreKeys.settings_encodingmode
		), result => set_settings('encoding_mode', e => result?.value ?? e))

		promise_done(db.get<ObjectStoreSettings<Settings['margin']>>(
			store_settings,
			ObjectStoreKeys.settings_margin
		), result => set_settings('margin', m => result?.value ?? m))
	}

	function init_last_page(): void {
		const store_miscellaneous = db.read_store(ObjectStoreNames.miscellaneous)
		if (store_miscellaneous == null) return

		promise_done(db.get<ObjectStoreMiscellaneous<Pages>>(
			store_miscellaneous,
			ObjectStoreKeys.miscellaneous_lastpage
		), result => set_page(p => result?.value ?? p))
	}

	onMount(() => {
		init_database()
		remove_splash_screen()
	})

	const Toasts: VoidComponent = () => (<>
		<Toast ref={r => toast_copied_ref = r} c_leading={<Icon c_code={0xE51B}/>}>Copied to clipboard</Toast>
	</>)

	return (<App
		c_appbar={<AppBar
			settings={settings}
			command={command}
			is_generate_error={is_generate_error()}
			page={page()}
		/>}>
		<Body
			page={page()}
			is_generate_error={is_generate_error()}
			command={command}
			canvas_ref={r => canvas_ref = r}
		/>
		<Toasts/>
	</App>)
}

export default _