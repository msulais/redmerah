import type { HEXColor } from "@/types/color"
import { ObservableStore } from "@/utils/store"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import type { ButtonElement } from "@/components/Button"
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

const _viewRef = $(ElementIds.bd_view) as HTMLDivElement
const _startBtnRef = $(ElementIds.bd_start) as ButtonElement

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
		_viewRef.style.setProperty('background-color', color)
	})
}

function _subsRunningView(v: TestStoreType, o: TestStoreType): void {
	const running = v.running
	if (running === o.running) {return}

	if (running) {
		_viewRef.style.setProperty('display', 'block')
		_viewRef.requestFullscreen()
	} else {
		document.exitFullscreen()
		_viewRef.style.removeProperty('display')
	}
}

function _initSubscriber(): void {
	TestStore.subscribe(_subsColorView)
	TestStore.subscribe(_subsRunningView)
}

function _initEvents(): void {
	_startBtnRef.addEventListener('click', () => {
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

	_viewRef.addEventListener('click', _nextColor)

	_viewRef.addEventListener('fullscreenchange', () => {
		if (document.fullscreenElement) {return}

		TestStore.update(v => v.running = false)
	})

	_viewRef.addEventListener('fullscreenerror', () => {
		TestStore.update(v => v.running = false)
		// TODO: show error message
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}