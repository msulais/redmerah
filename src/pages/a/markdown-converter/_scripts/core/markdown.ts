import * as Ids from '../shared/ids.enum.js'
import * as Constant from '../shared/constant.enum.js'
import { signal } from '@/utils/signal'
import { $ } from './dom-utils.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { marked } from 'marked'
import { html_beautify } from 'js-beautify'
import { saveStorageItem } from './database.js'

export const sg_markdown = signal(Constant.DEFAULT_MARKDOWN_TEXT)
export const sg_css      = signal(Constant.DEFAULT_CSS_TEXT)
export const sg_html     = signal(Constant.DEFAULT_HTML_TEXT)

const _ref_inputMarkdown = $(Ids.InputMarkdown) as HTMLTextAreaElement
const _ref_inputCSS      = $(Ids.InputCSS) as HTMLTextAreaElement
const _ref_outputHTML    = $(Ids.OutputHTML) as HTMLTextAreaElement
const _ref_outputPreview = $(Ids.OutputPreview) as HTMLIFrameElement

let _time_output: ReturnType<typeof setTimeout> | undefined

function _updateOutput(): void {
	clearTimeout(_time_output)
	_time_output = setTimeout(() => {
		const html = marked(sg_markdown(), {async: false}) as string
		sg_html.set(html_beautify(html))
	}, 100)
}

function _initSubscriber(): void {
	sg_markdown.subscribe(v => {
		if (!_ref_inputMarkdown.matches(":focus")) {
			_ref_inputMarkdown.value = v
		}

		saveStorageItem('input-markdown', v)
		_updateOutput()
	})

	sg_css.subscribe(v => {
		if (!_ref_inputCSS.matches(":focus")) {
			_ref_inputCSS.value = v
		}

		saveStorageItem('input-css', v)
		_updateOutput()
	})

	sg_html.subscribe(v => {
		if (!_ref_outputHTML.matches(':focus')) {
			_ref_outputHTML.value = v
		}

		_ref_outputPreview.srcdoc =  ['<style>', sg_css(),'</style>', v].join('')
	})
}

function _initEvents(): void {
	delegateEvent(_ref_inputMarkdown, 'input', () => {
		sg_markdown.set(_ref_inputMarkdown.value)
	})

	delegateEvent(_ref_inputCSS, 'input', () => {
		sg_css.set(_ref_inputCSS.value)
	})

	delegateEvent(_ref_outputHTML, 'input', () => {
		sg_html.set(_ref_outputHTML.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}