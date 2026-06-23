import * as Ids from '../shared/ids.enum.js'
import * as WebComponent from '@/web-components/global-attributes.js'
import * as Button from '@/web-components/components/button.js'
import * as BrIcon from '@/web-components/components/br-icon.js'
import * as Icons from '@/enums/icons.enum.js'
import { signal } from "@/utils/signal"
import { $ } from './dom-utils.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { advancedStringSearch } from '@/utils/string.js'
import { EMOJIS_ACTIVITIES, EMOJIS_ANIMAL_AND_NATURE, EMOJIS_FLAGS, EMOJIS_FOOD_AND_DRINK, EMOJIS_OBJECT, EMOJIS_PERSON_AND_BODY, EMOJIS_PERSON_AND_BODY_DARK_SKIN_TONE, EMOJIS_PERSON_AND_BODY_LIGHT_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_DARK_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_LIGHT_SKIN_TONE, EMOJIS_PERSON_AND_BODY_MEDIUM_SKIN_TONE, EMOJIS_SMILEY_AND_EMOTION, EMOJIS_SYMBOLS, EMOJIS_TRAVEL_AND_PLACES } from '@/constants/emoji.js'

const EMOJI_GROUPS: {
	name: string,
	emojis: [emoji: string, description: string][]
}[] = [
	{
		name: 'Smiley & Emotion',
		emojis: EMOJIS_SMILEY_AND_EMOTION
	},
	{
		name: 'Person & Body',
		emojis: EMOJIS_PERSON_AND_BODY
	},
	{
		name: 'Person & Body (Light)',
		emojis: EMOJIS_PERSON_AND_BODY_LIGHT_SKIN_TONE
	},
	{
		name: 'Person & Body (Medium Light)',
		emojis: EMOJIS_PERSON_AND_BODY_MEDIUM_LIGHT_SKIN_TONE
	},
	{
		name: 'Person & Body (Medium)',
		emojis: EMOJIS_PERSON_AND_BODY_MEDIUM_SKIN_TONE
	},
	{
		name: 'Person & Body (Medium Dark)',
		emojis: EMOJIS_PERSON_AND_BODY_MEDIUM_DARK_SKIN_TONE
	},
	{
		name: 'Person & Body (Dark)',
		emojis: EMOJIS_PERSON_AND_BODY_DARK_SKIN_TONE
	},
	{
		name: 'Animal & Nature',
		emojis: EMOJIS_ANIMAL_AND_NATURE
	},
	{
		name: 'Food & Drink',
		emojis: EMOJIS_FOOD_AND_DRINK
	},
	{
		name: 'Travel & Places',
		emojis: EMOJIS_TRAVEL_AND_PLACES
	},
	{
		name: 'Activities',
		emojis: EMOJIS_ACTIVITIES
	},
	{
		name: 'Object',
		emojis: EMOJIS_OBJECT
	},
	{
		name: 'Symbols',
		emojis: EMOJIS_SYMBOLS
	},
	{
		name: 'Flags',
		emojis: EMOJIS_FLAGS
	},
]

export const sg_searchText = signal('')

const _ref_searchInput = $(Ids.SearchInput) as HTMLInputElement
const _ref_body = $(Ids.Body) as HTMLDivElement
const _ref_searchResult = $(Ids.SearchResult) as HTMLDivElement

let _time_search: ReturnType<typeof setTimeout> | undefined

function _search(): void {
	clearTimeout(_time_search)
	const isSearchMode = sg_searchText().length > 0
	if (!isSearchMode) {
		_ref_searchResult.replaceChildren()
		_ref_body.style.removeProperty('display')
		_ref_searchResult.style.removeProperty('display')
		return
	}

	_time_search = setTimeout(() => {
		_ref_body.style.setProperty('display', 'none')
		_ref_searchResult.style.setProperty('display', 'flex')
		const children: HTMLDetailsElement[] = []
		const search = sg_searchText().replace(/\s+/g, '')
		for (const {name, emojis} of EMOJI_GROUPS) {
			const result: (typeof emojis[number])[] = []
			for (const emoji of emojis) {
				const matches = advancedStringSearch(search, emoji[1], true)
				if (matches) {
					result.push(emoji)
				}
			}

			if (result.length <= 0) {
				continue
			}

			result.sort((a, b) => a[1].localeCompare(b[1]))
			const details = document.createElement('details')
			const summary = document.createElement('summary')
			const ul = document.createElement('ul')
			const icon = document.createElement(BrIcon.TAGNAME)
			icon.innerHTML = Icons.ChevronDown
			summary.textContent = name
			summary.setAttribute(WebComponent.GlobalAttributes.As, 'button')
			summary.setAttribute(Button.Attributes.Variant, Button.Variant.Tonal)
			summary.append(icon)
			details.append(summary, ul)
			details.open = !/Light|Dark|Medium/.test(name)
			children.push(details)
			for (const emoji of result) {
				const li = document.createElement('li')
				const button = document.createElement('button')
				button.setAttribute(WebComponent.GlobalAttributes.Tooltip, emoji[1])
				button.textContent = emoji[0]
				button.setAttribute('data-emoji', emoji[0])
				li.append(button)
				ul.append(li)
			}
		}

		_ref_searchResult.replaceChildren(...children)
	}, 500)
}

function _initSubscriber(): void {
	sg_searchText.subscribe(v => {
		if (!_ref_searchInput.matches(':focus')) {
			_ref_searchInput.value = v
		}

		_search()
	})
}

function _initEvents(): void {
	delegateEvent(_ref_searchInput, 'input', () => {
		sg_searchText.set(_ref_searchInput.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}