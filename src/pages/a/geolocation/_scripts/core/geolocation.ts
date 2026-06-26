import * as BrIcon from '@/web-components/components/br-icon.js'
import * as Button from '@/web-components/components/button.js'
import * as Ids from '../shared/ids.enum.js'
import { batch, signal } from "@/utils/signal"
import { $, $$ } from './dom-utils.js'
import { delegateEvent } from '@/utils/event-registry'
import { adjustDecimalNumber } from '@/utils/number'

export const sg_isWatching = signal<boolean>(false)
export const sg_accuracy = signal<GeolocationCoordinates["accuracy"]>(0)
export const sg_altitude = signal<GeolocationCoordinates["altitude"]>(null)
export const sg_altitudeAccuracy = signal<GeolocationCoordinates["altitudeAccuracy"]>(null)
export const sg_heading = signal<GeolocationCoordinates['heading']>(null)
export const sg_latitude = signal<GeolocationCoordinates["latitude"]>(0)
export const sg_longitude = signal<GeolocationCoordinates['longitude']>(0)
export const sg_speed = signal<GeolocationCoordinates['speed']>(null)

const _ref_startPauseBtn = $(Ids.StartPauseButton) as HTMLButtonElement
const _ref_startPauseIcon = $$(BrIcon.TAGNAME, _ref_startPauseBtn) as BrIcon.BiruIconElement
const _ref_accuracy = $(Ids.Accuracy) as HTMLSpanElement
const _ref_altitude = $(Ids.Altitude) as HTMLSpanElement
const _ref_altitudeAccuracy = $(Ids.AltitudeAccuracy) as HTMLSpanElement
const _ref_heading = $(Ids.Heading) as HTMLSpanElement
const _ref_latitude = $(Ids.Latitude) as HTMLSpanElement
const _ref_longitude = $(Ids.Longitude) as HTMLSpanElement
const _ref_speed = $(Ids.Speed) as HTMLSpanElement

let _geoWatchId: ReturnType<Geolocation["watchPosition"]> | null = null

function _watchGeolocation(): void {
	navigator.permissions.query({name: 'geolocation'}).then((permission) => {
		if (permission.state === 'denied') {
			alert('Permission to use geolocation is denied. Please allow location permission to use this app.')
			sg_isWatching.set(false)
			return
		}

		if (_geoWatchId !== null){
			navigator.geolocation.clearWatch(_geoWatchId)
		}

		_geoWatchId = navigator.geolocation.watchPosition((v) => {
			const coords = v.coords
			batch(() => {
				sg_accuracy.set(coords.accuracy)
				sg_altitude.set(coords.altitude)
				sg_altitudeAccuracy.set(coords.altitudeAccuracy)
				sg_heading.set(coords.heading)
				sg_latitude.set(coords.latitude)
				sg_longitude.set(coords.longitude)
				sg_speed.set(coords.speed)
			})
		}, () => {
			sg_isWatching.set(false)
			alert([
				'Unable to retrive geolocation. Make sure to:',
				'',
				'1. Allow location permission.',
				'2. Connect to internet.',
				'3. Enable location mode on your device.'
			].join('\n'))
		}, {enableHighAccuracy: true,
			maximumAge: Infinity})
	}).catch(() => {})
}

function _initSubscriber(): void {
	sg_isWatching.subscribe(v => {
		if (v) {
			_watchGeolocation()
			_ref_startPauseBtn.setAttribute(Button.Attributes.Variant, Button.Variant.Tonal)
			_ref_startPauseBtn.replaceChildren(_ref_startPauseIcon, 'Pause my location')
		}
		else {
			if (_geoWatchId !== null){
				navigator.geolocation.clearWatch(_geoWatchId)
				_geoWatchId = null
			}

			_ref_startPauseBtn.setAttribute(Button.Attributes.Variant, Button.Variant.Filled)
			_ref_startPauseBtn.replaceChildren(_ref_startPauseIcon, 'Show my location')
		}
	})

	sg_accuracy.subscribe(v => {
		_ref_accuracy.textContent = [adjustDecimalNumber(v, 2), ' meter', v > 1? 's' : ''].join('')
	})

	sg_altitude.subscribe(v => {
		_ref_altitude.textContent = (typeof v === 'number'
			? [adjustDecimalNumber(v, 2), ' meter', v > 1? 's' : ''].join('')
			: 'N/A'
		)
	})

	sg_altitudeAccuracy.subscribe(v => {
		_ref_altitudeAccuracy.textContent = (typeof v === 'number'
			? [adjustDecimalNumber(v, 2), ' meter', v > 1? 's' : ''].join('')
			: 'N/A'
		)
	})

	sg_speed.subscribe(v => {
		_ref_speed.textContent = (typeof v === 'number'
			? [adjustDecimalNumber(v, 2), ' m/s'].join('')
			: 'N/A'
		)
	})

	sg_latitude.subscribe(v => {
		_ref_latitude.textContent = [v, '°'].join('')
	})

	sg_longitude.subscribe(v => {
		_ref_longitude.textContent = [v, '°'].join('')
	})

	sg_heading.subscribe(v => {
		let text: string | null = null
		if (typeof v === 'number') {
			v = Math.round(v)
			if (v >= 360) v -= 360

			if      (v ===   0) text = '0° (North)'
			else if (v ===  90) text = '90° (East)'
			else if (v === 180) text = '180° (South)'
			else if (v === 270) text = '270° (West)'
			else if (v >   0 && v <  90) text = v + '° (North East)'
			else if (v >  90 && v < 180) text = v + '° (South East)'
			else if (v > 180 && v < 270) text = v + '° (South West)'
			else if (v > 270 && v < 360) text = v + '° (North West)'
		}

		_ref_heading.textContent = text ?? 'N/A'
	})
}

function _initEvents(): void {
	delegateEvent(_ref_startPauseBtn, 'click', () => {
		sg_isWatching.set(v => !v)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}