import { ObservableStore } from "@/utils/store"
import { updateEmojiList } from "./_body"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import type { PopoverElement } from "@/native-components/Popover"

export type SearchStoreType = Readonly<{
	isSearching: boolean
	searchText: string
}>

export const SearchStore = new ObservableStore<SearchStoreType>({
	isSearching: false,
	searchText: ''
})
const _searchTextFieldRef = $(ElementIds.appbarSearchTextField) as HTMLInputElement
const _searchPopoverRef = $(ElementIds.appbarSearchPopover) as PopoverElement
let _timeSearchId: NodeJS.Timeout | number | null = null

function _searchEmoji(): void {
	if (_timeSearchId !== null) {
		clearTimeout(_timeSearchId)
	}

	_timeSearchId = setTimeout(() => {
		_timeSearchId = null
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
	_searchPopoverRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		SearchStore.update(v => ({...v, isSearching: isOpen}))
	})

	_searchTextFieldRef.addEventListener('input', () => {
		SearchStore.update(v => ({...v, searchText: _searchTextFieldRef.value}))
	})

	_searchTextFieldRef.addEventListener('focus', () => {
		SearchStore.update(v => ({...v, searchText: _searchTextFieldRef.value}))
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}