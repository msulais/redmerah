import { ObservableStore } from "@/utils/signal"
import { DEFAULT_CSS_TEXT, DEFAULT_MARKDOWN_TEXT } from "../_shared/_constant"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { CButton } from "@/components/Button"
import { Math_clamp } from "@/utils/math"
import { marked } from "marked"
import { html_beautify } from "js-beautify"
import { CMenu } from "@/components/Menu"
import { CToast } from "@/components/Toast"
import { downloadFile, pickFile, readFileAsText } from "@/utils/file"
import { isTargetValidElement } from "@/utils/element"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

export type ConverterStoreType = Readonly<{
	markdown: string
	css: string
}>

export const ConverterStore = new ObservableStore<ConverterStoreType>({
	css: DEFAULT_CSS_TEXT,
	markdown: DEFAULT_MARKDOWN_TEXT
})

const _ref_tabCSS = $(ElementIds.bdTab_css) as CButton.CElement
const _ref_inputContainer = $(ElementIds.bd_inputContainer) as HTMLDivElement
const _ref_slider = $(ElementIds.bd_slider) as HTMLDivElement
const _ref_moreMenu = $(ElementIds.apMore_menu) as HTMLDivElement
const _ref_print = $(ElementIds.apMore_print) as CMenu.CItem.CElement
const _ref_resetMarkdown = $(ElementIds.apMore_resetMarkdown) as CMenu.CItem.CElement
const _ref_resetCSS = $(ElementIds.apMore_resetCSS) as CMenu.CItem.CElement
const _ref_openFile = $(ElementIds.apMore_open) as CMenu.CItem.CElement
const _ref_tabPreview = $(ElementIds.bdTab_preview) as CButton.CElement
const _ref_tabHTML = $(ElementIds.bdTab_html) as CButton.CElement
const _ref_tabMarkdown = $(ElementIds.bdTab_markdown) as CButton.CElement

// dow = download
const _ref_dow_menu = $(ElementIds.apMore_downloadMenu) as CMenu.CSub.CElement
const _ref_dow_markdown = $(ElementIds.apMore_downloadMarkdown) as CMenu.CItem.CElement
const _ref_dow_css = $(ElementIds.apMore_downloadCSS) as CMenu.CItem.CElement
const _ref_dow_html = $(ElementIds.apMore_downloadHTML) as CMenu.CItem.CElement

// cp =  copy
const _ref_cp_menu = $(ElementIds.apMore_copyMenu) as CMenu.CSub.CElement
const _ref_cp_markdown = $(ElementIds.apMore_copyMarkdown) as CMenu.CItem.CElement
const _ref_cp_css = $(ElementIds.apMore_copyCSS) as CMenu.CItem.CElement
const _ref_cp_html = $(ElementIds.apMore_copyHTML) as CMenu.CItem.CElement

// toa = toast
const _ref_toa_copied = $(ElementIds.bdToas_copied) as CToast.CElement
const _ref_toa_noFile = $(ElementIds.bdToas_noFile) as CToast.CElement
const _ref_toa_readError = $(ElementIds.bdToas_readError) as CToast.CElement

// inp = input
const _ref_inp_markdown = $(ElementIds.bd_markdown) as HTMLTextAreaElement
const _ref_inp_css = $(ElementIds.bd_css) as HTMLTextAreaElement

// out = output
const _ref_out_html = $(ElementIds.bd_html) as HTMLTextAreaElement
const _out_ref_preview = $(ElementIds.bd_preview) as HTMLIFrameElement

function _subsMarkdownChanges(v: ConverterStoreType, o: ConverterStoreType): void {
	const markdown = v.markdown
	if (markdown === o.markdown) {return}

	saveStorageItem('input:markdown', markdown)
}

function _subsMarkdownView(v: ConverterStoreType, o: ConverterStoreType): void {
	const markdown = v.markdown
	if (markdown !== _ref_inp_markdown.value) {
		_ref_inp_markdown.value = markdown
	}

	if (markdown === o.markdown) {return}

	const html = marked(markdown, {async: false}) as string
	_out_ref_preview.srcdoc =  ['<style>', v.css,'</style>', html].join('')
	_ref_out_html.value = html_beautify(html)
}

function _subsCSSChanges(v: ConverterStoreType, o: ConverterStoreType): void {
	const css = v.css
	if (css === o.css) {return}

	saveStorageItem('input:css', css)
}

