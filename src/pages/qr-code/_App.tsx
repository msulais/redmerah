import { createSignal, onMount, type VoidComponent } from "solid-js"
import { toCanvas as dataToQRCanvas, toString as dataToQRString } from "qrcode"

import type { HEXColor } from "@/types/color"
import type { Settings } from "./_types"
import { timeTimerClear, timeTimerSet } from "@/utils/time"
import { Commands, CopyFileType, DownloadFileType, EncodingMode, ErrorCorrectionLevel, Pages } from "./_enums"
import { createStore } from "solid-js/store"
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_COLOR, DEFAULT_ENCODING_MODE, DEFAULT_ERROR_CORRECTION_LEVEL, DEFAULT_MARGIN, DEFAULT_VERSION } from "./_constants"
import { urlDownloadFile } from "@/utils/url"
import { stringReplace, stringToUpperCase } from "@/utils/string"
import { promiseDone } from "@/utils/object"
import { navigatorClipboardWrite, navigatorClipboardWriteText } from "@/utils/navigator"
import { fileDownload } from "@/utils/file"
import { IDB, idbStorePut } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreMiscellaneous, type ObjectStoreSettings } from "./_storage"
import { removeSplashScreen } from "@/scripts/splash"
import { ICON_COPY } from "@/constants/icons"

