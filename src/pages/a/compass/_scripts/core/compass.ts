import * as Ids from '../shared/ids.enum.js'
import { $ } from './dom-utils.js'

const _ref_text = $(Ids.CompassTextDegree) as HTMLHeadingElement
const _ref_compass = $(Ids.Compass) as unknown as SVGGElement
let _noAbsoluteAlpha = false
let _noWebkitCompassHeading = false
let _isWarningShown = false

function _showIncompatibleDeviceMessage(): void {
	if (!_noAbsoluteAlpha || !_noWebkitCompassHeading || _isWarningShown) {
		return
	}

	alert('This compass app requires a device with a built-in magnetometer (compass sensor) to function. It appears your device or browser, does not support this feature. Please try again on another device or browser.')
	_isWarningShown = true
}

function _initEvents(): void {
	if (!('ondeviceorientationabsolute' in window)) {
		_noAbsoluteAlpha = true
		_showIncompatibleDeviceMessage()
	}

	window.addEventListener('deviceorientationabsolute', (ev) => {
		let alpha = ev.alpha
		if (alpha === null) {
			_noAbsoluteAlpha = true
			_showIncompatibleDeviceMessage()
			return
		}

		alpha = Math.round(alpha!)
		while (alpha <= 0) {
			alpha += 360
		}

		requestAnimationFrame(() => {
			_ref_text.textContent = 360 - alpha + '°'
			_ref_compass.style.setProperty('rotate', alpha + 'deg')
		})
	})

	window.addEventListener('deviceorientation', ev => {
		const compass = (ev as any).webkitCompassAccuracy // for safari
		if (typeof compass !== 'number') {
			_noWebkitCompassHeading = true
			_showIncompatibleDeviceMessage()
			return
		}

		requestAnimationFrame(() => {
			_ref_text.textContent = compass + '°'
			_ref_compass.style.setProperty('rotate', compass + 'deg')
		})
	})
}

export default () => {
	_initEvents()
}