function _subsCSSView(v: ConverterStoreType, o: ConverterStoreType): void {
	const css = v.css
	if (css !== _ref_inp_css.value) {
		_ref_inp_css.value = css
	}

	if (css === o.css) {return}

	const html = marked(v.markdown, {async: false}) as string
	_out_ref_preview.srcdoc =  ['<style>', css,'</style>', html].join('')
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

		_ref_inp_markdown.addEventListener('input', () => {
			if (timeMarkdownId !== null) {
				clearTimeout(timeMarkdownId)
			}

			timeMarkdownId = setTimeout(() => {
				timeMarkdownId = null
				ConverterStore.update(v => v.markdown = _ref_inp_markdown.value)
			}, 100)
		})

		_ref_inp_css.addEventListener('input', () => {
			if (timeCSSId !== null) {
				clearTimeout(timeCSSId)
			}

			timeCSSId = setTimeout(() => {
				timeCSSId = null
				ConverterStore.update(v => v.css = _ref_inp_css.value)
			}, 100)
		})
	}

	function actions(): void {
		_ref_print.addEventListener('click', () => {
			_ref_moreMenu.hidePopover()
			_out_ref_preview.contentWindow?.print()
		})

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

				ConverterStore.update(v => v.markdown = text)
			})
		})

		_ref_resetMarkdown.addEventListener('click', () => {
			_ref_moreMenu.hidePopover()
			ConverterStore.update(v => v.markdown = DEFAULT_MARKDOWN_TEXT)
		})

		_ref_resetCSS.addEventListener('click', () => {
			_ref_moreMenu.hidePopover()
			ConverterStore.update(v => v.css = DEFAULT_CSS_TEXT)
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
			case _ref_cp_markdown:
				close()
				copy(_ref_inp_markdown.value)
				break
			case _ref_cp_html:
				close()
				copy(_ref_out_html.value)
				break
			case _ref_cp_css:
				close()
				copy(_ref_inp_css.value)
				break
			}
		})

		_ref_dow_menu.addEventListener('click', () => {
			const ref_btn = document.activeElement as CButton.CElement
			if (!isTargetValidElement(_ref_dow_menu, ref_btn)) {return}

			const close = () => _ref_moreMenu.hidePopover()
			switch (ref_btn) {
			case _ref_dow_markdown:
				close()
				downloadFile(new Blob([_ref_inp_markdown.value]), 'markdown.md')
				break
			case _ref_dow_css:
				close()
				downloadFile(new Blob([_ref_inp_css.value]), 'style.css')
				break
			case _ref_dow_html:
				close()
				downloadFile(new Blob([_out_ref_preview.contentWindow?.document.documentElement.outerHTML ?? '']), 'page.html')
				break
			}
		})
	}

	function init(): void {
		_ref_tabPreview.addEventListener('click', () => {
			_ref_out_html.style.setProperty('display', 'none')
			_out_ref_preview.style.removeProperty('display')
			CButton.update(_ref_tabPreview, {Button: {variant: CButton.Variant.Filled}})
			CButton.update(_ref_tabHTML, {Button: {variant: CButton.Variant.Outlined}})
		})

		_ref_tabHTML.addEventListener('click', () => {
			_out_ref_preview.style.setProperty('display', 'none')
			_ref_out_html.style.removeProperty('display')
			CButton.update(_ref_tabHTML, {Button: {variant: CButton.Variant.Filled}})
			CButton.update(_ref_tabPreview, {Button: {variant: CButton.Variant.Outlined}})
		})

		_ref_tabMarkdown.addEventListener('click', () => {
			_ref_inp_css.style.setProperty('display', 'none')
			_ref_inp_markdown.style.removeProperty('display')
			CButton.update(_ref_tabMarkdown, {Button: {variant: CButton.Variant.Filled}})
			CButton.update(_ref_tabCSS, {Button: {variant: CButton.Variant.Outlined}})
		})

		_ref_tabCSS.addEventListener('click', () => {
			_ref_inp_markdown.style.setProperty('display', 'none')
			_ref_inp_css.style.removeProperty('display')
			CButton.update(_ref_tabCSS, {Button: {variant: CButton.Variant.Filled}})
			CButton.update(_ref_tabMarkdown, {Button: {variant: CButton.Variant.Outlined}})
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