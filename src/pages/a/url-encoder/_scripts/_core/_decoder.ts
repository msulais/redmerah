import { ObservableStore } from "@/utils/signal"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { DEFAULT_DECODED_TEXT } from "../_shared/_constant"
import { CMenu } from "@/components/Menu"
import { isTargetValidElement } from "@/utils/element"
import { CToast } from "@/components/Toast"
import { Math_clamp } from "@/utils/math"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

export type DecoderStoreType = Readonly<{
	decode: string
}>

export const DecoderStore = new ObservableStore<DecoderStoreType>({
	decode: DEFAULT_DECODED_TEXT,
})

const _ref_moreMenu = $(ElementIds.apMore_menu) as HTMLDivElement
const _ref_inputContainer = $(ElementIds.bd_inputContainer) as HTMLDivElement
const _ref_decode = $(ElementIds.bd_decode) as HTMLTextAreaElement
const _ref_encode = $(ElementIds.bd_encode) as HTMLTextAreaElement
const _ref_slider = $(ElementIds.bd_slider) as HTMLDivElement
const _ref_resetInput = $(ElementIds.apMore_reset) as CMenu.CItem.CElement
const _ref_copyDecode = $(ElementIds.apMore_copyDecode) as CMenu.CItem.CElement
const _ref_copyEncode = $(ElementIds.apMore_copyEncode) as CMenu.CItem.CElement
const _ref_toastCopied = $(ElementIds.toa_copied) as CToast.CElement
let _time_storage: NodeJS.Timeout | number | undefined
let _inputSource: 'encode' | 'decode' = 'decode'

function _subscribeInputChanges(v: DecoderStoreType, o: DecoderStoreType): void {
	const input = v.decode
	if (input === o.decode) {return}

	clearTimeout(_time_storage)
	_time_storage = setTimeout(() => {
		saveStorageItem('decode', input)
	}, 250)
}

function _subscribeInputView(v: DecoderStoreType): void {
	const input = v.decode
	if (input !== _ref_decode.value) {
		_ref_decode.value = input
	}

	if (_inputSource === 'encode') {return}

	_ref_encode.value = encodeURIComponent(input)
}

function _initSubscriber(): void {
	DecoderStore.subscribe(_subscribeInputChanges)
	DecoderStore.subscribe(_subscribeInputView)
}

function _initEvents(): void {
	function slider(): void {
		let screenWidth = document.body.clientWidth
		let isDragging = false
		let x: number | null = null
		const onPointerUp = (ev: PointerEvent) => {
			isDragging = false
			_ref_slider.releasePointerCapture(ev.pointerId)
		}

		window.addEventListener('resize', () => {
			if (x === null) {return}

			screenWidth = document.body.clientWidth
			requestAnimationFrame(() => {
				x = Math_clamp(x!, 300, screenWidth - 300)
				_ref_inputContainer.style.setProperty('min-width', pxToRem(x) + 'rem')
				_ref_inputContainer.style.setProperty('max-width', pxToRem(x) + 'rem')
			})
		})

		_ref_slider.addEventListener('pointerdown', (ev) => {
			isDragging = true
			screenWidth = document.body.clientWidth
			_ref_slider.setPointerCapture(ev.pointerId)
		})

		_ref_slider.addEventListener('pointermove', ev => {
			if (!isDragging) {return}

			requestAnimationFrame(() => {
				const paddingLeft = 10
				x = Math_clamp(ev.clientX - paddingLeft, 300, screenWidth - 300)
				_ref_inputContainer.style.setProperty('min-width', pxToRem(x) + 'rem')
				_ref_inputContainer.style.setProperty('max-width', pxToRem(x) + 'rem')
			})
		})

		_ref_slider.addEventListener('pointerup', onPointerUp)
		_ref_slider.addEventListener('pointercancel', onPointerUp)

		_ref_slider.addEventListener('dblclick', () => {
			x = null
			_ref_inputContainer.style.removeProperty('min-width')
			_ref_inputContainer.style.removeProperty('max-width')
		})
	}

	function init(): void {
		_ref_decode.addEventListener('input', () => {
			_inputSource = 'decode'
			DecoderStore.update(v => v.decode = _ref_decode.value)
		})

		_ref_encode.addEventListener('input', () => {
			_inputSource = 'encode'
			DecoderStore.update(v => v.decode = decodeURIComponent(_ref_encode.value))
		})

		_ref_moreMenu.addEventListener('click', () => {
			const ref_btn = document.activeElement as HTMLButtonElement
			if (!isTargetValidElement(_ref_moreMenu, ref_btn)) {return}

			const close = () => _ref_moreMenu.hidePopover()
			switch (ref_btn) {
			case _ref_resetInput:
				DecoderStore.update(v => v.decode = DEFAULT_DECODED_TEXT)
				close()
				break
			case _ref_copyEncode:
				navigator.clipboard.writeText(_ref_encode.value).then(() => {
					_ref_toastCopied.showPopover()
				})
				close()
				break
			case _ref_copyDecode:
				navigator.clipboard.writeText(_ref_decode.value).then(() => {
					_ref_toastCopied.showPopover()
				})
				close()
			}
		})
	}

	init()
	slider()
}

export default () => {
	_initEvents()
	_initSubscriber()
}