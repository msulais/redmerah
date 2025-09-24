import { ObservableStore } from "@/utils/store"
import { DEFAULT_SASS_TEXT, DEFAULT_SCSS_TEXT } from "../_shared/_constant"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { CButton } from "@/components/Button"
import { Math_clamp } from "@/utils/math"
import { CMenu } from "@/components/Menu"
import { CToast } from "@/components/Toast"
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

const _ref_inputContainer = $(ElementIds.bd_inputContainer) as HTMLDivElement
const _ref_slider = $(ElementIds.bd_slider) as HTMLDivElement
const _ref_moreMenu = $(ElementIds.apMore_menu) as HTMLDivElement
const _ref_resetSCSS = $(ElementIds.apMore_resetSCSS) as CMenu.CItem.CElement
const _ref_resetSASS = $(ElementIds.apMore_resetSASS) as CMenu.CItem.CElement
const _ref_openFile = $(ElementIds.apMore_open) as CMenu.CItem.CElement

// dow = download
const _ref_dow_menu = $(ElementIds.apMore_downloadMenu) as CMenu.CSub.CElement
const _ref_dow_scss = $(ElementIds.apMore_downloadSCSS) as CMenu.CItem.CElement
const _ref_dow_sass = $(ElementIds.apMore_downloadSASS) as CMenu.CItem.CElement
const _ref_dow_css = $(ElementIds.apMore_downloadCSS) as CMenu.CItem.CElement

// cp =  copy
const _ref_cp_menu = $(ElementIds.apMore_copyMenu) as CMenu.CSub.CElement
const _ref_cp_scss = $(ElementIds.apMore_copySCSS) as CMenu.CItem.CElement
const _ref_cp_sass = $(ElementIds.apMore_copySASS) as CMenu.CItem.CElement
const _ref_cp_css = $(ElementIds.apMore_copyCSS) as CMenu.CItem.CElement

// toa = toast
const _ref_toa_copied = $(ElementIds.bdToas_copied) as CToast.CElement
const _ref_toa_noFile = $(ElementIds.bdToas_noFile) as CToast.CElement
const _ref_toa_readError = $(ElementIds.bdToas_readError) as CToast.CElement

// inp = input
const _ref_inp_scss = $(ElementIds.bd_scss) as HTMLTextAreaElement
const _ref_inp_sass = $(ElementIds.bd_sass) as HTMLTextAreaElement

// out = output
const _ref_out_css = $(ElementIds.bd_css) as HTMLTextAreaElement

let _time_update: NodeJS.Timeout | number | undefined
let _time_SCSS: NodeJS.Timeout | number | undefined
let _time_SASS: NodeJS.Timeout | number | undefined

export function updateCSSOutput(): void {
	clearTimeout(_time_update)
	_time_update = setTimeout(() => {
		const store = ConverterStore.value
		const settings = SettingsStore.value
		const mode = settings.inputMode
		const minify = settings.minifyCSS
		const text = mode === InputMode.sass? store.sass : store.scss
		compileStringAsync(text, {
			style: minify? 'compressed' : 'expanded',
			syntax: mode === InputMode.sass? 'indented' : 'scss',
		})
		.then((v) => _ref_out_css.value = v.css)
		.catch(() => _ref_out_css.value = '')
	}, 100)
}

function _subsSCSSChanges(v: ConverterStoreType, o: ConverterStoreType): void {
	const scss = v.scss
	if (scss === o.scss) {return}

	clearTimeout(_time_SCSS)
	_time_SCSS = setTimeout(() => {
		saveStorageItem('input:scss', scss)
	}, 100)
}

function _subsSCSSView(v: ConverterStoreType, o: ConverterStoreType): void {
	const scss = v.scss
	if (scss !== _ref_inp_scss.value) {
		_ref_inp_scss.value = scss
	}

	if (scss === o.scss) {return}

	updateCSSOutput()
}

function _subsSASSChanges(v: ConverterStoreType, o: ConverterStoreType): void {
	const sass = v.sass
	if (sass === o.sass) {return}

	clearTimeout(_time_SASS)
	_time_SASS = setTimeout(() => {
		saveStorageItem('input:sass', sass)
	}, 100)
}

function _subsSASSView(v: ConverterStoreType, o: ConverterStoreType): void {
	const sass = v.sass
	if (sass !== _ref_inp_sass.value) {
		_ref_inp_sass.value = sass
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

	function input(): void {
		let timeMarkdownId: NodeJS.Timeout | number | null = null
		let timeCSSId: NodeJS.Timeout | number | null = null

		_ref_inp_scss.addEventListener('input', () => {
			if (timeMarkdownId !== null) {
				clearTimeout(timeMarkdownId)
			}

			timeMarkdownId = setTimeout(() => {
				timeMarkdownId = null
				ConverterStore.update(v => v.scss = _ref_inp_scss.value)
			}, 100)
		})

		_ref_inp_sass.addEventListener('input', () => {
			if (timeCSSId !== null) {
				clearTimeout(timeCSSId)
			}

			timeCSSId = setTimeout(() => {
				timeCSSId = null
				ConverterStore.update(v => v.sass = _ref_inp_sass.value)
			}, 100)
		})
	}

	function actions(): void {
		_ref_openFile.addEventListener('click', () => {
			_ref_moreMenu.hidePopover()
			pickFile('text/*', true).then(async (files) => {
				if (files == null || files.length == 0) {
					_ref_toa_noFile.showPopover()
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
					_ref_toa_readError.showPopover()
					return
				}

				ConverterStore.update(v => v.scss = text)
			})
		})

		_ref_resetSCSS.addEventListener('click', () => {
			_ref_moreMenu.hidePopover()
			ConverterStore.update(v => v.scss = DEFAULT_SCSS_TEXT)
		})

		_ref_resetSASS.addEventListener('click', () => {
			_ref_moreMenu.hidePopover()
			ConverterStore.update(v => v.sass = DEFAULT_SASS_TEXT)
		})

		_ref_cp_menu.addEventListener('click', () => {
			const ref_btn = document.activeElement as CButton.CElement
			if (!isTargetValidElement(_ref_cp_menu, ref_btn)) {return}

			const close = () => _ref_moreMenu.hidePopover()
			const copy = (text: string) => (navigator
				.clipboard
				.writeText(text)
				.then(() => _ref_toa_copied.showPopover())
			)
			switch (ref_btn) {
			case _ref_cp_scss:
				close()
				copy(_ref_inp_scss.value)
				break
			case _ref_cp_css:
				close()
				copy(_ref_out_css.value)
				break
			case _ref_cp_sass:
				close()
				copy(_ref_inp_sass.value)
				break
			}
		})

		_ref_dow_menu.addEventListener('click', () => {
			const ref_btn = document.activeElement as CButton.CElement
			if (!isTargetValidElement(_ref_dow_menu, ref_btn)) {return}

			const close = () => _ref_moreMenu.hidePopover()
			switch (ref_btn) {
			case _ref_dow_scss:
				close()
				downloadFile(new Blob([_ref_inp_scss.value]), 'style.scss')
				break
			case _ref_dow_sass:
				close()
				downloadFile(new Blob([_ref_inp_sass.value]), 'style.sass')
				break
			case _ref_dow_css:
				close()
				downloadFile(new Blob([_ref_out_css.value]), 'style.css')
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