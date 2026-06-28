import * as Ids from '../shared/ids.enum.js'
import * as AnimationEasing from '@/enums/animation-easing.enum.js'
import * as SkinTones from '../shared/skin-tones.enum.js'
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as InputNames from '../shared/input-names.enum.js'
import * as Constant from '../shared/constant.enum.js'
import * as WebComponent from '@/web-components/global-attributes.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { $, $$, $$$ } from './dom-utils.js'
import { isValidEnumValue } from '@/utils/object'
import type { EnumOf } from '@/types/collections.js'
import { signal } from '@/utils/signal'
import { updateElementList } from '@/utils/element'
import { EMOJIS_PERSON_AND_BODY, EMOJIS_PERSON_AND_BODY_DARK_SKIN_TONE, EMOJIS_PERSON_AND_BODY_LIGHT_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_DARK_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_LIGHT_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_SKIN_TONE } from '@/constants/emoji'
import { saveStorageItem } from './database.js'

export const sg_skinTone = signal<EnumOf<typeof SkinTones>>(Constant.DEFAULT_SKIN_TONE)

const _ref_pagePersonBody = $(Ids.PagePersonBody) as HTMLUListElement
const _ref_theme = _ref_pagePersonBody.closest(BrTheme.TAGNAME) as BrTheme.BiruThemeElement
const _ref_skinToneOptions = $(Ids.PagePersonBodySkinTones) as HTMLDivElement

function _initSubscriber(): void {
	sg_skinTone.subscribe(v => {
		saveStorageItem('skin-tone', v)
		const refs_prev = $$$<HTMLInputElement>(`input[name="${InputNames.SkinTone}"]`)
		const ref_target = $$<HTMLInputElement>(`input[name="${InputNames.SkinTone}"][value="${v}"]`)
		for (const ref of refs_prev) {
			ref.parentElement?.setAttribute('br:variant', 'icon')
		}

		ref_target?.parentElement?.setAttribute('br:variant', 'icon outlined')
		let emojis = EMOJIS_PERSON_AND_BODY
		switch (v) {
		case SkinTones.None:
			break
		case SkinTones.Light:
			emojis = EMOJIS_PERSON_AND_BODY_LIGHT_SKIN_TONE
			break
		case SkinTones.MediumLight:
			emojis = EMOJIS_PERSON_AND_BODY_MEDIUM_LIGHT_SKIN_TONE
			break
		case SkinTones.Medium:
			emojis = EMOJIS_PERSON_AND_BODY_MEDIUM_SKIN_TONE
			break
		case SkinTones.MediumDark:
			emojis = EMOJIS_PERSON_AND_BODY_MEDIUM_DARK_SKIN_TONE
			break
		case SkinTones.Dark:
			emojis = EMOJIS_PERSON_AND_BODY_DARK_SKIN_TONE
			break
		}

		updateElementList(
			_ref_pagePersonBody,
			emojis,
			(emoji) => {
				const li = document.createElement('li')
				const button = document.createElement('button')
				li.append(button)

				button.setAttribute(WebComponent.GlobalAttributes.Tooltip, emoji[1])
				button.textContent = emoji[0]
				button.setAttribute('data-emoji', emoji[0])
				return li
			},
			(ref, emoji) => {
				const button = ref.querySelector('button')
				if (!button) {
					return
				}

				button.setAttribute(WebComponent.GlobalAttributes.Tooltip, emoji[1])
				button.textContent = emoji[0]
				button.setAttribute('data-emoji', emoji[0])
			}
		)

		_ref_pagePersonBody.animate({
			opacity: [0, 1]
		}, {
			duration: _ref_theme.biru.transitionDuration > 0? 1000 : 0,
			easing: AnimationEasing.Spring
		})
	})
}

function _initEvents(): void {
	delegateEvent(_ref_skinToneOptions, 'change', (ev) => {
		const target = ev.target as HTMLInputElement
		const value = target?.value as EnumOf<typeof SkinTones>
		if (!value || !isValidEnumValue(value, SkinTones)) {
			return
		}

		sg_skinTone.set(value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}