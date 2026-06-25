import * as Ids from '../shared/ids.enum.js'
import * as Button from '@/web-components/components/button.js'
import * as WebComponent from '@/web-components/global-attributes.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { $ } from './dom-utils.js'
import { signal, subscribe } from '@/utils/signal.js'
import { APPS } from '@/constants/apps.js'
import { updateElementList } from '@/utils/element.js'
import { advancedStringSearch } from '@/utils/string.js'

const SORTED_APPS = ([] as typeof APPS).concat(APPS).sort((a, b) => a.name.localeCompare(b.name))

export const sg_search = signal('')

const _ref_searchInput = $(Ids.SearchInput) as HTMLInputElement
const _ref_content = $(Ids.Content) as HTMLUListElement

let _time_search: ReturnType<typeof setTimeout> | undefined

function _search(): void {
	clearTimeout('')
	_time_search = setTimeout(() => {
		const search = sg_search().trim().replace(/\s+/g, '')
		let arr = SORTED_APPS
		if (sg_search().length > 0) {
			arr = arr.filter(v => advancedStringSearch(search, v.name, true))
		}

		updateElementList(
			_ref_content,
			arr,
			() => {
				const li = document.createElement('li')
				const a = document.createElement('a')
				const img = document.createElement('img')
				const span = document.createElement('span')
				li.append(a)
				a.append(img, span)

				a.setAttribute(WebComponent.GlobalAttributes.As, WebComponent.As.Button)
				a.setAttribute(Button.Attributes.Variant, Button.Variant.Tonal)
				img.loading = 'eager'
				img.style.setProperty('width', '3rem')
				return li
			},
			(element, app) => {
				const a = element.querySelector<HTMLAnchorElement>('a')
				const img = element.querySelector<HTMLImageElement>('img')
				const span = element.querySelector<HTMLSpanElement>('span')
				if (a) {
					a.href = app.link
					a.style.setProperty('--color', app.color)
					a.setAttribute(WebComponent.GlobalAttributes.Tooltip, app.name)
				}

				if (img) {
					img.src = app.logoUrl
					img.alt = app.name + ' logo'
				}

				if (span) {
					span.textContent = app.name
				}
			}
		)
	}, 250)
}

function _initSubscriber(): void {
	subscribe(() => {
		if (!_ref_searchInput.matches(":focus")) {
			_ref_searchInput.value = sg_search()
		}

		_search()
	}, sg_search)
}

function _initEvents(): void {
	delegateEvent(_ref_searchInput, 'input', () => {
		sg_search.set(_ref_searchInput.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}