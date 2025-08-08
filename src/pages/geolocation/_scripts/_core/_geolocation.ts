import { ButtonVariant, updateButtonRef, type ButtonElement } from "@/components/Button"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { ObservableStore } from "@/utils/store"
import { AppCSSColors } from "@/enums/app-data"
import type { ToastElement } from "@/components/Toast"

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

const _startPauseBtnRef = $(ElementIds.bd_startPause) as ButtonElement
const _accuracyRef = $(ElementIds.bd_accuracy) as HTMLSpanElement
const _altitudeRef = $(ElementIds.bd_altitude) as HTMLSpanElement
const _altitudeAccuracyRef = $(ElementIds.bd_altitudeAccuracy) as HTMLSpanElement
const _headingRef = $(ElementIds.bd_heading) as HTMLSpanElement
const _latitudeRef = $(ElementIds.bd_latitude) as HTMLSpanElement
const _longitudeRef = $(ElementIds.bd_longitude) as HTMLSpanElement
const _speedRef = $(ElementIds.bd_speed) as HTMLSpanElement
const _toa_permissionRef = $(ElementIds.toa_permission) as ToastElement
const _toa_locationRef = $(ElementIds.toa_location) as ToastElement
let _geoWatchId: number | null = null

function _watchGeolocation(): void {
	navigator.permissions.query({name: 'geolocation'}).then((permission) => {
		if (permission.state !== 'granted') {
			// TODO: show permission denied
			return
		}

		if (typeof _geoWatchId === 'number'){
			navigator.geolocation.clearWatch(_geoWatchId)
		}
		_toa_permissionRef.showPopover()
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
			_toa_locationRef.showPopover()
			GeolocationStore.update(v => v.isWatching = false)
		}, {enableHighAccuracy: true,
			maximumAge: Infinity})
	}).catch(() => {
		_toa_permissionRef.showPopover()
		GeolocationStore.update(v => v.isWatching = false)
	})
}

function _initSubscriber(): void {
	GeolocationStore.subscribe((v, o) => {
		const isWatching = v.isWatching
		if (isWatching === o.isWatching) {return}

		if (isWatching) {
			updateButtonRef(_startPauseBtnRef, {
				ButtonVariant: ButtonVariant.tonal,
				ButtonChildren: ['Pause my location']
			})
			_startPauseBtnRef.style.setProperty('color', `rgb(${AppCSSColors.accent})`)
			_watchGeolocation()
		}
		else {
			updateButtonRef(_startPauseBtnRef, {
				ButtonVariant: ButtonVariant.filled,
				ButtonChildren: ['Show my location']
			})
			_startPauseBtnRef.style.removeProperty('color')
			if (typeof _geoWatchId === 'number'){
				navigator.geolocation.clearWatch(_geoWatchId)
				_geoWatchId = null
			}
		}
	})

	GeolocationStore.subscribe((v) => {
		_accuracyRef.textContent = v.accuracy.toString()
		_altitudeRef.textContent = v.altitude?.toString() ?? 'Unknown'
		_altitudeAccuracyRef.textContent = v.altitudeAccuracy?.toString() ?? 'Unknown'
		_latitudeRef.textContent = v.latitude.toString()
		_longitudeRef.textContent = v.longitude.toString()
		_speedRef.textContent = v.speed?.toString() ?? 'Unknown'
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

			_headingRef.textContent = text ?? 'Unknown'
		}
	})
}

function _initEvents(): void {
	_startPauseBtnRef.addEventListener('click', () => {
		GeolocationStore.update(v => v.isWatching = !v.isWatching)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}