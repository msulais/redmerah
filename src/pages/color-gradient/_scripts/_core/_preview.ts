import { ObservableStore } from "@/utils/store"
import { DEFAULT_PREVIEW_BORDER_RADIUS, DEFAULT_PREVIEW_HEIGHT, DEFAULT_PREVIEW_WIDTH } from "../_shared/_constant"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { safeNumber } from "@/utils/number"
import { saveStorageItem } from "./_database"

export type PreviewStoreType = Readonly<{
	borderRadius: number
	width: number
	height: number
	clipPath: string
}>

export const PreviewStore = new ObservableStore<PreviewStoreType>({
	borderRadius: DEFAULT_PREVIEW_BORDER_RADIUS,
	clipPath: '',
	height: DEFAULT_PREVIEW_HEIGHT,
	width: DEFAULT_PREVIEW_WIDTH
})
const _previewBoxRef = $(ElementIds.bd_preview) as HTMLDivElement
const _propertyBorderRadiusRef = $(ElementIds.bdProp_borderRadius) as HTMLInputElement
const _propertyWidthRef = $(ElementIds.bdProp_width) as HTMLInputElement
const _propertyHeightRef = $(ElementIds.bdProp_height) as HTMLInputElement
const _propertyClipPathRef = $(ElementIds.bdProp_clipPath) as HTMLInputElement
let _timeBorderRadiusId: NodeJS.Timeout | number | null = null
let _timeClipPathId: NodeJS.Timeout | number | null = null
let _timeWidthId: NodeJS.Timeout | number | null = null
let _timeHeightId: NodeJS.Timeout | number | null = null

function _subscribeBorderRadiusChanges(v: PreviewStoreType, o: PreviewStoreType): void {
	const borderRadius = v.borderRadius
	if (borderRadius === o.borderRadius) {return}

	if (_timeBorderRadiusId !== null) {
		clearTimeout(_timeBorderRadiusId)
	}

	_timeBorderRadiusId = setTimeout(() => {
		_timeBorderRadiusId = null
		saveStorageItem('properties:border-radius', borderRadius)
	}, 500)
}

function _subscribeBorderRadiusRefView(v: PreviewStoreType, o: PreviewStoreType): void {
	const borderRadius = v.borderRadius
	if (borderRadius !== _propertyBorderRadiusRef.valueAsNumber) {
		_propertyBorderRadiusRef.value = borderRadius + ''
	}

	if (borderRadius === o.borderRadius) {return}

	requestAnimationFrame(() => {
		_previewBoxRef.style.setProperty('border-radius', borderRadius + 'px')
	})
}

function _subscribeWidthChanges(v: PreviewStoreType, o: PreviewStoreType): void {
	const width = v.width
	if (width === o.width) {return}

	if (_timeWidthId !== null) {
		clearTimeout(_timeWidthId)
	}

	_timeWidthId = setTimeout(() => {
		_timeWidthId = null
		saveStorageItem('properties:width', width)
	}, 500)
}

function _subscribeWidthRefView(v: PreviewStoreType, o: PreviewStoreType): void {
	const width = v.width
	if (width !== _propertyWidthRef.valueAsNumber) {
		_propertyWidthRef.value = width + ''
	}

	if (width === o.width) {return}

	requestAnimationFrame(() => {
		_previewBoxRef.style.setProperty('min-width', width + 'px')
	})
}

function _subscribeHeightChanges(v: PreviewStoreType, o: PreviewStoreType): void {
	const height = v.height
	if (height === o.height) {return}

	if (_timeHeightId !== null) {
		clearTimeout(_timeHeightId)
	}

	_timeHeightId = setTimeout(() => {
		_timeHeightId = null
		saveStorageItem('properties:height', height)
	}, 500)
}

function _subscribeHeightRefView(v: PreviewStoreType, o: PreviewStoreType): void {
	const height = v.height
	if (height !== _propertyHeightRef.valueAsNumber) {
		_propertyHeightRef.value = height + ''
	}

	if (height === o.height) {return}

	requestAnimationFrame(() => {
		_previewBoxRef.style.setProperty('min-height', height + 'px')
	})
}

function _subscribeClipPathChanges(v: PreviewStoreType, o: PreviewStoreType): void {
	const clipPath = v.clipPath
	if (clipPath === o.clipPath) {return}

	if (_timeClipPathId !== null) {
		clearTimeout(_timeClipPathId)
	}

	_timeClipPathId = setTimeout(() => {
		_timeClipPathId = null
		saveStorageItem('properties:clip-path', clipPath)
	}, 500)
}

function _subscribeClipPathRefView(v: PreviewStoreType, o: PreviewStoreType): void {
	const clipPath = v.clipPath
	if (clipPath !== _propertyClipPathRef.value) {
		_propertyClipPathRef.value = clipPath
	}

	if (clipPath === o.clipPath) {return}

	requestAnimationFrame(() => {
		_previewBoxRef.style.setProperty('clip-path', clipPath)
	})
}

function _initEvents(): void {
	_propertyBorderRadiusRef.addEventListener('input', () => {
		const value = safeNumber(_propertyBorderRadiusRef.valueAsNumber)
		PreviewStore.update(v => ({...v, borderRadius: value}))
	})

	_propertyWidthRef.addEventListener('input', () => {
		const value = safeNumber(_propertyWidthRef.valueAsNumber)
		PreviewStore.update(v => ({...v, width: value}))
	})

	_propertyHeightRef.addEventListener('input', () => {
		const value = safeNumber(_propertyHeightRef.valueAsNumber)
		PreviewStore.update(v => ({...v, height: value}))
	})

	_propertyClipPathRef.addEventListener('input', () => {
		PreviewStore.update(v => ({...v, clipPath: _propertyClipPathRef.value}))
	})
}

function _initSubscriber(): void {
	PreviewStore.subscribe(_subscribeBorderRadiusRefView)
	PreviewStore.subscribe(_subscribeWidthRefView)
	PreviewStore.subscribe(_subscribeHeightRefView)
	PreviewStore.subscribe(_subscribeClipPathRefView)
	PreviewStore.subscribe(_subscribeBorderRadiusChanges)
	PreviewStore.subscribe(_subscribeWidthChanges)
	PreviewStore.subscribe(_subscribeHeightChanges)
	PreviewStore.subscribe(_subscribeClipPathChanges)
}

export default () => {
	_initSubscriber()
	_initEvents()
}