import { ObservableStore } from "@/utils/store"
import { DEFAULT_SASS_TEXT, DEFAULT_SCSS_TEXT } from "../_shared/_constant"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { type ButtonElement } from "@/components/Button"
import { Math_clamp } from "@/utils/math"
import type { MenuItemElement, SubMenuElement } from "@/components/Menu"
import type { ToastElement } from "@/components/Toast"
import { downloadFile, pickFile, readFileAsText } from "@/utils/file"
import { isTargetValidElement } from "@/utils/element"
import { SettingsStore } from "./_settings"
import { InputMode } from "../_shared/_enums"
import { compileStringAsync } from "sass"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

export type ConverterStoreType = Readonly<{
	scss: string
	sass: string
}>

export const ConverterStore = new ObservableStore<ConverterStoreType>({
	sass: DEFAULT_SASS_TEXT,
	scss: DEFAULT_SCSS_TEXT
})

const _inputContainerRef = $(ElementIds.bd_inputContainer) as HTMLDivElement
const _sliderRef = $(ElementIds.bd_slider) as HTMLDivElement
const _moreMenuRef = $(ElementIds.apMore_menu) as HTMLDivElement
const _resetSCSSRef = $(ElementIds.apMore_resetSCSS) as MenuItemElement
const _resetSASSRef = $(ElementIds.apMore_resetSASS) as MenuItemElement
const _openFileRef = $(ElementIds.apMore_open) as MenuItemElement

// dow = download
const _dow_menuRef = $(ElementIds.apMore_downloadMenu) as SubMenuElement
const _dow_scssRef = $(ElementIds.apMore_downloadSCSS) as MenuItemElement
const _dow_sassRef = $(ElementIds.apMore_downloadSASS) as MenuItemElement
const _dow_cssRef = $(ElementIds.apMore_downloadCSS) as MenuItemElement

// cp =  copy
const _cp_menuRef = $(ElementIds.apMore_copyMenu) as SubMenuElement
const _cp_scssRef = $(ElementIds.apMore_copySCSS) as MenuItemElement
const _cp_sassRef = $(ElementIds.apMore_copySASS) as MenuItemElement
const _cp_cssRef = $(ElementIds.apMore_copyCSS) as MenuItemElement

// toa = toast
const _toa_copiedRef = $(ElementIds.bdToas_copied) as ToastElement
const _toa_noFileRef = $(ElementIds.bdToas_noFile) as ToastElement
const _toa_readErrorRef = $(ElementIds.bdToas_readError) as ToastElement

// inp = input
const _inp_scssRef = $(ElementIds.bd_scss) as HTMLTextAreaElement
const _inp_sassRef = $(ElementIds.bd_sass) as HTMLTextAreaElement

// out = output
const _out_cssRef = $(ElementIds.bd_css) as HTMLTextAreaElement

let _timeUpdateId: NodeJS.Timeout | number | undefined
let _timeSCSSId: NodeJS.Timeout | number | undefined
let _timeSASSId: NodeJS.Timeout | number | undefined

export function updateCSSOutput(): void {
	clearTimeout(_timeUpdateId)
	_timeUpdateId = setTimeout(() => {
		const store = ConverterStore.value
		const settings = SettingsStore.value
		const mode = settings.inputMode
		const minify = settings.minifyCSS
		const text = mode === InputMode.sass? store.sass : store.scss
		compileStringAsync(text, {
			style: minify? 'compressed' : 'expanded',
			syntax: mode === InputMode.sass? 'indented' : 'scss',
		})
		.then((v) => _out_cssRef.value = v.css)
		.catch(() => _out_cssRef.value = '')
	}, 100)
}

function _subsSCSSChanges(v: ConverterStoreType, o: ConverterStoreType): void {
	const scss = v.scss
	if (scss === o.scss) {return}

	clearTimeout(_timeSCSSId)
	_timeSCSSId = setTimeout(() => {
		saveStorageItem('input:scss', scss)
	}, 100)
}

