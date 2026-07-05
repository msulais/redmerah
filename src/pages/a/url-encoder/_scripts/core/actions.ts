import * as Ids from '../shared/ids.enum.js'
import * as Constant from '../shared/constant.enum.js'
import * as Encoder from './encoder.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { $ } from './dom-utils.js'

const _ref_resetInput  = $(Ids.PopoverAppBarMoreReset) as HTMLButtonElement
const _ref_copyDecoded = $(Ids.PopoverAppBarMoreCopyDecoded) as HTMLButtonElement
const _ref_copyEncoded = $(Ids.PopoverAppBarMoreCopyEncoded) as HTMLButtonElement

function _initEvents(): void {
	delegateEvent(_ref_resetInput, 'click', () => {
		Encoder.sg_decode.set(Constant.DEFAULT_DECODED_TEXT)
	})

	delegateEvent(_ref_copyDecoded, 'click', () => {
		navigator.clipboard.writeText(Encoder.sg_decode())
	})

	delegateEvent(_ref_copyEncoded, 'click', () => {
		navigator.clipboard.writeText(encodeURIComponent(Encoder.sg_decode()))
	})
}

export default () => {
	_initEvents()
}