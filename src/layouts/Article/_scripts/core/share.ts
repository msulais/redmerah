import * as Ids from '../shared/ids.enum.js'
import { delegateEvent } from '@/utils/event-registry'
import { $ } from './dom-utils.js'

const _ref_shareBtn = $(Ids.ShareButton) as HTMLButtonElement

function _initEvents(): void {
	delegateEvent(_ref_shareBtn, 'click', () => {
		navigator.share({url: document.URL})
	})
}

export default () => {
	_initEvents()
}