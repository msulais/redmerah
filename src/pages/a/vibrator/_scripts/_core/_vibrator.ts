import type { ButtonElement, IconButtonElement } from "@/components/Button"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { ObservableStore } from "@/utils/store"
import { DEFAULT_VIBRATION_PATTERN } from "../_shared/_constant"
import { showInputMessage, updateListElement } from "@/utils/element"
import type { DialogElement } from "@/components/Dialog"
import { isNumberDefined } from "@/utils/number"
import { saveStorageItem } from "./_database"

export type VibratorStoreType = {
	pattern: number[]
}

export const VibratorStore = new ObservableStore<VibratorStoreType>({
	pattern: DEFAULT_VIBRATION_PATTERN
})

const _listRef = $(ElementIds.bd_list) as HTMLUListElement
const _vibrateRef = $(ElementIds.bd_vibrate) as ButtonElement
const _stopRef = $(ElementIds.bd_stop) as ButtonElement
const _editRef = $(ElementIds.bd_edit) as IconButtonElement
const _editDialogRef = $(ElementIds.bd_editDialog) as DialogElement
const _saveRef = $(ElementIds.bd_save) as ButtonElement
const _inputRef = $(ElementIds.bd_input) as HTMLInputElement

function _subsPatternChanges(v: VibratorStoreType, o: VibratorStoreType): void {
	const pattern = v.pattern
	if (pattern === o.pattern) {return}

	saveStorageItem('pattern', pattern)
}

function _subsPatternView(v: VibratorStoreType, o: VibratorStoreType): void {
	const pattern = v.pattern
	if (pattern === o.pattern) {return}

	updateListElement<HTMLLIElement, number>(
		_listRef, pattern,
		() => document.createElement('li'),
		(el, data) => el.textContent = data.toString()
	)
}

function _initSubscriber(): void {
	VibratorStore.subscribeAll([
		_subsPatternChanges,
		_subsPatternView
	])
}

function _initEvents(): void {
	_vibrateRef.addEventListener('click', () => {
		navigator.vibrate(VibratorStore.value.pattern)
	})

	_stopRef.addEventListener('click', () => {
		navigator.vibrate([])
	})

	_editRef.addEventListener('click', () => {
		_inputRef.value = VibratorStore.value.pattern.join(', ')
		_editDialogRef.showModal()
	})

	_saveRef.addEventListener('click', ev => {
		const pattern = _inputRef
			.value
			.replace(/[^\d,]/g, '')
			.split(',')
			.map(v => Number.parseInt(v))
			.filter(v => isNumberDefined(v))

		if (pattern.length <= 0) {
			showInputMessage(_inputRef, 'Vibration pattern invalid or empty')
			ev.preventDefault()
			return
		}

		VibratorStore.update(v => v.pattern = pattern)
	})

	_inputRef.addEventListener('input', () => {
		showInputMessage(_inputRef, '')
	})

}

export default () => {
	_initSubscriber()
	_initEvents()
}