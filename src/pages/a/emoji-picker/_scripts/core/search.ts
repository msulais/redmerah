import { ObservableStore } from "@/utils/store"
import { updateEmojiList } from "./body"
import { $ } from "./dom-utils"
import { ElementIds } from "../shared/ids"
import { CPopover } from "@/components/Popover"

export type SearchStoreType = Readonly<{
	isSearching: boolean
	searchText: string
}>

export const SearchStore = new ObservableStore<SearchStoreType>({
	isSearching: false,
	searchText: ''
})
const _ref_searchTextField = $(ElementIds.apSrc_input) as HTMLInputElement
const _ref_searchPopover = $(ElementIds.apSrc_popover) as CPopover.CElement
let _time_search: NodeJS.Timeout | number | null = null

function _searchEmoji(): void {
	if (_time_search !== null) {
		clearTimeout(_time_search)
	}

	_time_search = setTimeout(() => {
		_time_search = null
		updateEmojiList()
	}, 1000)
}

function _subscribeSearchTextChanges(v: SearchStoreType, o: SearchStoreType): void {
	if (v.searchText === o.searchText) {return}

	_searchEmoji()
}

function _subscribeIsSearchingChanges(v: SearchStoreType, o: SearchStoreType): void {
	if (v.isSearching === o.isSearching) {return}

	_searchEmoji()
}

function _initSubscriber(): void {
	SearchStore.subscribe(_subscribeSearchTextChanges)
	SearchStore.subscribe(_subscribeIsSearchingChanges)
}

function _initEvents(): void {
	_ref_searchPopover.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		SearchStore.update(v => v.isSearching = isOpen)
	})

	_ref_searchTextField.addEventListener('input', () => {
		SearchStore.update(v => v.searchText = _ref_searchTextField.value)
	})

	_ref_searchTextField.addEventListener('focus', () => {
		SearchStore.update(v => v.searchText = _ref_searchTextField.value)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}