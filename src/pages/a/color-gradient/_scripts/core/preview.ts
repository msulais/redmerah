import { ObservableStore } from "@/utils/signal"
import { DEFAULT_PREVIEW_BORDER_RADIUS, DEFAULT_PREVIEW_HEIGHT, DEFAULT_PREVIEW_WIDTH } from "../shared/constant"
import { $ } from "./dom-utils"
import { ElementIds } from "../shared/ids"
import { safeNumber } from "@/utils/number"
import { saveStorageItem } from "./database"
import { pxToRem } from "@/utils/css"

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
const _ref_previewBox = $(ElementIds.bd_preview) as HTMLDivElement
const _ref_propertyBorderRadius = $(ElementIds.bdProp_borderRadius) as HTMLInputElement
const _ref_propertyWidth = $(ElementIds.bdProp_width) as HTMLInputElement
const _ref_propertyHeight = $(ElementIds.bdProp_height) as HTMLInputElement
const _ref_propertyClipPath = $(ElementIds.bdProp_clipPath) as HTMLInputElement
let _time_borderRadius: NodeJS.Timeout | number | null = null
let _time_clipPath: NodeJS.Timeout | number | null = null
let _time_widthId: NodeJS.Timeout | number | null = null
let _time_heightId: NodeJS.Timeout | number | null = null

function _subscribeBorderRadiusChanges(v: PreviewStoreType, o: PreviewStoreType): void {
	const borderRadius = v.borderRadius
	if (borderRadius === o.borderRadius) {return}

	if (_time_borderRadius !== null) {
		clearTimeout(_time_borderRadius)
	}

	_time_borderRadius = setTimeout(() => {
		_time_borderRadius = null
		saveStorageItem('properties:border-radius', borderRadius)
	}, 500)
}

function _subscribeBorderRadiusRefView(v: PreviewStoreType, o: PreviewStoreType): void {
	const borderRadius = v.borderRadius
	if (borderRadius !== _ref_propertyBorderRadius.valueAsNumber) {
		_ref_propertyBorderRadius.value = borderRadius + ''
	}

	if (borderRadius === o.borderRadius) {return}

	requestAnimationFrame(() => {
		_ref_previewBox.style.setProperty('border-radius', pxToRem(borderRadius) + 'rem')
	})
}

function _subscribeWidthChanges(v: PreviewStoreType, o: PreviewStoreType): void {
	const width = v.width
	if (width === o.width) {return}

	if (_time_widthId !== null) {
		clearTimeout(_time_widthId)
	}

	_time_widthId = setTimeout(() => {
		_time_widthId = null
		saveStorageItem('properties:width', width)
	}, 500)
}

function _subscribeWidthRefView(v: PreviewStoreType, o: PreviewStoreType): void {
	const width = v.width
	if (width !== _ref_propertyWidth.valueAsNumber) {
		_ref_propertyWidth.value = width + ''
	}

	if (width === o.width) {return}

	requestAnimationFrame(() => {
		_ref_previewBox.style.setProperty('min-width', pxToRem(width) + 'rem')
	})
}

function _subscribeHeightChanges(v: PreviewStoreType, o: PreviewStoreType): void {
	const height = v.height
	if (height === o.height) {return}

	if (_time_heightId !== null) {
		clearTimeout(_time_heightId)
	}

	_time_heightId = setTimeout(() => {
		_time_heightId = null
		saveStorageItem('properties:height', height)
	}, 500)
}

function _subscribeHeightRefView(v: PreviewStoreType, o: PreviewStoreType): void {
	const height = v.height
	if (height !== _ref_propertyHeight.valueAsNumber) {
		_ref_propertyHeight.value = height + ''
	}

	if (height === o.height) {return}

	requestAnimationFrame(() => {
		_ref_previewBox.style.setProperty('min-height', pxToRem(height) + 'rem')
	})
}

function _subscribeClipPathChanges(v: PreviewStoreType, o: PreviewStoreType): void {
	const clipPath = v.clipPath
	if (clipPath === o.clipPath) {return}

	if (_time_clipPath !== null) {
		clearTimeout(_time_clipPath)
	}

	_time_clipPath = setTimeout(() => {
		_time_clipPath = null
		saveStorageItem('properties:clip-path', clipPath)
	}, 500)
}

function _subscribeClipPathRefView(v: PreviewStoreType, o: PreviewStoreType): void {
	const clipPath = v.clipPath
	if (clipPath !== _ref_propertyClipPath.value) {
		_ref_propertyClipPath.value = clipPath
	}

	if (clipPath === o.clipPath) {return}

	requestAnimationFrame(() => {
		_ref_previewBox.style.setProperty('clip-path', clipPath)
	})
}

function _initEvents(): void {
	_ref_propertyBorderRadius.addEventListener('input', () => {
		const value = safeNumber(_ref_propertyBorderRadius.valueAsNumber)
		PreviewStore.update(v => v.borderRadius = value)
	})

	_ref_propertyWidth.addEventListener('input', () => {
		const value = safeNumber(_ref_propertyWidth.valueAsNumber)
		PreviewStore.update(v => v.width = value)
	})

	_ref_propertyHeight.addEventListener('input', () => {
		const value = safeNumber(_ref_propertyHeight.valueAsNumber)
		PreviewStore.update(v => v.height = value)
	})

	_ref_propertyClipPath.addEventListener('input', () => {
		PreviewStore.update(v => v.clipPath = _ref_propertyClipPath.value)
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