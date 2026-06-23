import * as Ids from '../shared/ids.enum.js'
import { signal } from "@/utils/signal"
import { $ } from './dom-utils.js'
import { delegateEvent } from '@/utils/event-registry'
import { saveStorageItem } from './database.js'

export const sg_text = signal('')

const _ref_copyInput = $(Ids.CopyInput) as HTMLInputElement
const _ref_copyButton = $(Ids.CopyButton) as HTMLButtonElement
const _ref_clearCopyInput = $(Ids.ClearCopyInput) as HTMLButtonElement

function _initSubscriber(): void {
	sg_text.subscribe(v => {
		if (!_ref_copyInput.matches(":focus")) {
			_ref_copyInput.value = v
		}

		saveStorageItem('selected-emoji', v, 250)
	})
}

function _initEvents(): void {
	document.addEventListener('click', ev => {
		const target = ev.target as HTMLElement
		if (!target) {
			return
		}

		const emojibutton = target.closest('[data-emoji]') as HTMLButtonElement
		if (!emojibutton) {
			return
		}

		const emoji = emojibutton.dataset.emoji ?? ''
		navigator.clipboard.writeText(emoji)
		sg_text.set(v => v + emoji)
	})

	delegateEvent(_ref_clearCopyInput, 'click', () => {
		sg_text.set('')
	})

	delegateEvent(_ref_copyInput, 'input', () => {
		sg_text.set(_ref_copyInput.value)
	})

	delegateEvent(_ref_copyButton, 'click', () => {
		navigator.clipboard.writeText(sg_text())
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}