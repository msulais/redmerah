import { ObservableStore } from "@/utils/signal"
import { ElementIds } from "../_shared/_ids"
import { $, $$$ } from "./_dom-utils"

export type SearchStoreType = {
	text: string
}

export const SearchStore = new ObservableStore<SearchStoreType>({
	text: ''
})

const _ref_search = $(ElementIds.searchInput) as HTMLInputElement
const _refs_list = $$$<HTMLLIElement>(`#${CSS.escape(ElementIds.appList)}>li`)
let _time_update: NodeJS.Timeout | number | undefined

function _subsView(v: SearchStoreType, o: SearchStoreType): void {
	let text = v.text
	if (text === o.text) {return}

	clearTimeout(_time_update)
	_time_update = setTimeout(() => {
		text = text.replace(/\s|\W/gs, ' ').toLowerCase().trim()
		if (text.length <= 0) {
			for (const ref of _refs_list) {
				ref.hidden = false
			}
			return
		}

		text = text.replace(/ +/gs, '|')
		for (const ref of _refs_list) {
			const content = ref.textContent?.toLowerCase().trim() ?? ''
			const match = new RegExp(text, 'gsi').test(content)
			ref.hidden = !match
		}
	}, 100)
}

function _initSubscriber(): void {
	SearchStore.subscribe(_subsView)
}

function _initEvents(): void {
	_ref_search.addEventListener('input', () => {
		SearchStore.update(v => v.text = _ref_search.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}