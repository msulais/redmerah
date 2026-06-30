import * as AnimationEasing from "@/enums/animation-easing.enum.js"
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as Ids from '../shared/ids.enum.js'
import * as TabValues from '../shared/tab-values.enum.js'
import * as Constant from '../shared/constant.enum.js'
import { signal } from '@/utils/signal'
import { $, $$, $$$ } from './dom-utils.js'
import { delegateEvent } from '@/utils/event-registry.js'

export const sg_inputTab  = signal(Constant.DEFAULT_TAB_INPUT_VALUE)
export const sg_outputTab = signal(Constant.DEFAULT_TAB_OUTPUT_VALUE)

const _ref_theme         = $$(BrTheme.TAGNAME) as BrTheme.BiruThemeElement
const _refs_inputTabs    = $$$<HTMLInputElement>(`#${CSS.escape(Ids.InputTabs)} input`)
const _refs_outputTabs   = $$$<HTMLInputElement>(`#${CSS.escape(Ids.OutputTabs)} input`)
const _ref_inputMarkdown = $(Ids.InputMarkdown) as HTMLTextAreaElement
const _ref_inputCSS      = $(Ids.InputCSS) as HTMLTextAreaElement
const _ref_outputHTML    = $(Ids.OutputHTML) as HTMLTextAreaElement
const _ref_outputPreview = $(Ids.OutputPreview) as HTMLIFrameElement

function _animateTransition(ref: HTMLElement): void {
	if (_ref_theme.biru.transitionDuration <= 0) {
		return
	}

	ref.animate({
		opacity: [0, 1],
		scale: [0.9, 1]
	}, {duration: 500, easing: AnimationEasing.Spring})
}

function _initSubscriber(): void {
	sg_inputTab.subscribe(v => {
		for (const ref of _refs_inputTabs) {
			ref.checked = ref.value === v
		}

		switch (v) {
		case TabValues.InputMarkdown:
			_ref_inputMarkdown.style.removeProperty('display')
			_ref_inputCSS.style.setProperty('display', 'none')
			_animateTransition(_ref_inputMarkdown)
			break
		case TabValues.InputCSS:
			_ref_inputCSS.style.removeProperty('display')
			_ref_inputMarkdown.style.setProperty('display', 'none')
			_animateTransition(_ref_inputCSS)
			break
		}
	})

	sg_outputTab.subscribe(v => {
		for (const ref of _refs_outputTabs) {
			ref.checked = ref.value === v
		}

		switch (v) {
		case TabValues.OutputHTML:
			_ref_outputHTML.style.removeProperty('display')
			_ref_outputPreview.style.setProperty('display', 'none')
			_animateTransition(_ref_outputHTML)
			break
		case TabValues.OutputPreview:
			_ref_outputPreview.style.removeProperty('display')
			_ref_outputHTML.style.setProperty('display', 'none')
			_animateTransition(_ref_outputPreview)
			break
		}
	})
}

function _initEvents(): void {
	for (const ref of _refs_inputTabs) {
		delegateEvent(ref, 'change', () => ref.checked && sg_inputTab.set(ref.value))
	}

	for (const ref of _refs_outputTabs) {
		delegateEvent(ref, 'change', () => ref.checked && sg_outputTab.set(ref.value))
	}
}

export default () => {
	_initSubscriber()
	_initEvents()
}