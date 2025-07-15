import type { ButtonElement } from "@/native-components/Button"
import { $ } from "../_core/_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { BrowserQRCodeReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from "@zxing/library"
import { pickFile } from "@/utils/file"
import { ObservableStore } from "@/utils/store"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"
import type { TextAreaFieldElement } from "@/native-components/TextAreaField"

export type ScanStoreType = Readonly<{
	imgUrl: string | null
	outputText: string
}>

export const ScanStore = new ObservableStore<ScanStoreType>({
	imgUrl: null,
	outputText: ''
})
const _animationOptions = {
	duration: 250,
	easing: AnimationEffectTiming.spring
}
const _barcodeFormat: BarcodeFormat[] = [
	BarcodeFormat.QR_CODE,
	BarcodeFormat.AZTEC,
	BarcodeFormat.DATA_MATRIX,
	BarcodeFormat.MAXICODE,
]
const _qrDecoder01 = new BrowserQRCodeReader()
const _qrDecoder02 = new BrowserQRCodeReader(new Map([[DecodeHintType.PURE_BARCODE, _barcodeFormat]]))
const _qrDecoder03 = new BrowserQRCodeReader(new Map([[DecodeHintType.POSSIBLE_FORMATS, _barcodeFormat]]))
const _qrDecoder04 = new BrowserQRCodeReader(new Map([[DecodeHintType.TRY_HARDER, _barcodeFormat]]))
const _qrDecoder05 = new BrowserQRCodeReader(new Map([[DecodeHintType.OTHER, _barcodeFormat]]))
const _pickImgBtnRef = $(ElementIds.pgScan_pickImg) as ButtonElement
const _imgPreviewRef = $(ElementIds.pgScan_imgPreview) as HTMLImageElement
const _outputRef = $(ElementIds.pgScan_output) as TextAreaFieldElement

function _subsOutputView(v: ScanStoreType, o: ScanStoreType): void {
	const outputText = v.outputText
	if (outputText === o.outputText) {return}

	_outputRef.value = outputText
}

async function _subsImgUrlView(v: ScanStoreType, o: ScanStoreType): Promise<void> {
	const url = v.imgUrl
	if (url === o.imgUrl || url === null) {return}

	_imgPreviewRef.src = url
	if (isAnimationAllowed()) {
		_imgPreviewRef.animate({
			opacity: [0, 1],
			scale: [.9, 1]
		}, _animationOptions)
	}
	const decodeImage = (async (decoder: BrowserQRCodeReader) => (
		await decoder.decodeFromImageElement(_imgPreviewRef)
	).getText())

	let outputText: string | null = null
	for (const d of [_qrDecoder01, _qrDecoder02, _qrDecoder03, _qrDecoder04, _qrDecoder05]) {
		if (outputText !== null) {break}

		try {
			outputText = await decodeImage(d)
		} catch {}
	}

	ScanStore.update(v => v.outputText = outputText ?? '')
	if (outputText !== null) {return}

	// TODO: add into the abyss
	// openToast(toastErrorScanQRCodeRef)
}

function _initSubscriber(): void {
	ScanStore.subscribe(_subsImgUrlView)
	ScanStore.subscribe(_subsOutputView)
}

function _initEvents(): void {
	_pickImgBtnRef.addEventListener('click', () => {
		pickFile('image/*', false).then((files) => {
			if (files === null || files.length === 0) return

			for (const file of files) {
				if (!file.type.startsWith('image')) {continue}

				ScanStore.update(v => v.imgUrl = URL.createObjectURL(file))
				break
			}
		})
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}