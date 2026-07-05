import * as AnimationEasing from "@/enums/animation-easing.enum.js"
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as Ids from '../shared/ids.enum.js'
import * as TabValues from '../shared/tab-values.enum.js'
import * as Constant from '../shared/constant.enum.js'
import { signal } from '@/utils/signal'
import { $, $$, $$$ } from './dom-utils.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { saveStorageItem } from "./database.js"
import type { EnumOf } from "@/types/collections.js"

export const sg_inputTab  = signal(Constant.DEFAULT_TAB_INPUT_VALUE)

const _ref_theme      = $$(BrTheme.TAGNAME) as BrTheme.BiruThemeElement
const _refs_inputTabs = $$$<HTMLInputElement>(`#${CSS.escape(Ids.InputTabs)} input`)
const _ref_inputSASS  = $(Ids.InputSASS) as HTMLTextAreaElement
const _ref_inputSCSS  = $(Ids.InputSCSS) as HTMLTextAreaElement

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
		saveStorageItem('tab-input', v as EnumOf<typeof TabValues>)
		for (const ref of _refs_inputTabs) {
			ref.checked = ref.value === v
		}

		switch (v) {
		case TabValues.InputSASS:
			_ref_inputSASS.style.removeProperty('display')
			_ref_inputSCSS.style.setProperty('display', 'none')
			_animateTransition(_ref_inputSASS)
			break
		case TabValues.InputSCSS:
			_ref_inputSCSS.style.removeProperty('display')
			_ref_inputSASS.style.setProperty('display', 'none')
			_animateTransition(_ref_inputSCSS)
			break
		}
	})
}

function _initEvents(): void {
	for (const ref of _refs_inputTabs) {
		delegateEvent(ref, 'change', () => ref.checked && sg_inputTab.set(ref.value))
	}
}

export default () => {
	_initSubscriber()
	_initEvents()
}