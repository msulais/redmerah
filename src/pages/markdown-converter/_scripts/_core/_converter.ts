import { ObservableStore } from "@/utils/store"
import { DEFAULT_CSS_TEXT, DEFAULT_MARKDOWN_TEXT } from "../_shared/_constant"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { ButtonVariant, updateButtonRef, type ButtonElement } from "@/native-components/Button"
import { Math_clamp } from "@/utils/math"
import { marked } from "marked"
import { html_beautify } from "js-beautify"
import type { MenuItemElement, SubMenuElement } from "@/native-components/Menu"
import type { ToastElement } from "@/native-components/Toast"
import { downloadFile, pickFile, readFileAsText } from "@/utils/file"
import { isTargetValidElement } from "@/utils/element"
import { saveStorageItem } from "./_database"

export type ConverterStoreType = Readonly<{
	markdown: string
	css: string
}>

export const ConverterStore = new ObservableStore<ConverterStoreType>({
	css: DEFAULT_CSS_TEXT,
	markdown: DEFAULT_MARKDOWN_TEXT
})

const _tabCSSRef = $(ElementIds.bdTab_css) as ButtonElement
const _inputContainerRef = $(ElementIds.bd_inputContainer) as HTMLDivElement
const _sliderRef = $(ElementIds.bd_slider) as HTMLDivElement
const _moreMenuRef = $(ElementIds.apMore_menu) as HTMLDivElement
const _printRef = $(ElementIds.apMore_print) as MenuItemElement
const _resetMarkdownRef = $(ElementIds.apMore_resetMarkdown) as MenuItemElement
const _resetCSSRef = $(ElementIds.apMore_resetCSS) as MenuItemElement
const _openFileRef = $(ElementIds.apMore_open) as MenuItemElement
const _tabPreviewRef = $(ElementIds.bdTab_preview) as ButtonElement
const _tabHTMLRef = $(ElementIds.bdTab_html) as ButtonElement
const _tabMarkdownRef = $(ElementIds.bdTab_markdown) as ButtonElement

// dow = download
const _dow_menuRef = $(ElementIds.apMore_downloadMenu) as SubMenuElement
const _dow_markdownRef = $(ElementIds.apMore_downloadMarkdown) as MenuItemElement
const _dow_cssRef = $(ElementIds.apMore_downloadCSS) as MenuItemElement
const _dow_htmlRef = $(ElementIds.apMore_downloadHTML) as MenuItemElement

// cp =  copy
const _cp_menuRef = $(ElementIds.apMore_copyMenu) as SubMenuElement
const _cp_markdownRef = $(ElementIds.apMore_copyMarkdown) as MenuItemElement
const _cp_cssRef = $(ElementIds.apMore_copyCSS) as MenuItemElement
const _cp_htmlRef = $(ElementIds.apMore_copyHTML) as MenuItemElement

// toa = toast
const _toa_copiedRef = $(ElementIds.bdToas_copied) as ToastElement
const _toa_noFileRef = $(ElementIds.bdToas_noFile) as ToastElement
const _toa_readErrorRef = $(ElementIds.bdToas_readError) as ToastElement

// inp = input
const _inp_markdownRef = $(ElementIds.bd_markdown) as HTMLTextAreaElement
const _inp_cssRef = $(ElementIds.bd_css) as HTMLTextAreaElement

// out = output
const _out_htmlRef = $(ElementIds.bd_html) as HTMLTextAreaElement
const _out_previewRef = $(ElementIds.bd_preview) as HTMLIFrameElement

function _subsMarkdownChanges(v: ConverterStoreType, o: ConverterStoreType): void {
	const markdown = v.markdown
	if (markdown === o.markdown) {return}

	saveStorageItem('input:markdown', markdown)
}

function _subsMarkdownView(v: ConverterStoreType, o: ConverterStoreType): void {
	const markdown = v.markdown
	if (markdown !== _inp_markdownRef.value) {
		_inp_markdownRef.value = markdown
	}

	if (markdown === o.markdown) {return}

	const html = marked(markdown, {async: false}) as string
	_out_previewRef.srcdoc =  ['<style>', v.css,'</style>', html].join('')
	_out_htmlRef.value = html_beautify(html)
}

function _subsCSSChanges(v: ConverterStoreType, o: ConverterStoreType): void {
	const css = v.css
	if (css === o.css) {return}

	saveStorageItem('input:css', css)
}

function _subsCSSView(v: ConverterStoreType, o: ConverterStoreType): void {
	const css = v.css
	if (css !== _inp_cssRef.value) {
		_inp_cssRef.value = css
	}

	if (css === o.css) {return}

	const html = marked(v.markdown, {async: false}) as string
	_out_previewRef.srcdoc =  ['<style>', css,'</style>', html].join('')
}

