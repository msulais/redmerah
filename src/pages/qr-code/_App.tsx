import { createSignal, onMount, type VoidComponent } from "solid-js"
import { toCanvas as dataToQRCanvas, toString as dataToQRString } from "qrcode"

import type { HEXColor } from "@/types/color"
import type { Settings } from "./_types"
import { Commands, CopyFileType, DownloadFileType, EncodingMode, ErrorCorrectionLevel, Pages } from "./_enums"
import { createStore } from "solid-js/store"
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_COLOR, DEFAULT_ENCODING_MODE, DEFAULT_ERROR_CORRECTION_LEVEL, DEFAULT_MARGIN, DEFAULT_VERSION } from "./_constants"
import { urlDownloadFile } from "@/utils/url"
import { fileDownload } from "@/utils/file"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, ObjectStoreNames, type ObjectStoreMiscellaneous, type ObjectStoreSettings } from "./_storage"
import { removeSplashScreen } from "@/utils/splash"
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
	let timeId: number | NodeJS.Timeout | null = null

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.settings)
		if (!store) return;

		for (const item of items) {
			store.put({ key: item[0], value: item[1] })
		}
	}

	function saveMiscellaneous(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.miscellaneous)
		if (store == null) return;

		for (const item of items) {
			store.put({ key: item[0], value: item[1] })
		}
	}

	function generate(): void {
		if (timeId != null) clearTimeout(timeId)

		timeId = setTimeout(() => {
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

				ok(svg.replace(/(?<!\w)(?<=d=)".+?"/gs, (value) => value.toUpperCase()))
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
			getSVG().then(svg => fileDownload(
				new Blob([svg], {type: 'image/svg+xml'}),
				'redmerah-qr-code.svg'
			))
			break
		}
	}

	function copyQRCode(type: CopyFileType): void {
		switch (type) {
		case CopyFileType.png:
			canvasRef.toBlob((blob) => {
				if (blob == null) return;

				navigator
					.clipboard
					.write([new ClipboardItem({ 'image/png': blob })])
					.then(() => openToast(toastCopiedRef))
			}, 'image/png', 0.95)
			break
		case CopyFileType.svg:
			getSVG()
			.then(svg => navigator.clipboard.writeText(svg).then(
				() => openToast(toastCopiedRef)
			))
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
			const [type] = args as [CopyFileType]
			copyQRCode(type)
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

		db.get<ObjectStoreSettings<ErrorCorrectionLevel>>(
			storeSettings,
			ObjectStoreKeys.settings_errorCorrectionLevel
		).then(result => setSettings('errorCorrectionLevel', e => result?.value ?? e))

		db.get<ObjectStoreSettings<HEXColor>>(
			storeSettings,
			ObjectStoreKeys.settings_color
		).then(result => setSettings('color', c => result?.value ?? c))

		db.get<ObjectStoreSettings<HEXColor>>(
			storeSettings,
			ObjectStoreKeys.settings_backgroundColor
		).then(result => setSettings('backgroundColor', b => result?.value ?? b))

		db.get<ObjectStoreSettings<Settings['version']>>(
			storeSettings,
			ObjectStoreKeys.settings_version
		).then(result => setSettings('version', v => result?.value ?? v))

		db.get<ObjectStoreSettings<Settings['encodingMode']>>(
			storeSettings,
			ObjectStoreKeys.settings_encodingMode
		).then(result => setSettings('encodingMode', e => result?.value ?? e))

		db.get<ObjectStoreSettings<Settings['margin']>>(
			storeSettings,
			ObjectStoreKeys.settings_margin
		).then(result => setSettings('margin', m => result?.value ?? m))
	}

	function initLastPage(): void {
		const store = db.readStore(ObjectStoreNames.miscellaneous)
		if (store == null) return

		db.get<ObjectStoreMiscellaneous<Pages>>(
			store,
			ObjectStoreKeys.miscellaneous_lastPage
		).then(result => setPage(p => result?.value ?? p))
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