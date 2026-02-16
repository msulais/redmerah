import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { CButton } from "@/components/Button"
import { $ } from "./_dom-utils"
import { pickFile } from "@/utils/file"
import { CMenu } from "@/components/Menu"
import { CDialog } from "@/components/Dialog"
import { CToast } from "@/components/Toast"

export enum MediaType {
	Audio,
	Video,
	Image
}

export type MediaStoreType = {
	blob: Blob | null
	type: MediaType
}

export const MediaStore = new ObservableStore<MediaStoreType>({
	blob: null,
	type: MediaType.Video
})

const _ref_open_btn = $(ElementIds.apOpen_btn) as CButton.CElement
const _ref_open_menu = $(ElementIds.apOpen_menu) as CMenu.CElement
const _ref_open_device = $(ElementIds.apOpen_device) as CMenu.CItem.CElement
const _ref_open_link = $(ElementIds.apOpen_link) as CMenu.CItem.CElement
const _ref_open_linkDialog = $(ElementIds.apOpen_linkDialog) as CDialog.CElement
const _ref_open_linkInput = $(ElementIds.apOpen_linkInput) as HTMLInputElement
const _ref_open_linkInsert = $(ElementIds.apOpen_linkInsert) as CButton.CElement
const _ref_media_image = $(ElementIds.bd_image) as HTMLImageElement
const _ref_media_audio = $(ElementIds.bd_audio) as HTMLAudioElement
const _ref_media_video = $(ElementIds.bd_video) as HTMLVideoElement

// toa = toast
const _ref_toa_invalid = $(ElementIds.toa_invalid) as CToast.CElement
const _ref_toa_noFile = $(ElementIds.toa_noFile) as CToast.CElement
const _ref_toa_error = $(ElementIds.toa_error) as CToast.CElement
const _ref_toa_loading = $(ElementIds.toa_loading) as CToast.CElement
const _ref_toa_loadingAbort = $(ElementIds.toa_loadingAbort) as CButton.CIcon.CElement

let _isAborted = false
let _abortCtrl = new AbortController()

async function _updateMediaFromBlob(blob: Blob): Promise<void> {
	const bType = blob.type
	let mediaType: MediaType | null = null
	if (bType.startsWith('image/')) {
		mediaType = MediaType.Image
	}
	else if (bType.startsWith('video/')) {
		mediaType = MediaType.Video
	}
	else if (bType.startsWith('audio/')) {
		mediaType = MediaType.Audio
	}

	if (mediaType === null) {
		_ref_toa_invalid.showPopover()
		return
	}

	MediaStore.update(v => {
		v.blob = blob
		v.type = mediaType
	})
}

function _subsView(v: MediaStoreType, o: MediaStoreType): void {
	const blob = v.blob
	if (!blob || blob === o.blob) {return}

	const src = URL.createObjectURL(blob)
	switch (v.type) {
	case MediaType.Audio:
		_ref_media_image.hidden = _ref_media_video.hidden = true
		_ref_media_audio.hidden = false
		_ref_media_audio.src = src
		break
	case MediaType.Video:
		_ref_media_image.hidden = _ref_media_audio.hidden = true
		_ref_media_video.hidden = false
		_ref_media_video.src = src
		break
	case MediaType.Image:
		_ref_media_audio.hidden = _ref_media_video.hidden = true
		_ref_media_image.hidden = false
		_ref_media_image.src = src
		break
	}
}

function _initSubscriber(): void {
	MediaStore.subscribe(_subsView)
}

function _initEvents(): void {
	_ref_open_menu.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		CButton.update(_ref_open_btn, {
			Button: {focused: isOpen}
		})
	})

	_ref_open_device.addEventListener("click", () => {
		_ref_open_menu.hidePopover()
		pickFile('image/*, video/*, audio/*', false).then(files => {
			if (files === null || files.length === 0) {
				_ref_toa_noFile.showPopover()
				return
			}

			_updateMediaFromBlob(files[0])
		})
	})

	_ref_open_link.addEventListener('click', () => {
		_ref_open_menu.hidePopover()
		_ref_open_linkInput.value = ''
		_ref_open_linkInsert.disabled = true
		_ref_open_linkDialog.showModal()
	})

	_ref_open_linkInput.addEventListener('input', () => {
		_ref_open_linkInsert.disabled = _ref_open_linkInput.value.trim().length <= 0
	})

	_ref_open_linkInsert.addEventListener('click', () => {
		const link = _ref_open_linkInput.value
		_ref_toa_loading.showPopover()
		fetch(link, {signal: _abortCtrl.signal})
		.then((result) => {
			result.blob()
			.then((blob) => _updateMediaFromBlob(blob))
			.catch(() => {
				_ref_toa_error.showPopover()
			})
		})
		.catch(() => {
			if (_isAborted) {
				_isAborted = false
				return
			}

			_ref_toa_error.showPopover()
		})
		.finally(() => {
			_ref_toa_loading.hidePopover()
			_abortCtrl = new AbortController()
		})
	})

	_ref_toa_loadingAbort.addEventListener('click', () => {
		_isAborted = true
		_abortCtrl.abort()
		_ref_toa_loading.hidePopover()
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}