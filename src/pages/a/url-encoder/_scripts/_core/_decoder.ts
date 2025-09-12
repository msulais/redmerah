import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { DEFAULT_DECODED_TEXT } from "../_shared/_constant"
import type { MenuItemElement } from "@/components/Menu"
import { isTargetValidElement } from "@/utils/element"
import type { ToastElement } from "@/components/Toast"
import { Math_clamp } from "@/utils/math"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

export type DecoderStoreType = Readonly<{
	decode: string
}>

export const DecoderStore = new ObservableStore<DecoderStoreType>({
	decode: DEFAULT_DECODED_TEXT,
})

const _moreMenuRef = $(ElementIds.apMore_menu) as HTMLDivElement
const _inputContainerRef = $(ElementIds.bd_inputContainer) as HTMLDivElement
const _decodeRef = $(ElementIds.bd_decode) as HTMLTextAreaElement
const _encodeRef = $(ElementIds.bd_encode) as HTMLTextAreaElement
const _sliderRef = $(ElementIds.bd_slider) as HTMLDivElement
const _resetInputRef = $(ElementIds.apMore_reset) as MenuItemElement
const _copyDecodeRef = $(ElementIds.apMore_copyDecode) as MenuItemElement
const _copyEncodeRef = $(ElementIds.apMore_copyEncode) as MenuItemElement
const _toastCopiedRef = $(ElementIds.toa_copied) as ToastElement
let _timeStorageId: NodeJS.Timeout | number | undefined
let _inputSource: 'encode' | 'decode' = 'decode'

function _subscribeInputChanges(v: DecoderStoreType, o: DecoderStoreType): void {
	const input = v.decode
	if (input === o.decode) {return}

	clearTimeout(_timeStorageId)
	_timeStorageId = setTimeout(() => {
		saveStorageItem('decode', input)
	}, 250)
}

function _subscribeInputView(v: DecoderStoreType): void {
	const input = v.decode
	if (input !== _decodeRef.value) {
		_decodeRef.value = input
	}

	if (_inputSource === 'encode') {return}

	_encodeRef.value = encodeURIComponent(input)
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
			_sliderRef.releasePointerCapture(ev.pointerId)
		}

		window.addEventListener('resize', () => {
			if (x === null) {return}

			screenWidth = document.body.clientWidth
			requestAnimationFrame(() => {
				x = Math_clamp(x!, 300, screenWidth - 300)
				_inputContainerRef.style.setProperty('min-width', pxToRem(x) + 'rem')
				_inputContainerRef.style.setProperty('max-width', pxToRem(x) + 'rem')
			})
		})

		_sliderRef.addEventListener('pointerdown', (ev) => {
			isDragging = true
			screenWidth = document.body.clientWidth
			_sliderRef.setPointerCapture(ev.pointerId)
		})

		_sliderRef.addEventListener('pointermove', ev => {
			if (!isDragging) {return}

			requestAnimationFrame(() => {
				const paddingLeft = 10
				x = Math_clamp(ev.clientX - paddingLeft, 300, screenWidth - 300)
				_inputContainerRef.style.setProperty('min-width', pxToRem(x) + 'rem')
				_inputContainerRef.style.setProperty('max-width', pxToRem(x) + 'rem')
			})
		})

		_sliderRef.addEventListener('pointerup', onPointerUp)
		_sliderRef.addEventListener('pointercancel', onPointerUp)

		_sliderRef.addEventListener('dblclick', () => {
			x = null
			_inputContainerRef.style.removeProperty('min-width')
			_inputContainerRef.style.removeProperty('max-width')
		})
	}

	function init(): void {
		_decodeRef.addEventListener('input', () => {
			_inputSource = 'decode'
			DecoderStore.update(v => v.decode = _decodeRef.value)
		})

		_encodeRef.addEventListener('input', () => {
			_inputSource = 'encode'
			DecoderStore.update(v => v.decode = decodeURIComponent(_encodeRef.value))
		})

		_moreMenuRef.addEventListener('click', () => {
			const buttonRef = document.activeElement as HTMLButtonElement
			if (!isTargetValidElement(_moreMenuRef, buttonRef)) {return}

			const close = () => _moreMenuRef.hidePopover()
			switch (buttonRef) {
			case _resetInputRef:
				DecoderStore.update(v => v.decode = DEFAULT_DECODED_TEXT)
				close()
				break
			case _copyEncodeRef:
				navigator.clipboard.writeText(_encodeRef.value).then(() => {
					_toastCopiedRef.showPopover()
				})
				close()
				break
			case _copyDecodeRef:
				navigator.clipboard.writeText(_decodeRef.value).then(() => {
					_toastCopiedRef.showPopover()
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