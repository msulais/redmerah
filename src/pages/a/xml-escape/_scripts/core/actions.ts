import * as Ids from '../shared/ids.enum.js'
import * as Constant from '../shared/constant.enum.js'
import * as Encoder from './escaper.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { $ } from './dom-utils.js'
import { sanitizeXML } from './utils.js'

const _ref_resetInput    = $(Ids.PopoverAppBarMoreReset) as HTMLButtonElement
const _ref_copyUnescaped = $(Ids.PopoverAppBarMoreCopyUnescaped) as HTMLButtonElement
const _ref_copyEscaped   = $(Ids.PopoverAppBarMoreCopyEscaped) as HTMLButtonElement

function _initEvents(): void {
	delegateEvent(_ref_resetInput, 'click', () => {
		Encoder.sg_unescape.set(Constant.DEFAULT_UNESCAPE_XML_TEXT)
	})

	delegateEvent(_ref_copyUnescaped, 'click', () => {
		navigator.clipboard.writeText(Encoder.sg_unescape())
	})

	delegateEvent(_ref_copyEscaped, 'click', () => {
		navigator.clipboard.writeText(sanitizeXML(Encoder.sg_unescape()))
	})
}

export default () => {
	_initEvents()
}