import type { HEXColor } from "@/types/color"
import { ObservableStore } from "@/utils/store"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { CButton } from "@/components/Button"
import { KeyboardValue } from "@/enums/keyboard"

export type TestStoreType = {
	running: boolean
	color: HEXColor
}

const _palette: HEXColor[] = [
	'#000000',
	'#FFFFFF',
	'#FF0000',
	'#FFFF00',
	'#00FF00',
	'#00FFFF',
	'#0000FF',
	'#FF00FF'
]
let _paletteIdx = 0

export const TestStore = new ObservableStore<TestStoreType>({
	running: false,
	color: _palette[_paletteIdx]
})

const _ref_view = $(ElementIds.bd_view) as HTMLDivElement
const _ref_startBtn = $(ElementIds.bd_start) as CButton.CElement

function _nextColor(): void {
	++_paletteIdx
	if (_paletteIdx >= _palette.length) {
		_paletteIdx = 0
	}

	TestStore.update(v => v.color = _palette[_paletteIdx])
}

function _subsColorView(v: TestStoreType, o: TestStoreType): void {
	const color = v.color
	if (color === o.color) {return}

	requestAnimationFrame(() => {
		_ref_view.style.setProperty('background-color', color)
	})
}

function _subsRunningView(v: TestStoreType, o: TestStoreType): void {
	const running = v.running
	if (running === o.running) {return}

	if (running) {
		_ref_view.style.setProperty('display', 'block')
		_ref_view.requestFullscreen()
	} else {
		document.exitFullscreen()
		_ref_view.style.removeProperty('display')
	}
}

function _initSubscriber(): void {
	TestStore.subscribe(_subsColorView)
	TestStore.subscribe(_subsRunningView)
}

function _initEvents(): void {
	_ref_startBtn.addEventListener('click', () => {
		TestStore.update(v => {
			v.color = _palette[0]
			v.running = true
		})
	})

	document.addEventListener('keydown', ev => {
		const key = ev.key
		if (key !== KeyboardValue.space && key !== KeyboardValue.enter) {return}

		ev.preventDefault()
		_nextColor()
	})

	_ref_view.addEventListener('click', _nextColor)

	_ref_view.addEventListener('fullscreenchange', () => {
		if (document.fullscreenElement) {return}

		TestStore.update(v => v.running = false)
	})

	_ref_view.addEventListener('fullscreenerror', () => {
		TestStore.update(v => v.running = false)
		// TODO: show error message
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}