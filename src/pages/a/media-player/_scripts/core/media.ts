import * as BrDialog from '@/web-components/components/br-dialog.js'
import * as Ids from '../shared/ids.enum.js'
import { batch, signal } from "@/utils/signal"
import { $ } from "./dom-utils.js"
import { delegateEvent } from '@/utils/event-registry'
import { pickFile } from '@/utils/file'

const MediaTypes = {
	Audio: 1,
	Video: 2,
	Image: 3
} as const
type MediaTypes = typeof MediaTypes[keyof typeof MediaTypes]

export const sg_blob = signal<Blob | null>(null)
export const sg_type = signal<MediaTypes>(MediaTypes.Video)

const _ref_openLinkDialog     = $(Ids.DialogOnlineLink) as BrDialog.BiruDialogElement
const _ref_openLinkInput      = $(Ids.DialogOnlineUrl) as HTMLInputElement
const _ref_openLinkInsert     = $(Ids.DialogOnlineInsert) as HTMLButtonElement
const _ref_openFromThisDevice = $(Ids.PickerMenuThisDevice) as HTMLButtonElement
const _ref_openLinkProgress   = $(Ids.DialogOnlineProgress) as HTMLProgressElement
const _ref_openLinkCancel     = $(Ids.DialogOnlineCancel) as HTMLButtonElement
const _ref_mediaImage         = $(Ids.Image) as HTMLImageElement
const _ref_mediaAudio         = $(Ids.Audio) as HTMLAudioElement
const _ref_mediaVideo         = $(Ids.Video) as HTMLVideoElement

let _abortCtrl: AbortController | undefined
let _mediaUrl = ''

function _updateMediaFromBlob(blob: Blob): boolean {
	const bType = blob.type
	let mediaType: MediaTypes | null = null
	if (bType.startsWith('image/')) {
		mediaType = MediaTypes.Image
	}
	else if (bType.startsWith('video/')) {
		mediaType = MediaTypes.Video
	}
	else if (bType.startsWith('audio/')) {
		mediaType = MediaTypes.Audio
	}

	if (mediaType === null) {
		alert('File type is not valid. Only image, audio, and video are allowed.')
		return false
	}

	batch(() => {
		sg_blob.set(blob)
		sg_type.set(mediaType)
	})

	return true
}

function _initSubscriber(): void {
	sg_blob.subscribe(v => {
		if (v === null) {
			return
		}

		URL.revokeObjectURL(_mediaUrl)
		_mediaUrl = URL.createObjectURL(v)
		switch (sg_type()) {
		case MediaTypes.Audio:
			_ref_mediaImage.hidden = _ref_mediaVideo.hidden = true
			_ref_mediaAudio.hidden = false
			_ref_mediaAudio.src = _mediaUrl
			_ref_mediaVideo.src = ''
			_ref_mediaImage.src = ''
			break
		case MediaTypes.Video:
			_ref_mediaImage.hidden = _ref_mediaAudio.hidden = true
			_ref_mediaVideo.hidden = false
			_ref_mediaAudio.src = ''
			_ref_mediaVideo.src = _mediaUrl
			_ref_mediaImage.src = ''
			break
		case MediaTypes.Image:
			_ref_mediaAudio.hidden = _ref_mediaVideo.hidden = true
			_ref_mediaImage.hidden = false
			_ref_mediaAudio.src = ''
			_ref_mediaVideo.src = ''
			_ref_mediaImage.src = _mediaUrl
			break
		}
	})
}

function _initEvents(): void {
	delegateEvent(_ref_openFromThisDevice, "click", () => {
		pickFile('image/*, video/*, audio/*', false).then(files => {
			if (files === null || files.length === 0) {
				return
			}

			_updateMediaFromBlob(files[0]!)
		})
	})

	delegateEvent(_ref_openLinkInput, 'input', () => {
		_ref_openLinkInsert.disabled = _ref_openLinkInput.value.trim().length <= 0
	})

	_ref_openLinkInsert.addEventListener('click', () => {
		const link = _ref_openLinkInput.value
		_abortCtrl?.abort()
		_abortCtrl = new AbortController()
		_ref_openLinkProgress.style.removeProperty('display')
		fetch(link, {signal: _abortCtrl.signal})
		.then((result) => {
			result.blob()
			.then((blob) => {
				const done = _updateMediaFromBlob(blob)
				if (done) {
					_ref_openLinkDialog.biru.close()
				}
			})
			.catch(() => {
			})
			.finally(() => {
				_ref_openLinkProgress.style.setProperty('display', 'none')
			})
		})
		.catch((error) => {
			if (error.name === 'AbortError') {
				console.log('Request was cancelled by the user.')
			}
			else {
				alert("Unable to fetch the link. The link might be blocked, or there may be a connection issue.")
			}
			_ref_openLinkProgress.style.setProperty('display', 'none')
		})
	})

	delegateEvent(_ref_openLinkCancel, 'click', () => {
		_abortCtrl?.abort()
	})

	delegateEvent(_ref_openLinkDialog, BrDialog.EventTypes.Toggle, () => {
		if (!_ref_openLinkDialog.biru.isOpen) {
			return
		}

		_ref_openLinkInput.value = ''
		_ref_openLinkInsert.disabled = true
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}