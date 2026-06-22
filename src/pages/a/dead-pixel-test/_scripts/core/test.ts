import * as Ids from '../shared/ids.enum.js'
import * as KeyboardValues from '@/enums/keyboard-values.enum.js'
import type { HEXColor } from "@/types/color"
import { batch, signal } from "@/utils/signal"
import { $ } from './dom-utils.js'
import { delegateEvent } from '@/utils/event-registry'

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


export const sg_running = signal(false)
export const sg_color = signal(_palette[_paletteIdx])

const _ref_view = $(Ids.View) as HTMLDivElement
const _ref_startBtn = $(Ids.Start) as HTMLButtonElement

function _nextColor(): void {
	++_paletteIdx
	if (_paletteIdx >= _palette.length) {
		_paletteIdx = 0
	}

	sg_color.set(_palette[_paletteIdx])
}

function _initSubscriber(): void {
	sg_color.subscribe(v => {
		requestAnimationFrame(() => {
			_ref_view.style.setProperty('background-color', v)
		})
	})

	sg_running.subscribe(v => {
		if (v) {
			_ref_view.style.setProperty('display', 'block')
			_ref_view.requestFullscreen()
		}
		else {
			document.exitFullscreen()
			_ref_view.style.removeProperty('display')
		}
	})
}

function _initEvents(): void {
	delegateEvent(_ref_startBtn, 'click', () => {
		batch(() => {
			sg_color.set(_palette[0])
			sg_running.set(true)
		})
	})

	document.addEventListener('keydown', ev => {
		const key = ev.key
		if (key !== KeyboardValues.Space && key !== KeyboardValues.Enter) {
			return
		}

		ev.preventDefault()
		_nextColor()
	})

	delegateEvent(_ref_view, 'click', _nextColor)

	delegateEvent(_ref_view, 'fullscreenchange', () => {
		if (document.fullscreenElement) {
			return
		}

		sg_running.set(false)
	})

	delegateEvent(_ref_view, 'fullscreenerror', () => {
		sg_running.set(false)
		alert('Unable to enter fullscreen mode. Please ensure your browser allows fullscreen for this site.')
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}