import Icon from "@/components/Icon"
import Toast, { openToast } from "@/components/Toast"
import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.qrCode)
	const [page, setPage] = createSignal<Pages>(Pages.generate)
	const [isGenerateError, setIsGenerateError] = createSignal<boolean>(true)
	const [qrCodeData, setQRCodeData] = createSignal<string>('')
	const [settings, setSettings] = createStore<Settings>({
		backgroundColor: DEFAULT_BACKGROUND_COLOR,
		color: DEFAULT_COLOR,
		encodingMode: DEFAULT_ENCODING_MODE,
		errorCorrectionLevel: DEFAULT_ERROR_CORRECTION_LEVEL,
		margin: DEFAULT_MARGIN,
		version: DEFAULT_VERSION
	})
	let canvasRef: HTMLCanvasElement
	let toastCopiedRef: HTMLDivElement
	let timeId: number | null = null

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const storeSettings = db.writeStore(ObjectStoreNames.settings)
		if (!storeSettings) return;

		for (const item of items) {
			idbStorePut(storeSettings, { key: item[0], value: item[1] })
		}
	}

	function saveMiscellaneous(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.miscellaneous)
		if (store == null) return;

		for (const item of items) {
			idbStorePut(store, { key: item[0], value: item[1] })
		}
	}

	function generate(): void {
		if (timeId != null) timeTimerClear(timeId)

		timeId = timeTimerSet(() => {
			dataToQRCanvas(canvasRef, settings.encodingMode == EncodingMode.auto
				? qrCodeData()
				: [{data: qrCodeData(), mode: settings.encodingMode as any}],
			{
				color: {
					dark: settings.color,
					light: settings.backgroundColor
				},
				scale: 16,
				errorCorrectionLevel: settings.errorCorrectionLevel,
				margin: settings.margin,
				version: settings.version == null? undefined : settings.version,
			}, (error) => {
				setIsGenerateError(error != null)
				if (!error) return;
				const ctx = canvasRef.getContext('2d')
				ctx?.clearRect(0, 0, canvasRef.width,  canvasRef.height)
			})
			timeId = null
		}, 200)
	}

	function getSVG(): Promise<string> {
		return new Promise((ok, err) => {
			dataToQRString(settings.encodingMode == EncodingMode.auto
				? qrCodeData()
				: [{data: qrCodeData(), mode: settings.encodingMode as any}],
			{
				color: {
					dark: settings.color,
					light: settings.backgroundColor
				},
				scale: 16,
				type: 'svg',
				errorCorrectionLevel: settings.errorCorrectionLevel,
				margin: settings.margin,
				version: settings.version == null? undefined : settings.version,
			}, (error, svg) => {
				if (error) return err(error)

				ok(stringReplace(svg, /(?<!\w)(?<=d=)".+?"/gs, (value) => stringToUpperCase(value)))
			})
		})
	}

	function downloadQRCode(type: DownloadFileType): void {
		switch (type) {
		case DownloadFileType.jpeg:
			urlDownloadFile(canvasRef.toDataURL('image/jpeg', 0.95), 'redmerah-qr-code.jpeg')
			break
		case DownloadFileType.png:
			urlDownloadFile(canvasRef.toDataURL('image/png', 0.95), 'redmerah-qr-code.png')
			break
		case DownloadFileType.svg:
			promiseDone(getSVG(), svg => fileDownload(new Blob([svg], {type: 'image/svg+xml'}), 'redmerah-qr-code.svg'))
			break
		}
	}

	function copyQRCode(ev: Event, type: CopyFileType): void {
		switch (type) {
		case CopyFileType.png:
			canvasRef.toBlob((blob) => {
				if (blob == null) return;

				promiseDone(
					navigatorClipboardWrite([new ClipboardItem({ 'image/png': blob })]),
					() => openToast(ev, toastCopiedRef)
				)
			}, 'image/png', 0.95)
			break
		case CopyFileType.svg:
			promiseDone(
				getSVG(),
				svg => promiseDone(navigatorClipboardWriteText(svg), () => openToast(ev, toastCopiedRef))
			)
			break
		}
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.updatePage: {
			const [page] = args as [Pages]
			setPage(page)
			saveMiscellaneous([ObjectStoreKeys.miscellaneous_lastPage, page])
			break
		}
		case Commands.updateSettingsErrorCorrectionLevel: {
			const [level] = args as [ErrorCorrectionLevel]
			setSettings('errorCorrectionLevel', level)
			saveSettings([ObjectStoreKeys.settings_errorCorrectionLevel, level])
			generate()
			break
		}
		case Commands.updateSettingsColor: {
			const [color] = args as [HEXColor]
			setSettings('color', color)
			saveSettings([ObjectStoreKeys.settings_color, color])
			generate()
			break
		}
		case Commands.updateSettingsBackgroundColor: {
			const [color] = args as [HEXColor]
			setSettings('backgroundColor', color)
			saveSettings([ObjectStoreKeys.settings_backgroundColor, color])
			generate()
			break
		}
		case Commands.updateSettingsVersion: {
			const [version] = args as [number | null]
			setSettings('version', version as Settings['version'])
			saveSettings([ObjectStoreKeys.settings_version, version])
			generate()
			break
		}
		case Commands.updateSettingsEncodingMode: {
			const [mode] = args as [EncodingMode]
			setSettings('encodingMode', mode)
			saveSettings([ObjectStoreKeys.settings_encodingMode, mode])
			generate()
			break
		}
		case Commands.updateSettingsMargin: {
			const [margin] = args as [number]
			setSettings('margin', margin)
			saveSettings([ObjectStoreKeys.settings_margin, margin])
			generate()
			break
		}
		case Commands.updateQRCodeData: {
			const [data] = args as [string]
			setQRCodeData(data)
			generate()
			break
		}
		case Commands.downloadQRCode: {
			const [type] = args as [DownloadFileType]
			downloadQRCode(type)
			break
		}
		case Commands.copyQRCode: {
			const [event, type] = args as [Event, CopyFileType]
			copyQRCode(event, type)
			break
		}}
		return
	}

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initSettings()
				initLastPage()
			},
			onUpgrade(_, db) {
				db.createStore<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
				db.createStore<ObjectStoreMiscellaneous>({
					name: ObjectStoreNames.miscellaneous,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
			},
		})
	}

	function initSettings(): void {
		const storeSettings = db.readStore(ObjectStoreNames.settings)
		if (storeSettings == null) return

		promiseDone(db.get<ObjectStoreSettings<ErrorCorrectionLevel>>(
			storeSettings,
			ObjectStoreKeys.settings_errorCorrectionLevel
		), result => setSettings('errorCorrectionLevel', e => result?.value ?? e))

		promiseDone(db.get<ObjectStoreSettings<HEXColor>>(
			storeSettings,
			ObjectStoreKeys.settings_color
		), result => setSettings('color', c => result?.value ?? c))

		promiseDone(db.get<ObjectStoreSettings<HEXColor>>(
			storeSettings,
			ObjectStoreKeys.settings_backgroundColor
		), result => setSettings('backgroundColor', b => result?.value ?? b))

		promiseDone(db.get<ObjectStoreSettings<Settings['version']>>(
			storeSettings,
			ObjectStoreKeys.settings_version
		), result => setSettings('version', v => result?.value ?? v))

		promiseDone(db.get<ObjectStoreSettings<Settings['encodingMode']>>(
			storeSettings,
			ObjectStoreKeys.settings_encodingMode
		), result => setSettings('encodingMode', e => result?.value ?? e))

		promiseDone(db.get<ObjectStoreSettings<Settings['margin']>>(
			storeSettings,
			ObjectStoreKeys.settings_margin
		), result => setSettings('margin', m => result?.value ?? m))
	}

	function initLastPage(): void {
		const store = db.readStore(ObjectStoreNames.miscellaneous)
		if (store == null) return

		promiseDone(db.get<ObjectStoreMiscellaneous<Pages>>(
			store,
			ObjectStoreKeys.miscellaneous_lastPage
		), result => setPage(p => result?.value ?? p))
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
			isGenerateError={isGenerateError()}
			page={page()}
		/>}>
		<Body
			page={page()}
			isGenerateError={isGenerateError()}
			command={command}
			canvasRef={r => canvasRef = r}
		/>
		<Toasts/>
	</App>)
}

export default _