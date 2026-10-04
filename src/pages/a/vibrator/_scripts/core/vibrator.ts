import * as BrDialog from '@/components/web-components/components/br-dialog.js'
import * as Ids from '../shared/ids.enum.js'
import * as Constant from '../shared/constant.enum.js'
import { signal } from '@/utils/signal'
import { $ } from './dom-utils.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { isNumberDefined } from '@/utils/number.js'
import { showInputMessage, updateElementList } from '@/utils/element.js'
import { saveStorageItem } from './database.js'

export const sg_pattern = signal(Constant.DEFAULT_VIBRATION_PATTERN)

const _ref_list       = $(Ids.List) as HTMLOListElement
const _ref_vibrate    = $(Ids.Vibrate) as HTMLButtonElement
const _ref_stop       = $(Ids.Stop) as HTMLButtonElement
const _ref_editDialog = $(Ids.EditDialog) as BrDialog.BiruDialogElement
const _ref_save       = $(Ids.Save) as HTMLButtonElement
const _ref_input      = $(Ids.Input) as HTMLTextAreaElement

function _initSubscriber(): void {
	sg_pattern.subscribe(v => {
		saveStorageItem('vibration-pattern', v)
		updateElementList(_ref_list, v,
			() => document.createElement('li'),
			(ref, data) => ref.textContent = data.toString()
		)
	})
}

function _initEvents(): void {
	delegateEvent(_ref_vibrate, 'click', () => {
		navigator.vibrate(sg_pattern())
	})

	delegateEvent(_ref_stop, 'click', () => {
		navigator.vibrate([])
	})

	delegateEvent(_ref_editDialog, BrDialog.EventTypes.Toggle, () => {
		if (!_ref_editDialog.biru.isOpen) {
			return
		}

		_ref_input.value = sg_pattern().join(', ')
	})

	delegateEvent(_ref_save, 'click', ev => {
		const pattern = _ref_input
			.value
			.replace(/[^\d,]/g, '')
			.split(',')
			.map(v => Number.parseInt(v))
			.filter(v => isNumberDefined(v))

		if (pattern.length <= 0) {
			showInputMessage(_ref_input, 'Vibration pattern invalid or empty')
			ev.preventDefault()
			return
		}

		sg_pattern.set(pattern)
	})

	delegateEvent(_ref_input, 'input', () => {
		showInputMessage(_ref_input, '')
	})

}

export default () => {
	_initSubscriber()
	_initEvents()
}