import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import beautify from 'js-beautify'
import { $ } from "./_dom-utils"
import { DEFAULT_JAVASCRIPT_INPUT_TEXT } from "../_shared/_constant"
import { minify } from "terser"
import { SettingsStore } from "./_settings"
import { AppCSSColors } from "@/enums/app-data"
import { CMenu } from "@/components/Menu"
import { isTargetValidElement } from "@/utils/element"
import { downloadFile, pickFile, readFileAsText } from "@/utils/file"
import { CToast } from "@/components/Toast"
import { Math_clamp } from "@/utils/math"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

export type MinifyStoreType = Readonly<{
	input: string
}>

export const MinifyStore = new ObservableStore<MinifyStoreType>({
	input: DEFAULT_JAVASCRIPT_INPUT_TEXT
})

const _ref_moreMenu = $(ElementIds.apMore_menu) as HTMLDivElement
const _ref_input = $(ElementIds.bd_input) as HTMLTextAreaElement
const _ref_inputContainer = $(ElementIds.bd_inputContainer) as HTMLDivElement
const _ref_output = $(ElementIds.bd_output) as HTMLTextAreaElement
const _ref_slider = $(ElementIds.bd_slider) as HTMLDivElement
const _ref_openFile = $(ElementIds.apMore_open) as CMenu.CItem.CElement
const _ref_resetInput = $(ElementIds.apMore_reset) as CMenu.CItem.CElement
const _ref_copyOutput = $(ElementIds.apMore_copy) as CMenu.CItem.CElement
const _ref_downloadOutput = $(ElementIds.apMore_download) as CMenu.CItem.CElement
const _ref_toastCopied = $(ElementIds.toa_copied) as CToast.CElement
const _ref_toastNoFile = $(ElementIds.toa_noFile) as CToast.CElement
const _ref_toastReadError = $(ElementIds.toa_readError) as CToast.CElement
let _time_updateOutput: NodeJS.Timeout | number | null = null

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
		_ref_output.value = output
		_ref_output.style.removeProperty('color')
		_ref_copyOutput.disabled = _ref_downloadOutput.disabled = false
	}).catch((er) => {
		_ref_copyOutput.disabled = _ref_downloadOutput.disabled = true
		_ref_output.style.setProperty('color', `rgb(${AppCSSColors.error})`)
		_ref_output.value = er + ''
	})
}

function _subscribeInputView(v: MinifyStoreType): void {
	const input = v.input
	if (input === _ref_input.value) {return}

	_ref_input.value = input
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
		_ref_input.addEventListener('input', () => {
			if (_time_updateOutput !== null) {
				clearTimeout(_time_updateOutput)
			}

			_time_updateOutput = setTimeout(() => {
				_time_updateOutput = null
				MinifyStore.update(v => v.input = _ref_input.value)
			}, 100)
		})

		_ref_moreMenu.addEventListener('click', () => {
			const ref_btn = document.activeElement as HTMLButtonElement
			if (!isTargetValidElement(_ref_moreMenu, ref_btn)) {return}

			const close = () => _ref_moreMenu.hidePopover()
			switch (ref_btn) {
			case _ref_openFile:
				pickFile('text/javascript', true).then(async (files) => {
					if (files == null || files.length == 0) {
						_ref_toastNoFile.showPopover()
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
						_ref_toastReadError.showPopover()
						return
					}

					MinifyStore.update(v => v.input = text)
				})
				close()
				break
			case _ref_resetInput:
				MinifyStore.update(v => v.input = DEFAULT_JAVASCRIPT_INPUT_TEXT)
				close()
				break
			case _ref_downloadOutput:
				downloadFile(new Blob([_ref_output.value]), 'output.min.js')
				close()
				break
			case _ref_copyOutput:
				navigator.clipboard.writeText(_ref_output.value).then(() => {
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