function _subsSCSSView(v: ConverterStoreType, o: ConverterStoreType): void {
	const scss = v.scss
	if (scss !== _inp_scssRef.value) {
		_inp_scssRef.value = scss
	}

	if (scss === o.scss) {return}

	updateCSSOutput()
}

function _subsSASSChanges(v: ConverterStoreType, o: ConverterStoreType): void {
	const sass = v.sass
	if (sass === o.sass) {return}

	clearTimeout(_timeSASSId)
	_timeSASSId = setTimeout(() => {
		saveStorageItem('input:sass', sass)
	}, 100)
}

function _subsSASSView(v: ConverterStoreType, o: ConverterStoreType): void {
	const sass = v.sass
	if (sass !== _inp_sassRef.value) {
		_inp_sassRef.value = sass
	}

	if (sass === o.sass) {return}

	updateCSSOutput()
}

function _initSubscriber(): void {
	ConverterStore.subscribe(_subsSCSSView)
	ConverterStore.subscribe(_subsSCSSChanges)
	ConverterStore.subscribe(_subsSASSView)
	ConverterStore.subscribe(_subsSASSChanges)
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

	function input(): void {
		let timeMarkdownId: NodeJS.Timeout | number | null = null
		let timeCSSId: NodeJS.Timeout | number | null = null

		_inp_scssRef.addEventListener('input', () => {
			if (timeMarkdownId !== null) {
				clearTimeout(timeMarkdownId)
			}

			timeMarkdownId = setTimeout(() => {
				timeMarkdownId = null
				ConverterStore.update(v => v.scss = _inp_scssRef.value)
			}, 100)
		})

		_inp_sassRef.addEventListener('input', () => {
			if (timeCSSId !== null) {
				clearTimeout(timeCSSId)
			}

			timeCSSId = setTimeout(() => {
				timeCSSId = null
				ConverterStore.update(v => v.sass = _inp_sassRef.value)
			}, 100)
		})
	}

	function actions(): void {
		_openFileRef.addEventListener('click', () => {
			_moreMenuRef.hidePopover()
			pickFile('text/*', true).then(async (files) => {
				if (files == null || files.length == 0) {
					_toa_noFileRef.showPopover()
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
					_toa_readErrorRef.showPopover()
					return
				}

				ConverterStore.update(v => v.scss = text)
			})
		})

		_resetSCSSRef.addEventListener('click', () => {
			_moreMenuRef.hidePopover()
			ConverterStore.update(v => v.scss = DEFAULT_SCSS_TEXT)
		})

		_resetSASSRef.addEventListener('click', () => {
			_moreMenuRef.hidePopover()
			ConverterStore.update(v => v.sass = DEFAULT_SASS_TEXT)
		})

		_cp_menuRef.addEventListener('click', () => {
			const btnRef = document.activeElement as ButtonElement
			if (!isTargetValidElement(_cp_menuRef, btnRef)) {return}

			const close = () => _moreMenuRef.hidePopover()
			const copy = (text: string) => (navigator
				.clipboard
				.writeText(text)
				.then(() => _toa_copiedRef.showPopover())
			)
			switch (btnRef) {
			case _cp_scssRef:
				close()
				copy(_inp_scssRef.value)
				break
			case _cp_cssRef:
				close()
				copy(_out_cssRef.value)
				break
			case _cp_sassRef:
				close()
				copy(_inp_sassRef.value)
				break
			}
		})

		_dow_menuRef.addEventListener('click', () => {
			const btnRef = document.activeElement as ButtonElement
			if (!isTargetValidElement(_dow_menuRef, btnRef)) {return}

			const close = () => _moreMenuRef.hidePopover()
			switch (btnRef) {
			case _dow_scssRef:
				close()
				downloadFile(new Blob([_inp_scssRef.value]), 'style.scss')
				break
			case _dow_sassRef:
				close()
				downloadFile(new Blob([_inp_sassRef.value]), 'style.sass')
				break
			case _dow_cssRef:
				close()
				downloadFile(new Blob([_out_cssRef.value]), 'style.css')
				break
			}
		})
	}

	input()
	slider()
	actions()
}

export default () => {
	_initSubscriber()
	_initEvents()
}