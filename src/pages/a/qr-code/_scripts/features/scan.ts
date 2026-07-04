import * as Ids from '../shared/ids.enum.js'
import { signal } from "@/utils/signal"
import { BarcodeFormat, BrowserQRCodeReader } from "@zxing/browser"
import { DecodeHintType } from "@zxing/library"
import { $ } from '../core/dom-utils.js'
import { pickFile } from '@/utils/file'
import { delegateEvent } from '@/utils/event-registry'

export const sg_imgUrl = signal<string | null>(null)
export const sg_outputText = signal('')

const BARCODE_FORMAT: BarcodeFormat[] = [
	BarcodeFormat.QR_CODE,
	BarcodeFormat.AZTEC,
	BarcodeFormat.DATA_MATRIX,
	BarcodeFormat.MAXICODE,
]
const QR_DECODER_1 = new BrowserQRCodeReader()
const QR_DECODER_2 = new BrowserQRCodeReader(new Map([[DecodeHintType.PURE_BARCODE, BARCODE_FORMAT]]))
const QR_DECODER_3 = new BrowserQRCodeReader(new Map([[DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMAT]]))
const QR_DECODER_4 = new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, BARCODE_FORMAT]]))
const QR_DECODER_5 = new BrowserQRCodeReader(new Map([[DecodeHintType.OTHER, BARCODE_FORMAT]]))

const _ref_pickImgBtn = $(Ids.PageScanInput) as HTMLButtonElement
const _ref_imgPreview = $(Ids.PageScanPreview) as HTMLImageElement
const _ref_output     = $(Ids.PageScanOutput) as HTMLTextAreaElement
const _ref_copy       = $(Ids.PageScanCopy) as HTMLButtonElement

async function _decodeImage(decoder: BrowserQRCodeReader): Promise<string> {
	return (await decoder.decodeFromImageElement(_ref_imgPreview)).getText()
}

function _initSubscriber(): void {
	sg_outputText.subscribe(v => {
		_ref_output.value = v
	})

	sg_imgUrl.subscribe(async v => {
		// no image
		if (v === null) {
			_ref_copy.disabled = true
			sg_outputText.set('')
			return
		}

		_ref_imgPreview.src = v
		_ref_imgPreview.style.setProperty('display', 'block')

		let outputText: string | null = null
		for (const decoder of [QR_DECODER_1, QR_DECODER_2, QR_DECODER_3, QR_DECODER_4, QR_DECODER_5]) {
			if (outputText !== null) {
				break
			}

			try {
				outputText = await _decodeImage(decoder)
			} catch {}
		}

		sg_outputText.set(outputText ?? '')
		_ref_copy.disabled = outputText === null
		if (outputText !== null) {
			return
		}

		alert("Error: Unable to scan QR Code inside selected picture.")
	})
}

function _initEvents(): void {
	delegateEvent(_ref_pickImgBtn, 'click', () => {
		pickFile('image/*', false).then((files) => {
			if (files === null || files.length === 0) {
				return
			}

			for (const file of files) {
				if (!file.type.startsWith('image')) {
					continue
				}

				if (sg_imgUrl() !== null) {
					URL.revokeObjectURL(sg_imgUrl()!)
				}

				sg_imgUrl.set(URL.createObjectURL(file))
				break
			}
		})
	})

	delegateEvent(_ref_copy, 'click', () => {
		navigator.clipboard.writeText(_ref_output.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}