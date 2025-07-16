import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import beautify from 'js-beautify'
import { $ } from "./_dom-utils"
import { DEFAULT_JAVASCRIPT_INPUT_TEXT } from "../_shared/_constant"
import { minify } from "terser"
import { SettingsStore } from "./_settings"
import { AppCSSColors } from "@/enums/app-data"
import type { MenuItemElement } from "@/components/Menu"
import { isTargetValidElement } from "@/utils/element"
import { downloadFile, pickFile, readFileAsText } from "@/utils/file"
import type { ToastElement } from "@/components/Toast"
import { Math_clamp } from "@/utils/math"
import { saveStorageItem } from "./_database"

export type MinifyStoreType = Readonly<{
	input: string
}>

export const MinifyStore = new ObservableStore<MinifyStoreType>({
	input: DEFAULT_JAVASCRIPT_INPUT_TEXT
})

const _moreMenuRef = $(ElementIds.apMore_menu) as HTMLDivElement
const _inputRef = $(ElementIds.bd_input) as HTMLTextAreaElement
const _inputContainerRef = $(ElementIds.bd_inputContainer) as HTMLDivElement
const _outputRef = $(ElementIds.bd_output) as HTMLTextAreaElement
const _sliderRef = $(ElementIds.bd_slider) as HTMLDivElement
const _openFileRef = $(ElementIds.apMore_open) as MenuItemElement
const _resetInputRef = $(ElementIds.apMore_reset) as MenuItemElement
const _copyOutputRef = $(ElementIds.apMore_copy) as MenuItemElement
const _downloadOutputRef = $(ElementIds.apMore_download) as MenuItemElement
const _toastCopiedRef = $(ElementIds.toa_copied) as ToastElement
const _toastNoFileRef = $(ElementIds.toa_noFile) as ToastElement
const _toastReadErrorRef = $(ElementIds.toa_readError) as ToastElement
let _timeUpdateOutputId: NodeJS.Timeout | number | null = null

function _subscribeInputChanges(v: MinifyStoreType, o: MinifyStoreType): void {
	const settings = SettingsStore.value
	const input = v.input
	if (input !== o.input) {
		saveStorageItem('input', input)
	}

	minify(input, {
		keep_classnames: settings.keepClassNames,
		keep_fnames: settings.keepFunctionNames,
		module: settings.module,
		toplevel: settings.topLevel,
	}).then((data) => {
		let output = data.code ?? ''
		if (settings.beautify) {
			output = beautify(output)
		}
		_outputRef.value = output
		_outputRef.style.removeProperty('color')
		_copyOutputRef.disabled = _downloadOutputRef.disabled = false
	}).catch((er) => {
		_copyOutputRef.disabled = _downloadOutputRef.disabled = true
		_outputRef.style.setProperty('color', `rgb(${AppCSSColors.error})`)
		_outputRef.value = er + ''
	})
}

function _subscribeInputView(v: MinifyStoreType): void {
	const input = v.input
	if (input === _inputRef.value) {return}

	_inputRef.value = input
}

function _initSubscriber(): void {
	MinifyStore.subscribe(_subscribeInputChanges)
	MinifyStore.subscribe(_subscribeInputView)
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
				_inputContainerRef.style.setProperty('min-width', x + 'px')
				_inputContainerRef.style.setProperty('max-width', x + 'px')
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
				_inputContainerRef.style.setProperty('min-width', x + 'px')
				_inputContainerRef.style.setProperty('max-width', x + 'px')
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
		_inputRef.addEventListener('input', () => {
			if (_timeUpdateOutputId !== null) {
				clearTimeout(_timeUpdateOutputId)
			}

			_timeUpdateOutputId = setTimeout(() => {
				_timeUpdateOutputId = null
				MinifyStore.update(v => v.input = _inputRef.value)
			}, 100)
		})

		_moreMenuRef.addEventListener('click', () => {
			const buttonRef = document.activeElement as HTMLButtonElement
			if (!isTargetValidElement(_moreMenuRef, buttonRef)) {return}

			const close = () => _moreMenuRef.hidePopover()
			switch (buttonRef) {
			case _openFileRef:
				pickFile('text/javascript', true).then(async (files) => {
					if (files == null || files.length == 0) {
						_toastNoFileRef.showPopover()
						return
					}

					let text: string = ''
					try {
						for (let i = 0; i < files.length; i++) {
							if (i > 0) text += '\n\n'

							const file = files[i]
							text += await readFileAsText(file)
						}
					} catch {
						_toastReadErrorRef.showPopover()
						return
					}

					MinifyStore.update(v => v.input = text)
				})
				close()
				break
			case _resetInputRef:
				MinifyStore.update(v => v.input = DEFAULT_JAVASCRIPT_INPUT_TEXT)
				close()
				break
			case _downloadOutputRef:
				downloadFile(new Blob([_outputRef.value]), 'output.min.js')
				close()
				break
			case _copyOutputRef:
				navigator.clipboard.writeText(_outputRef.value).then(() => {
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