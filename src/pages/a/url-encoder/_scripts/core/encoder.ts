import * as Ids from '../shared/ids.enum.js'
import * as Constant from '../shared/constant.enum.js'
import { signal } from '@/utils/signal'
import { $ } from './dom-utils.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { saveStorageItem } from './database.js'

export const sg_decode = signal(Constant.DEFAULT_DECODED_TEXT)

const _ref_decode = $(Ids.Decode) as HTMLTextAreaElement
const _ref_encode = $(Ids.Encode) as HTMLTextAreaElement

function _initSubscriber(): void {
	sg_decode.subscribe(v => {
		saveStorageItem('input-decode', v)
		if (!_ref_decode.matches(':focus')) {
			_ref_decode.value = v
		}

		if (!_ref_encode.matches(':focus')) {
			_ref_encode.value = encodeURIComponent(v)
		}
	})
}

function _initEvents(): void {
	delegateEvent(_ref_decode, 'input', () => {
		sg_decode.set(_ref_decode.value)
	})

	delegateEvent(_ref_encode, 'input', () => {
		sg_decode.set(decodeURIComponent(_ref_encode.value))
	})
}

export default () => {
	_initEvents()
	_initSubscriber()
	sg_decode.notify()
}