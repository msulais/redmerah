import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { DEFAULT_UNESCAPE_XML_TEXT } from "../_shared/_constant"
import { CMenu } from "@/components/Menu"
import { isTargetValidElement } from "@/utils/element"
import { CToast } from "@/components/Toast"
import { Math_clamp } from "@/utils/math"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

export type EscaperStoreType = Readonly<{
	unescape: string
}>

export const EscaperStore = new ObservableStore<EscaperStoreType>({
	unescape: DEFAULT_UNESCAPE_XML_TEXT,
})

const _ref_moreMenu = $(ElementIds.apMore_menu) as HTMLDivElement
const _ref_inputContainer = $(ElementIds.bd_inputContainer) as HTMLDivElement
const _ref_unescape = $(ElementIds.bd_unescape) as HTMLTextAreaElement
const _ref_escape = $(ElementIds.bd_escape) as HTMLTextAreaElement
const _ref_slider = $(ElementIds.bd_slider) as HTMLDivElement
const _ref_resetInput = $(ElementIds.apMore_reset) as CMenu.CItem.CElement
const _ref_copyUnescape = $(ElementIds.apMore_copyUnescape) as CMenu.CItem.CElement
const _ref_copyEscape = $(ElementIds.apMore_copyEscape) as CMenu.CItem.CElement
const _ref_toastCopied = $(ElementIds.toa_copied) as CToast.CElement
let _time_storage: NodeJS.Timeout | number | undefined
let _inputSource: 'escape' | 'unescape' = 'unescape'

function _subscribeInputChanges(v: EscaperStoreType, o: EscaperStoreType): void {
	const input = v.unescape
	if (input === o.unescape) {return}

	clearTimeout(_time_storage)
	_time_storage = setTimeout(() => {
		saveStorageItem('unescape', input)
	}, 250)
}

function _subscribeInputView(v: EscaperStoreType): void {
	const input = v.unescape
	if (input !== _ref_unescape.value) {
		_ref_unescape.value = input
	}

	if (_inputSource === 'escape') {return}

	_ref_escape.value = (
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
		_ref_unescape.addEventListener('input', () => {
			_inputSource = 'unescape'
			EscaperStore.update(v => v.unescape = _ref_unescape.value)
		})

		_ref_escape.addEventListener('input', () => {
			_inputSource = 'escape'
			EscaperStore.update(v => v.unescape = (
				_ref_escape
				.value
				.replace(/&amp;/g, '&' )
				.replace(/&quot;/g, '"' )
				.replace(/&apos;/g, '\'')
				.replace(/&lt;/g, '<' )
				.replace(/&gt;/g, '>' )
			))
		})

		_ref_moreMenu.addEventListener('click', () => {
			const ref_btn = document.activeElement as HTMLButtonElement
			if (!isTargetValidElement(_ref_moreMenu, ref_btn)) {return}

			const close = () => _ref_moreMenu.hidePopover()
			switch (ref_btn) {
			case _ref_resetInput:
				EscaperStore.update(v => v.unescape = DEFAULT_UNESCAPE_XML_TEXT)
				close()
				break
			case _ref_copyEscape:
				navigator.clipboard.writeText(_ref_escape.value).then(() => {
					_ref_toastCopied.showPopover()
				})
				close()
				break
			case _ref_copyUnescape:
				navigator.clipboard.writeText(_ref_unescape.value).then(() => {
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