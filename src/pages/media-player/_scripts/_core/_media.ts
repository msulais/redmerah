import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { updateButtonRef, type ButtonElement, type IconButtonElement } from "@/components/Button"
import { $ } from "./_dom-utils"
import { pickFile } from "@/utils/file"
import type { MenuElement, MenuItemElement } from "@/components/Menu"
import type { DialogElement } from "@/components/Dialog"
import type { ToastElement } from "@/components/Toast"

export enum MediaType {
	audio,
	video,
	image
}

export type MediaStoreType = {
	blob: Blob | null
	type: MediaType
}

export const MediaStore = new ObservableStore<MediaStoreType>({
	blob: null,
	type: MediaType.video
})

const _open_btnRef = $(ElementIds.apOpen_btn) as ButtonElement
const _open_menuRef = $(ElementIds.apOpen_menu) as MenuElement
const _open_deviceRef = $(ElementIds.apOpen_device) as MenuItemElement
const _open_linkRef = $(ElementIds.apOpen_link) as MenuItemElement
const _open_linkDialogRef = $(ElementIds.apOpen_linkDialog) as DialogElement
const _open_linkInputRef = $(ElementIds.apOpen_linkInput) as HTMLInputElement
const _open_linkInsertRef = $(ElementIds.apOpen_linkInsert) as ButtonElement
const _media_imageRef = $(ElementIds.bd_image) as HTMLImageElement
const _media_audioRef = $(ElementIds.bd_audio) as HTMLAudioElement
const _media_videoRef = $(ElementIds.bd_video) as HTMLVideoElement

// toa = toast
const _toa_invalidRef = $(ElementIds.toa_invalid) as ToastElement
const _toa_noFileRef = $(ElementIds.toa_noFile) as ToastElement
const _toa_errorRef = $(ElementIds.toa_error) as ToastElement
const _toa_loadingRef = $(ElementIds.toa_loading) as ToastElement
const _toa_loadingAbortRef = $(ElementIds.toa_loadingAbort) as IconButtonElement

let _isAborted = false
let _abortCtrl = new AbortController()

async function _updateMediaFromBlob(blob: Blob): Promise<void> {
	const bType = blob.type
	let mediaType: MediaType | null = null
	if (bType.startsWith('image/')) {
		mediaType = MediaType.image
	}
	else if (bType.startsWith('video/')) {
		mediaType = MediaType.video
	}
	else if (bType.startsWith('audio/')) {
		mediaType = MediaType.audio
	}

	if (mediaType === null) {
		_toa_invalidRef.showPopover()
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
	case MediaType.audio:
		_media_imageRef.hidden = _media_videoRef.hidden = true
		_media_audioRef.hidden = false
		_media_audioRef.src = src
		break
	case MediaType.video:
		_media_imageRef.hidden = _media_audioRef.hidden = true
		_media_videoRef.hidden = false
		_media_videoRef.src = src
		break
	case MediaType.image:
		_media_audioRef.hidden = _media_videoRef.hidden = true
		_media_imageRef.hidden = false
		_media_imageRef.src = src
		break
	}
}

function _initSubscriber(): void {
	MediaStore.subscribe(_subsView)
}

function _initEvents(): void {
	_open_menuRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateButtonRef(_open_btnRef, {
			ButtonFocused: isOpen
		})
	})

	_open_deviceRef.addEventListener("click", () => {
		_open_menuRef.hidePopover()
		pickFile('image/*, video/*, audio/*', false).then(files => {
			if (files === null || files.length === 0) {
				_toa_noFileRef.showPopover()
				return
			}

			_updateMediaFromBlob(files[0])
		})
	})

	_open_linkRef.addEventListener('click', () => {
		_open_menuRef.hidePopover()
		_open_linkInputRef.value = ''
		_open_linkInsertRef.disabled = true
		_open_linkDialogRef.showModal()
	})

	_open_linkInputRef.addEventListener('input', () => {
		_open_linkInsertRef.disabled = _open_linkInputRef.value.trim().length <= 0
	})

	_open_linkInsertRef.addEventListener('click', () => {
		const link = _open_linkInputRef.value
		_toa_loadingRef.showPopover()
		fetch(link, {signal: _abortCtrl.signal})
		.then((result) => {
			result.blob()
			.then((blob) => _updateMediaFromBlob(blob))
			.catch(() => {
				_toa_errorRef.showPopover()
			})
		})
		.catch(() => {
			if (_isAborted) {
				_isAborted = false
				return
			}

			_toa_errorRef.showPopover()
		})
		.finally(() => {
			_toa_loadingRef.hidePopover()
			_abortCtrl = new AbortController()
		})
	})

	_toa_loadingAbortRef.addEventListener('click', () => {
		_isAborted = true
		_abortCtrl.abort()
		_toa_loadingRef.hidePopover()
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}