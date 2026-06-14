import { ObservableStore } from "@/utils/signal"
import { $ } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { CTextAreaField } from "@/components/TextAreaField"
import { SettingsStore } from "../_core/_settings"
import { EncodingMode, QRVersion } from "../_shared/_enums"
import { toCanvas as dataToQRCanvas, toString as dataToQRString } from "qrcode"
import { CToast } from "@/components/Toast"
import { CButton } from "@/components/Button"
import { downloadFileByUrl } from "@/utils/url"
import { DEFAULT_DATA } from "../_shared/_constant"

export type GenerateStoreType = Readonly<{
	data: string
}>

export const GenerateStore = new ObservableStore<GenerateStoreType>({
	data: DEFAULT_DATA
})

const _ref_input = $(ElementIds.pgGen_input) as CTextAreaField.CElement
const _ref_output = $(ElementIds.pgGen_output) as HTMLCanvasElement
const _ref_errorMessage = $(ElementIds.toa_generateErrorMessage) as HTMLSpanElement
const _ref_toastError = $(ElementIds.toa_generateError) as CToast.CElement
const _ref_downloadPng = $(ElementIds.pgGen_png) as CButton.CElement
const _ref_downloadJpg = $(ElementIds.pgGen_jpg) as CButton.CElement
const _ref_downloadSvg = $(ElementIds.pgGen_svg) as CButton.CElement
let _time_input: NodeJS.Timeout | number | null = null

function _renderQRCode(): void {
	const data = GenerateStore.value.data
	const settings = SettingsStore.value
	dataToQRCanvas(_ref_output, settings.encodingMode === EncodingMode.Auto
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
		version: settings.version === QRVersion.Auto? undefined : Number.parseInt(settings.version),
	}, (error) => {
		_ref_downloadPng.disabled = (
			_ref_downloadJpg.disabled =
			_ref_downloadSvg.disabled = Boolean(error)
		)
		if (!error) {return}

		// ignore empty data
		if (data.length > 0) {
			_ref_errorMessage.textContent = error.message
			_ref_toastError.showPopover()
		}
		const ctx = _ref_output.getContext('2d')
		if (ctx) ctx.fillStyle = settings.backgroundColor
		ctx?.fillRect(0, 0, _ref_output.width,  _ref_output.height)
	})
}

export function subsSettingsStore(): void {
	_renderQRCode()
}

function _subsDataView(v: GenerateStoreType, o: GenerateStoreType): void {
	const data = v.data
	if (data !== _ref_input.value) {
		_ref_input.value = data
	}

	if (data === o.data) {return}

	_renderQRCode()
}

function _initSubscriber(): void {
	GenerateStore.subscribe(_subsDataView)
}

function _initEvents(): void {
	_ref_input.addEventListener('input', () => {
		if (_time_input !== null) {
			clearTimeout(_time_input)
		}

		_time_input = setTimeout(() => {
			_time_input = null
			GenerateStore.update(v => v.data = _ref_input.value)
		}, 100)
	})

	_ref_downloadPng.addEventListener('click', () => {
		downloadFileByUrl(_ref_output.toDataURL('image/png', 1), 'qrcode')
	})

	_ref_downloadJpg.addEventListener('click', () => {
		downloadFileByUrl(_ref_output.toDataURL('image/jpeg', 1), 'qrcode')
	})

	_ref_downloadSvg.addEventListener('click', () => {
		const data = GenerateStore.value.data
		const settings = SettingsStore.value
		dataToQRString(settings.encodingMode === EncodingMode.Auto
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
			version: settings.version === QRVersion.Auto? undefined : Number.parseInt(settings.version),
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