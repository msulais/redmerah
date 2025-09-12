import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { DEFAULT_UNESCAPE_XML_TEXT } from "../_shared/_constant"
import type { MenuItemElement } from "@/components/Menu"
import { isTargetValidElement } from "@/utils/element"
import type { ToastElement } from "@/components/Toast"
import { Math_clamp } from "@/utils/math"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

export type EscaperStoreType = Readonly<{
	unescape: string
}>

export const EscaperStore = new ObservableStore<EscaperStoreType>({
	unescape: DEFAULT_UNESCAPE_XML_TEXT,
})

const _moreMenuRef = $(ElementIds.apMore_menu) as HTMLDivElement
const _inputContainerRef = $(ElementIds.bd_inputContainer) as HTMLDivElement
const _unescapeRef = $(ElementIds.bd_unescape) as HTMLTextAreaElement
const _escapeRef = $(ElementIds.bd_escape) as HTMLTextAreaElement
const _sliderRef = $(ElementIds.bd_slider) as HTMLDivElement
const _resetInputRef = $(ElementIds.apMore_reset) as MenuItemElement
const _copyUnescapeRef = $(ElementIds.apMore_copyUnescape) as MenuItemElement
const _copyEscapeRef = $(ElementIds.apMore_copyEscape) as MenuItemElement
const _toastCopiedRef = $(ElementIds.toa_copied) as ToastElement
let _timeStorageId: NodeJS.Timeout | number | undefined
let _inputSource: 'escape' | 'unescape' = 'unescape'

function _subscribeInputChanges(v: EscaperStoreType, o: EscaperStoreType): void {
	const input = v.unescape
	if (input === o.unescape) {return}

	clearTimeout(_timeStorageId)
	_timeStorageId = setTimeout(() => {
		saveStorageItem('unescape', input)
	}, 250)
}

function _subscribeInputView(v: EscaperStoreType): void {
	const input = v.unescape
	if (input !== _unescapeRef.value) {
		_unescapeRef.value = input
	}

	if (_inputSource === 'escape') {return}

	_escapeRef.value = (
		input
		.replace(/&/g, '&amp;') // must first
		.replace(/'/g, '&apos;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
	)
}

function _initSubscriber(): void {
	EscaperStore.subscribe(_subscribeInputChanges)
	EscaperStore.subscribe(_subscribeInputView)
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
		_unescapeRef.addEventListener('input', () => {
			_inputSource = 'unescape'
			EscaperStore.update(v => v.unescape = _unescapeRef.value)
		})

		_escapeRef.addEventListener('input', () => {
			_inputSource = 'escape'
			EscaperStore.update(v => v.unescape = (
				_escapeRef
				.value
				.replace(/&amp;/g, '&' )
				.replace(/&quot;/g, '"' )
				.replace(/&apos;/g, '\'')
				.replace(/&lt;/g, '<' )
				.replace(/&gt;/g, '>' )
			))
		})

		_moreMenuRef.addEventListener('click', () => {
			const buttonRef = document.activeElement as HTMLButtonElement
			if (!isTargetValidElement(_moreMenuRef, buttonRef)) {return}

			const close = () => _moreMenuRef.hidePopover()
			switch (buttonRef) {
			case _resetInputRef:
				EscaperStore.update(v => v.unescape = DEFAULT_UNESCAPE_XML_TEXT)
				close()
				break
			case _copyEscapeRef:
				navigator.clipboard.writeText(_escapeRef.value).then(() => {
					_toastCopiedRef.showPopover()
				})
				close()
				break
			case _copyUnescapeRef:
				navigator.clipboard.writeText(_unescapeRef.value).then(() => {
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