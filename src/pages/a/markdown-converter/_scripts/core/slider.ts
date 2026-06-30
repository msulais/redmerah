import { Math_clamp } from '@/utils/math'
import * as Ids from '../shared/ids.enum.js'
import { $ } from "./dom-utils.js"
import { delegateEvent } from '@/utils/event-registry.js'
import { signal } from '@/utils/signal'

const MIN_CONTAINER_WIDTH = 256

export const sg_width = signal<number | null>(null)

const _ref_slider = $(Ids.Slider) as HTMLDivElement
const _ref_inputContainer = $(Ids.InputContainer) as HTMLDivElement

let _screenWidth = document.body.clientWidth
let _isDragging = false
let _x: number | null = null
let _containerMarginLeft = 26

function _initSubscriber(): void {
	sg_width.subscribe(v => {
		if (v === null) {
			_ref_inputContainer.style.removeProperty('min-width')
			_ref_inputContainer.style.removeProperty('max-width')
		}
		else {
			requestAnimationFrame(() => {
				_ref_inputContainer.style.setProperty('min-width', v + 'px')
				_ref_inputContainer.style.setProperty('max-width', v + 'px')
			})
		}
	})
}

function _initEvents(): void {
	window.addEventListener('resize', () => {
		if (sg_width() === null) {
			return
		}

		_screenWidth = document.body.clientWidth
		sg_width.set(Math_clamp(_x!, MIN_CONTAINER_WIDTH, _screenWidth - MIN_CONTAINER_WIDTH))
	})

	delegateEvent<PointerEvent>(_ref_slider, 'pointerdown', ev => {
		_isDragging = true
		_screenWidth = document.body.clientWidth
		_ref_slider.setPointerCapture(ev.pointerId)
		_containerMarginLeft = _ref_inputContainer.getBoundingClientRect().left + 10
	})

	delegateEvent<PointerEvent>(_ref_slider, 'pointermove', ev => {
		if (!_isDragging) {
			return
		}

		sg_width.set(Math_clamp(ev.clientX - _containerMarginLeft, MIN_CONTAINER_WIDTH, _screenWidth - MIN_CONTAINER_WIDTH))
	})

	delegateEvent<PointerEvent>(_ref_slider, 'pointerup', ev => {
		_isDragging = false
		_ref_slider.releasePointerCapture(ev.pointerId)
	})

	delegateEvent<PointerEvent>(_ref_slider, 'pointercancel', ev => {
		_isDragging = false
		_ref_slider.releasePointerCapture(ev.pointerId)
	})

	delegateEvent(_ref_slider, 'dblclick', () => {
		sg_width.set(null)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}