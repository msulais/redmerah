import * as Ids from '../shared/ids.enum.js'
import * as Constant from '../shared/constant.enum.js'
import { $ } from "./dom-utils.js"
import { delegateEvent } from '@/utils/event-registry.js'

const _ref_shareButton = $(Ids.PopoverAppBarInfoShare) as HTMLButtonElement

function _initEvents(): void {
	delegateEvent(_ref_shareButton, 'click', () => {
		navigator.share({
			text: Constant.APP.name,
			url: document.URL
		})
	})
}

export default () => {
	_initEvents()
}