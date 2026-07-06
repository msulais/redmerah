import * as Ids from '../shared/ids.enum.js'
import * as Constant from '../shared/constant.enum.js'
import { signal } from '@/utils/signal'
import { $ } from './dom-utils.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { saveStorageItem } from './database.js'
import { sanitizeXML, unsanitizeXML } from './utils.js'

export const sg_unescape = signal(Constant.DEFAULT_UNESCAPE_XML_TEXT)

const _ref_unescape = $(Ids.Unescape) as HTMLTextAreaElement
const _ref_escape   = $(Ids.Escape) as HTMLTextAreaElement

function _initSubscriber(): void {
	sg_unescape.subscribe(v => {
		saveStorageItem('input-unescape', v)
		if (!_ref_unescape.matches(':focus')) {
			_ref_unescape.value = v
		}

		if (!_ref_escape.matches(':focus')) {
			_ref_escape.value = sanitizeXML(v)
		}
	})
}

function _initEvents(): void {
	delegateEvent(_ref_unescape, 'input', () => {
		sg_unescape.set(_ref_unescape.value)
	})

	delegateEvent(_ref_escape, 'input', () => {
		sg_unescape.set(unsanitizeXML(_ref_escape.value))
	})
}

export default () => {
	_initEvents()
	_initSubscriber()
	sg_unescape.notify()
}