import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import type { HEXColor } from '@/types/color'
import { EncodingMode, ErrorCorrectionLevel } from '../shared/qrcode.js'
import { $ } from '../core/dom-utils.js'
import { signal, subscribe } from '@/utils/signal'
import { delegateEvent } from '@/utils/event-registry.js'
import { safeNumber } from '@/utils/number'
import { toCanvas as dataToQRCanvas, toString as dataToQRString } from "qrcode"
import { isValidEnumValue } from '@/utils/object'
import { isColorValid } from '@/utils/color'
import { Math_clamp } from '@/utils/math'
import { saveStorageItem } from '../core/database.js'
import { downloadFileByUrl } from '@/utils/url.js'

export const sg_input                = signal(Constant.DEFAULT_DATA)
export const sg_version              = signal(Constant.DEFAULT_VERSION)
export const sg_backgroundColor      = signal(Constant.DEFAULT_BACKGROUND_COLOR)
export const sg_encodingMode         = signal(Constant.DEFAULT_ENCODING_MODE)
export const sg_autoVersion          = signal(Constant.DEFAULT_AUTO_VERSION)
export const sg_color                = signal(Constant.DEFAULT_COLOR)
export const sg_errorCorrectionLevel = signal(Constant.DEFAULT_ERROR_CORRECTION_LEVEL)
export const sg_margin               = signal(Constant.DEFAULT_MARGIN)

const _ref_input                = $(Ids.PageGenerateInput) as HTMLTextAreaElement
const _ref_output               = $(Ids.PageGenerateOutput) as HTMLCanvasElement
const _ref_version              = $(Ids.PageGenerateVersion) as HTMLInputElement
const _ref_backgroundColor      = $(Ids.PageGenerateBackgroundColor) as HTMLInputElement
const _ref_encodingMode         = $(Ids.PageGenerateEncoding) as HTMLSelectElement
const _ref_autoVersion          = $(Ids.PageGenerateAutoVersion) as HTMLInputElement
const _ref_color                = $(Ids.PageGenerateColor) as HTMLInputElement
const _ref_errorCorrectionLevel = $(Ids.PageGenerateCorrection) as HTMLSelectElement
const _ref_margin               = $(Ids.PageGenerateMargin) as HTMLInputElement
const _ref_exportCopy           = $(Ids.PageGenerateExportCopy) as HTMLButtonElement
const _ref_exportPNG            = $(Ids.PageGenerateExportPNG) as HTMLButtonElement
const _ref_exportJPEG           = $(Ids.PageGenerateExportJPEG) as HTMLButtonElement
const _ref_exportSVG            = $(Ids.PageGenerateExportSVG) as HTMLButtonElement

let _time_qrcode: ReturnType<typeof setTimeout> | undefined

function _generateQRCode(): void {
	clearTimeout(_time_qrcode)
	_time_qrcode = setTimeout(() => {
		dataToQRCanvas(_ref_output, sg_encodingMode() === EncodingMode.Auto
			? sg_input()
			: [{data: sg_input(), mode: sg_encodingMode() as any}],
		{
			color: {
				dark: sg_color(),
				light: sg_backgroundColor()
			},
			scale: 16,
			errorCorrectionLevel: sg_errorCorrectionLevel(),
			margin: sg_margin(),
			version: sg_autoVersion()? undefined : sg_version(),
		}, (error) => {
			_ref_exportPNG.disabled = (
				_ref_exportJPEG.disabled =
				_ref_exportCopy.disabled =
				_ref_exportSVG.disabled = Boolean(error)
			)
			if (!error) {
				return
			}

			if (sg_input().length > 0) {
				console.log(error.message)
			}

			const ctx = _ref_output.getContext('2d')
			if (ctx) {
				ctx.fillStyle = sg_backgroundColor()
			}

			ctx?.fillRect(0, 0, _ref_output.width,  _ref_output.height)
		})
	}, 250)
}

