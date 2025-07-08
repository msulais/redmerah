import { ObservableStore } from "@/utils/store"
import { $ } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import type { TextAreaFieldElement } from "@/native-components/TextAreaField"
import { SettingsStore } from "../_core/_settings"
import { EncodingMode, QRVersion } from "../_shared/_enums"
import { toCanvas as dataToQRCanvas, toString as dataToQRString } from "qrcode"
import type { ToastElement } from "@/native-components/Toast"
import type { ButtonElement } from "@/native-components/Button"
import { downloadFileByUrl } from "@/utils/url"
import { DEFAULT_DATA } from "../_shared/_constant"

export type GenerateStoreType = Readonly<{
	data: string
}>

export const GenerateStore = new ObservableStore<GenerateStoreType>({
	data: DEFAULT_DATA
})

const _inputRef = $(ElementIds.pgGen_input) as TextAreaFieldElement
const _outputRef = $(ElementIds.pgGen_output) as HTMLCanvasElement
const _errorMessageRef = $(ElementIds.toa_generateErrorMessage) as HTMLSpanElement
const _toastErrorRef = $(ElementIds.toa_generateError) as ToastElement
const _downloadPngRef = $(ElementIds.pgGenDow_png) as ButtonElement
const _downloadJpgRef = $(ElementIds.pgGenDow_jpg) as ButtonElement
const _downloadSvgRef = $(ElementIds.pgGenDow_svg) as ButtonElement
let _timeInputId: NodeJS.Timeout | number | null = null

function _renderQRCode(): void {
	const data = GenerateStore.value.data
	const settings = SettingsStore.value
	dataToQRCanvas(_outputRef, settings.encodingMode === EncodingMode.auto
		? data
		: [{data: data, mode: settings.encodingMode as any}],
	{
		color: {
			dark: settings.color,
			light: settings.backgroundColor
		},
		scale: 16,
		errorCorrectionLevel: settings.errorCorrectionLevel,
		margin: settings.margin,
		version: settings.version === QRVersion.auto? undefined : Number.parseInt(settings.version),
	}, (error) => {
		_downloadPngRef.disabled = (
			_downloadJpgRef.disabled =
			_downloadSvgRef.disabled = Boolean(error)
		)
		if (!error) {return}

		// ignore empty data
		if (data.length > 0) {
			_errorMessageRef.textContent = error.message
			_toastErrorRef.showPopover()
		}
		const ctx = _outputRef.getContext('2d')
		if (ctx) ctx.fillStyle = settings.backgroundColor
		ctx?.fillRect(0, 0, _outputRef.width,  _outputRef.height)
	})
}

export function subsSettingsStore(): void {
	_renderQRCode()
}

function _subsDataView(v: GenerateStoreType, o: GenerateStoreType): void {
	const data = v.data
	if (data !== _inputRef.value) {
		_inputRef.value = data
	}

	if (data === o.data) {return}

	_renderQRCode()
}

function _initSubscriber(): void {
	GenerateStore.subscribe(_subsDataView)
}

function _initEvents(): void {
	_inputRef.addEventListener('input', () => {
		if (_timeInputId !== null) {
			clearTimeout(_timeInputId)
		}

		_timeInputId = setTimeout(() => {
			_timeInputId = null
			GenerateStore.update(v => ({...v, data: _inputRef.value}))
		}, 100)
	})

	_downloadPngRef.addEventListener('click', () => {
		downloadFileByUrl(_outputRef.toDataURL('image/png', 1), 'qrcode')
	})

	_downloadJpgRef.addEventListener('click', () => {
		downloadFileByUrl(_outputRef.toDataURL('image/jpeg', 1), 'qrcode')
	})

	_downloadSvgRef.addEventListener('click', () => {
		const data = GenerateStore.value.data
		const settings = SettingsStore.value
		dataToQRString(settings.encodingMode === EncodingMode.auto
			? data
			: [{data: data, mode: settings.encodingMode as any}],
		{
			color: {
				dark: settings.color,
				light: settings.backgroundColor
			},
			scale: 16,
			type: 'svg',
			errorCorrectionLevel: settings.errorCorrectionLevel,
			margin: settings.margin,
			version: settings.version === QRVersion.auto? undefined : Number.parseInt(settings.version),
		}, (error, svg) => {
			if (error) {return}

			const svgUrl = 'data:image/svg+xml,' + encodeURIComponent(svg)
			downloadFileByUrl(svgUrl, 'qrcode')
		})
	})

}

export default () => {
	_renderQRCode()
	_initEvents()
	_initSubscriber()
}