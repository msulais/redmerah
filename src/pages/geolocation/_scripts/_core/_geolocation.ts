import type { ButtonElement } from "@/components/Button"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { ObservableStore } from "@/utils/store"

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
let _geoWatchId: number | null = null

function _initSubscriber(): void {
	GeolocationStore.subscribe((v, o) => {
		const isWatching = v.isWatching
		if (isWatching === o.isWatching) {return}

		if (isWatching && _geoWatchId === null) {
			_startPauseBtnRef.textContent = 'Pause my location'
			_geoWatchId = navigator.geolocation.watchPosition((v) => {
				const coords = v.coords
				console.log(coords)
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
				// TODO: show error
			})
		}
		else if (!isWatching && typeof _geoWatchId === 'number') {
			_startPauseBtnRef.textContent = 'Show my location'
			navigator.geolocation.clearWatch(_geoWatchId)
		}
	})

	GeolocationStore.subscribe((v) => {
		_accuracyRef.textContent = v.accuracy.toString()
		_altitudeRef.textContent = v.altitude?.toString() ?? 'Unknown'
		_altitudeAccuracyRef.textContent = v.altitudeAccuracy?.toString() ?? 'Unknown'
		_headingRef.textContent = v.heading?.toString() ?? 'Unknown'
		_latitudeRef.textContent = v.latitude.toString()
		_longitudeRef.textContent = v.longitude.toString()
		_speedRef.textContent = v.speed?.toString() ?? 'Unknown'
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