function _initSubscriber(): void {
	ConverterStore.subscribe(_subsMarkdownView)
	ConverterStore.subscribe(_subsMarkdownChanges)
	ConverterStore.subscribe(_subsCSSView)
	ConverterStore.subscribe(_subsCSSChanges)
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

	function input(): void {
		let timeMarkdownId: NodeJS.Timeout | number | null = null
		let timeCSSId: NodeJS.Timeout | number | null = null

		_inp_markdownRef.addEventListener('input', () => {
			if (timeMarkdownId !== null) {
				clearTimeout(timeMarkdownId)
			}

			timeMarkdownId = setTimeout(() => {
				timeMarkdownId = null
				ConverterStore.update(v => ({...v, markdown: _inp_markdownRef.value}))
			}, 100)
		})

		_inp_cssRef.addEventListener('input', () => {
			if (timeCSSId !== null) {
				clearTimeout(timeCSSId)
			}

			timeCSSId = setTimeout(() => {
				timeCSSId = null
				ConverterStore.update(v => ({...v, css: _inp_cssRef.value}))
			}, 100)
		})
	}

	function actions(): void {
		_printRef.addEventListener('click', () => {
			_moreMenuRef.hidePopover()
			_out_previewRef.contentWindow?.print()
		})

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

				ConverterStore.update(v => ({...v, markdown: text}))
			})
		})

		_resetMarkdownRef.addEventListener('click', () => {
			_moreMenuRef.hidePopover()
			ConverterStore.update(v => ({...v,
				markdown: DEFAULT_MARKDOWN_TEXT,
			}))
		})

		_resetCSSRef.addEventListener('click', () => {
			_moreMenuRef.hidePopover()
			ConverterStore.update(v => ({...v,
				css: DEFAULT_CSS_TEXT,
			}))
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
			case _cp_markdownRef:
				close()
				copy(_inp_markdownRef.value)
				break
			case _cp_htmlRef:
				close()
				copy(_out_htmlRef.value)
				break
			case _cp_cssRef:
				close()
				copy(_inp_cssRef.value)
				break
			}
		})

		_dow_menuRef.addEventListener('click', () => {
			const btnRef = document.activeElement as ButtonElement
			if (!isTargetValidElement(_dow_menuRef, btnRef)) {return}

			const close = () => _moreMenuRef.hidePopover()
			switch (btnRef) {
			case _dow_markdownRef:
				close()
				downloadFile(new Blob([_inp_markdownRef.value]), 'markdown.md')
				break
			case _dow_cssRef:
				close()
				downloadFile(new Blob([_inp_cssRef.value]), 'style.css')
				break
			case _dow_htmlRef:
				close()
				downloadFile(new Blob([_out_previewRef.contentWindow?.document.documentElement.outerHTML ?? '']), 'page.html')
				break
			}
		})
	}

	function init(): void {
		_tabPreviewRef.addEventListener('click', () => {
			_out_htmlRef.style.setProperty('display', 'none')
			_out_previewRef.style.removeProperty('display')
			updateButtonRef(_tabPreviewRef, {ButtonVariant: ButtonVariant.filled})
			updateButtonRef(_tabHTMLRef, {ButtonVariant: ButtonVariant.outlined})
		})

		_tabHTMLRef.addEventListener('click', () => {
			_out_previewRef.style.setProperty('display', 'none')
			_out_htmlRef.style.removeProperty('display')
			updateButtonRef(_tabHTMLRef, {ButtonVariant: ButtonVariant.filled})
			updateButtonRef(_tabPreviewRef, {ButtonVariant: ButtonVariant.outlined})
		})

		_tabMarkdownRef.addEventListener('click', () => {
			_inp_cssRef.style.setProperty('display', 'none')
			_inp_markdownRef.style.removeProperty('display')
			updateButtonRef(_tabMarkdownRef, {ButtonVariant: ButtonVariant.filled})
			updateButtonRef(_tabCSSRef, {ButtonVariant: ButtonVariant.outlined})
		})

		_tabCSSRef.addEventListener('click', () => {
			_inp_markdownRef.style.setProperty('display', 'none')
			_inp_cssRef.style.removeProperty('display')
			updateButtonRef(_tabCSSRef, {ButtonVariant: ButtonVariant.filled})
			updateButtonRef(_tabMarkdownRef, {ButtonVariant: ButtonVariant.outlined})
		})
	}

	init()
	input()
	slider()
	actions()
}

export default () => {
	_initSubscriber()
	_initEvents()
}