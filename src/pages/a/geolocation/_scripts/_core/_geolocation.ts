import { CButton } from "@/components/Button"
import { ElementIds } from "../_shared/_ids"
import { $, $$ } from "./_dom-utils"
import { ObservableStore } from "@/utils/store"
import { CToast } from "@/components/Toast"
import { CIcon } from "@/components/Icon"

export type GeolocationStoreType = {
	isWatching: boolean
	accuracy: GeolocationCoordinates["accuracy"]
	altitude: GeolocationCoordinates["altitude"]
	altitudeAccuracy: GeolocationCoordinates["altitudeAccuracy"]
	heading: GeolocationCoordinates["heading"]
	latitude: GeolocationCoordinates["latitude"]
	longitude: GeolocationCoordinates["longitude"]
	speed: GeolocationCoordinates["speed"]
}

export const GeolocationStore = new ObservableStore<GeolocationStoreType>({
	accuracy: 0,
	altitude: null,
	altitudeAccuracy: null,
	heading: null,
	isWatching: false,
	latitude: 0,
	longitude: 0,
	speed: null
})

const _ref_startPauseBtn = $(ElementIds.bd_startPause) as CButton.CElement
const _ref_startPauseIcon = $$('.' + CIcon.Classes.Icon, _ref_startPauseBtn) as CIcon.CElement
const _ref_accuracy = $(ElementIds.bd_accuracy) as HTMLSpanElement
const _ref_altitude = $(ElementIds.bd_altitude) as HTMLSpanElement
const _ref_altitudeAccuracy = $(ElementIds.bd_altitudeAccuracy) as HTMLSpanElement
const _ref_heading = $(ElementIds.bd_heading) as HTMLSpanElement
const _ref_latitude = $(ElementIds.bd_latitude) as HTMLSpanElement
const _ref_longitude = $(ElementIds.bd_longitude) as HTMLSpanElement
const _ref_speed = $(ElementIds.bd_speed) as HTMLSpanElement

// toa = toast
const _ref_toa_permission = $(ElementIds.toa_permission) as CToast.CElement
const _ref_toa_location = $(ElementIds.toa_location) as CToast.CElement
let _geoWatchId: number | null = null

function _watchGeolocation(): void {
	navigator.permissions.query({name: 'geolocation'}).then((permission) => {
		if (permission.state === 'denied') {
			_ref_toa_permission.showPopover()
			GeolocationStore.update(v => v.isWatching = false)
			return
		}

		if (typeof _geoWatchId === 'number'){
			navigator.geolocation.clearWatch(_geoWatchId)
		}
		_geoWatchId = navigator.geolocation.watchPosition((v) => {
			const coords = v.coords
			GeolocationStore.update(v => {
				v.accuracy = coords.accuracy
				v.altitude = coords.altitude
				v.altitudeAccuracy = coords.altitudeAccuracy
				v.heading = coords.heading
				v.latitude = coords.latitude
				v.longitude = coords.longitude
				v.speed = coords.speed
			})
		}, () => {
			_ref_toa_location.showPopover()
			GeolocationStore.update(v => v.isWatching = false)
		}, {enableHighAccuracy: true,
			maximumAge: Infinity})
	}).catch(() => {})
}

function _initSubscriber(): void {
	GeolocationStore.subscribe((v, o) => {
		const isWatching = v.isWatching
		if (isWatching === o.isWatching) {return}

		if (isWatching) {
			CButton.update(_ref_startPauseBtn, {Button: {
				variant: CButton.Variant.Tonal,
				children: [_ref_startPauseIcon, 'Pause my location']
			}})
			_watchGeolocation()
		}
		else {
			CButton.update(_ref_startPauseBtn, {Button: {
				variant: CButton.Variant.Filled,
				children: [_ref_startPauseIcon, 'Show my location']
			}})
			if (typeof _geoWatchId === 'number'){
				navigator.geolocation.clearWatch(_geoWatchId)
				_geoWatchId = null
			}
		}
	})

	GeolocationStore.subscribe((v) => {
		const accuracy = v.accuracy
		_ref_accuracy.textContent = (typeof accuracy === 'number'
			? [Number.parseFloat(accuracy.toFixed(2)), ' meter', accuracy > 1? 's' : ''].join('')
			: 'N/A'
		)

		const altitude = v.altitude
		_ref_altitude.textContent = (typeof altitude === 'number'
			? [Number.parseFloat(altitude.toFixed(2)), ' meter', altitude > 1? 's' : ''].join('')
			: 'N/A'
		)

		const altitudeAccuracy = v.altitudeAccuracy
		_ref_altitudeAccuracy.textContent = (typeof altitudeAccuracy === 'number'
			? [Number.parseFloat(altitudeAccuracy.toFixed(2)), ' meter', altitudeAccuracy > 1? 's' : ''].join('')
			: 'N/A'
		)

		const speed = v.speed
		_ref_speed.textContent = (typeof speed === 'number'
			? [Number.parseFloat(speed.toFixed(2)), ' m/s'].join('')
			: 'N/A'
		)

		_ref_latitude.textContent = [v.latitude, '°'].join('')
		_ref_longitude.textContent = [v.longitude, '°'].join('')

		// heading
		{
			let text: string | null = null
			let heading = v.heading
			if (typeof heading === 'number') {
				heading = Math.round(heading)
				if (heading >= 360) heading -= 360

				if      (heading ===   0) text = '0° (North)'
				else if (heading ===  90) text = '90° (East)'
				else if (heading === 180) text = '180° (South)'
				else if (heading === 270) text = '270° (West)'
				else if (heading >   0 && heading <  90) text = heading + '° (North East)'
				else if (heading >  90 && heading < 180) text = heading + '° (South East)'
				else if (heading > 180 && heading < 270) text = heading + '° (South West)'
				else if (heading > 270 && heading < 360) text = heading + '° (North West)'
			}

			_ref_heading.textContent = text ?? 'N/A'
		}
	})
}

function _initEvents(): void {
	_ref_startPauseBtn.addEventListener('click', () => {
		GeolocationStore.update(v => v.isWatching = !v.isWatching)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}