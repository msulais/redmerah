import { CButton } from "@/components/Button"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { ObservableStore } from "@/utils/signal"
import { DEFAULT_VIBRATION_PATTERN } from "../_shared/_constant"
import { showInputMessage, updateElementList } from "@/utils/element"
import { CDialog } from "@/components/Dialog"
import { isNumberDefined } from "@/utils/number"
import { saveStorageItem } from "./_database"

export type VibratorStoreType = {
	pattern: number[]
}

export const VibratorStore = new ObservableStore<VibratorStoreType>({
	pattern: DEFAULT_VIBRATION_PATTERN
})

const _ref_list = $(ElementIds.bd_list) as HTMLUListElement
const _ref_vibrate = $(ElementIds.bd_vibrate) as CButton.CElement
const _ref_stop = $(ElementIds.bd_stop) as CButton.CElement
const _ref_edit = $(ElementIds.bd_edit) as CButton.CIcon.CElement
const _ref_editDialog = $(ElementIds.bd_editDialog) as CDialog.CElement
const _ref_save = $(ElementIds.bd_save) as CButton.CElement
const _ref_input = $(ElementIds.bd_input) as HTMLInputElement

function _subsPatternChanges(v: VibratorStoreType, o: VibratorStoreType): void {
	const pattern = v.pattern
	if (pattern === o.pattern) {return}

	saveStorageItem('pattern', pattern)
}

function _subsPatternView(v: VibratorStoreType, o: VibratorStoreType): void {
	const pattern = v.pattern
	if (pattern === o.pattern) {return}

	updateElementList<HTMLLIElement, number>(
		_ref_list, pattern,
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
	_ref_vibrate.addEventListener('click', () => {
		navigator.vibrate(VibratorStore.value.pattern)
	})

	_ref_stop.addEventListener('click', () => {
		navigator.vibrate([])
	})

	_ref_edit.addEventListener('click', () => {
		_ref_input.value = VibratorStore.value.pattern.join(', ')
		_ref_editDialog.showModal()
	})

	_ref_save.addEventListener('click', ev => {
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

		VibratorStore.update(v => v.pattern = pattern)
	})

	_ref_input.addEventListener('input', () => {
		showInputMessage(_ref_input, '')
	})

}

export default () => {
	_initSubscriber()
	_initEvents()
}