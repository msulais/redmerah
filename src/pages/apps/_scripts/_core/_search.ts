import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { $, $$$ } from "./_dom-utils"

export type SearchStoreType = {
	text: string
}

export const SearchStore = new ObservableStore<SearchStoreType>({
	text: ''
})

const _searchRef = $(ElementIds.searchInput) as HTMLInputElement
const _listRefs = $$$<HTMLLIElement>(`#${CSS.escape(ElementIds.appList)}>li`)
let _timeUpdateId: NodeJS.Timeout | number | undefined

function _subsView(v: SearchStoreType, o: SearchStoreType): void {
	let text = v.text
	if (text === o.text) {return}

	clearTimeout(_timeUpdateId)
	_timeUpdateId = setTimeout(() => {
		text = text.replace(/\s|\W/gs, ' ').toLowerCase().trim()
		if (text.length <= 0) {
			for (const ref of _listRefs) {
				ref.hidden = false
			}
			return
		}

		text = text.replace(/ +/gs, '|')
		for (const ref of _listRefs) {
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
	_searchRef.addEventListener('input', () => {
		SearchStore.update(v => v.text = _searchRef.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}