function _initSubscriber(): void {
	sg_input.subscribe(v => {
		if (!_ref_input.matches(":focus")) {
			_ref_input.value = v
		}

		saveStorageItem('page-generate-input', v)
	})

	sg_autoVersion.subscribe(v => {
		_ref_autoVersion.checked = v
		_ref_version.disabled = v
		saveStorageItem('page-generate-auto-version', v)
	})

	sg_version.subscribe(v => {
		if (!_ref_version.matches(":focus")) {
			_ref_version.valueAsNumber = v
		}

		saveStorageItem('page-generate-version', v)
	})

	sg_backgroundColor.subscribe(v => {
		if (!_ref_backgroundColor.matches(":focus")) {
			_ref_backgroundColor.value = v
		}

		saveStorageItem('page-generate-background-color', v)
	})

	sg_color.subscribe(v => {
		if (!_ref_color.matches(":focus")) {
			_ref_color.value = v
		}

		saveStorageItem('page-generate-color', v)
	})

	sg_encodingMode.subscribe(v => {
		_ref_encodingMode.value = v
		saveStorageItem('page-generate-encoding-mode', v)
	})

	sg_errorCorrectionLevel.subscribe(v => {
		_ref_errorCorrectionLevel.value = v
		saveStorageItem('page-generate-error-correction-level', v)
	})

	sg_margin.subscribe(v => {
		if (!_ref_margin.matches(":focus")) {
			_ref_margin.valueAsNumber = v
		}

		saveStorageItem('page-generate-margin', v)
	})

	subscribe(() => _generateQRCode(),
		sg_version,
		sg_backgroundColor,
		sg_encodingMode,
		sg_autoVersion,
		sg_color,
		sg_errorCorrectionLevel,
		sg_margin,
		sg_input
	)
}

function _initEvents(): void {
	delegateEvent(_ref_version, 'input', () =>
		sg_version.set(Math_clamp(safeNumber(_ref_version.valueAsNumber, 1), 1, 40))
	)

	delegateEvent(_ref_version, 'blur', () =>
		_ref_margin.valueAsNumber = sg_version()
	)

	delegateEvent(_ref_backgroundColor, 'input', () => {
		const value = _ref_backgroundColor.value
		if (!isColorValid(value)) {
			return
		}

		sg_backgroundColor.set(value as HEXColor)
	})

	delegateEvent(_ref_encodingMode, 'change', () => {
		const value = _ref_encodingMode.value as EncodingMode
		if (!isValidEnumValue(value, EncodingMode)) {
			return
		}

		sg_encodingMode.set(value)
	})

	delegateEvent(_ref_autoVersion, 'change', () =>
		sg_autoVersion.set(_ref_autoVersion.checked)
	)

	delegateEvent(_ref_color, 'input', () => {
		const value = _ref_color.value
		if (!isColorValid(value)) {
			return
		}

		sg_color.set(value as HEXColor)
	})

	delegateEvent(_ref_errorCorrectionLevel, 'change', () => {
		const value = _ref_errorCorrectionLevel.value as ErrorCorrectionLevel
		if (!isValidEnumValue(value, ErrorCorrectionLevel)) {
			return
		}

		sg_errorCorrectionLevel.set(value)
	})

	delegateEvent(_ref_margin, 'input', () =>
		sg_margin.set(Math.max(0, safeNumber(_ref_margin.valueAsNumber)))
	)

	delegateEvent(_ref_margin, 'blur', () =>
		_ref_margin.valueAsNumber = sg_margin()
	)

	delegateEvent(_ref_input, 'input', () =>
		sg_input.set(_ref_input.value)
	)

	delegateEvent(_ref_exportCopy, 'click', () => {
		_ref_output.toBlob((blob) => {
			if (!blob) {
				console.error("Blob generation failed")
				return
			}

			navigator.clipboard.read()
			const item = new ClipboardItem({ "image/png": blob })
			navigator.clipboard.write([item])
				.then(() => console.log("Image copied to clipboard!"))
				.catch((err) => console.error("Could not copy image: ", err))
		}, "image/png")
	})

	delegateEvent(_ref_exportPNG, 'click', () => {
		downloadFileByUrl(_ref_output.toDataURL('image/png', 1), 'qrcode')
	})

	delegateEvent(_ref_exportJPEG, 'click', () => {
		downloadFileByUrl(_ref_output.toDataURL('image/jpeg', 1), 'qrcode')
	})

	delegateEvent(_ref_exportSVG, 'click', () => {
		dataToQRString(sg_encodingMode() === EncodingMode.Auto
			? sg_input()
			: [{data: sg_input(), mode: sg_encodingMode() as any}],
		{
			color: {
				dark: sg_color(),
				light: sg_backgroundColor()
			},
			scale: 16,
			type: 'svg',
			errorCorrectionLevel: sg_errorCorrectionLevel(),
			margin: sg_margin(),
			version: sg_autoVersion()? undefined : sg_version(),
		}, (error, svg) => {
			if (error) {return}

			const svgUrl = 'data:image/svg+xml,' + encodeURIComponent(svg)
			downloadFileByUrl(svgUrl, 'qrcode')
		})
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
	sg_input.notify() // init update
}