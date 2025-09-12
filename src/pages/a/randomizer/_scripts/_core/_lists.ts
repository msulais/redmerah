import { ObservableStore } from "@/utils/store"
import { DEFAULT_LISTS } from "../_shared/_constant"
import { $, $$, $$$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import type { MenuElement, MenuItemElement } from "@/components/Menu"
import { updateDialogRef, type DialogElement } from "@/components/Dialog"
import { isTargetValidElement } from "@/utils/element"
import { Commands } from "../_shared/_commands"
import type { TextAreaFieldElement } from "@/components/TextAreaField"
import { createIconButtonRef, type ButtonElement } from "@/components/Button"
import { createListRef, ListVariant, updateListRef, type ListElement } from "@/components/List"
import { IconCodes } from "@/enums/icons"
import { createIconRef } from "@/components/Icon"
import { AppCSSColors } from "@/enums/app-data"
import { createComboBoxOptionRef, type ComboBoxElement, type ComboBoxOptionElement } from "@/components/ComboBox"
import { SelectionStore } from "../_features/_selection"
import { Math_clamp } from "@/utils/math"
import { TeamsStore } from "../_features/_teams"
import { WordsStore } from "../_features/_words"
import { CSSClasses } from "../../_styles/_css"
import { deleteListItem, saveListItem } from "./_database"
import { deepCopy } from "@/utils/object"
import { pxToRem } from "@/utils/css"

export type ListItem = {
	id: number
	name: string
	items: string[]
}

export type ListsStoreType = Readonly<{
	list: ListItem[]
}>

export const ListsStore = new ObservableStore<ListsStoreType>({
	list: DEFAULT_LISTS
})

const _selectionListRef = $(ElementIds.pgSel_list) as ComboBoxElement
const _teamsNamesRef = $(ElementIds.pgTm_names) as ComboBoxElement
const _teamsMembersRef = $(ElementIds.pgTm_members) as ComboBoxElement
const _wordsListRef = $(ElementIds.pgWrd_list) as ComboBoxElement
const _listBtnRef = $(ElementIds.apSett_listBtn) as MenuItemElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as MenuElement
const _listDialogRef = $(ElementIds.apSett_listDialog) as DialogElement
const _listSaveRef = $(ElementIds.apSett_listSave) as ButtonElement
const _listsRef = $(ElementIds.apSett_list) as HTMLUListElement
const _newDialogRef = $(ElementIds.apSett_listNewDialog) as DialogElement
const _newListBtnRef = $(ElementIds.apSett_listNew) as ButtonElement
const _listNameInputRef = $(ElementIds.apSett_listNewName) as HTMLInputElement
const _listItemsInputRef = $(ElementIds.apSett_listNewItems) as TextAreaFieldElement
const _deleteDialogRef = $(ElementIds.apSett_listDeleteDialog) as DialogElement
const _deleteItemRef = $(ElementIds.apSett_listDeleteItem) as ListElement<HTMLDivElement>
const _deleteBtnRef = $(ElementIds.apSett_listDelete) as ButtonElement
let _listEditMode = false
let _listIndexToRemove = -1
let _listIndexToEdit = -1

export function updateSelectedList(): void {
	const list = ListsStore.value.list
	const firstList = list[0]
	if (!firstList) {return}

	const hasList = (id: number) => list.some(v => v.id === id)
	words: {
		const store = WordsStore.value
		let listId: number | null = null
		if (!hasList(store.listId)) {
			listId = firstList.id
		}

		WordsStore.update(v => v.listId = listId ?? v.listId)

		break words
	}

	selection: {
		const store = SelectionStore.value
		let listId: number | null = null
		let count: number | null = null
		let members: string[] | null = null
		if (!hasList(store.listId)) {
			listId = firstList.id
		}

		const items = list.find(v => v.id === (listId ?? store.listId))?.items
		if (items && store.count > items.length) {
			count = Math_clamp(
				items.length, 1, list[0].items.length
			)
		}

		if (items && items.join('') !== store.listItems.join('')) {
			members = [...items]
		}

		SelectionStore.update(v => {
			v.listId = listId ?? v.listId
			v.count = count ?? v.count
			v.listItems = members ?? v.listItems
		})

		break selection
	}

	teams: {
		const store = TeamsStore.value
		let nameListId: number | null = null
		let memberListId: number | null = null
		let count: number | null = null
		if (!hasList(store.namesId)) {
			nameListId = firstList.id
		}

		if (!hasList(store.membersId)) {
			memberListId = list[1]?.id ?? firstList.id
		}

		const members = list.find(v => v.id === (memberListId ?? store.membersId))?.items
		if (members && store.count > members.length) {
			count = members.length
		}

		TeamsStore.update(v => {
			v.count = count ?? v.count
			v.membersId = memberListId ?? v.membersId
			v.namesId = nameListId ?? v.namesId
		})

		break teams
	}
}

function _newList(name: string, items: string[]): void {
	const lists = deepCopy(ListsStore.value.list)
	const ids = new Set(lists.map(v => v.id))
	let id = 0
	for (let i = 1; i < Number.MAX_SAFE_INTEGER; i++) {
		id = i
		if (!ids.has(id)) {break}
	}

	const newList: ListItem = {id, name, items}
	lists.push(newList)
	saveListItem(newList)
	ListsStore.update(v => v.list = lists.sort((a, b) => a.name.localeCompare(b.name)))
}

function _editList(listIndex: number, name: string, items: string[]): void {
	const lists = deepCopy(ListsStore.value.list)
	if (!lists[listIndex]) {return}

	lists[listIndex] = {
		...lists[listIndex],
		name,
		items
	}

	saveListItem(lists[_listIndexToEdit])
	ListsStore.update(v => v.list = lists)
}

function _deleteList(index: number): void {
	const list = [...ListsStore.value.list]
	if (!list[index]) {return}

	deleteListItem(list[index].id)
	list.splice(index, 1)
	ListsStore.update(v => v.list = list)
}

function _subsListView(v: ListsStoreType, o: ListsStoreType): void {
	const list = v.list
	if (list === o.list) {return}

	const sortedList = [...list].sort((a, b) => a.name.localeCompare(b.name))
	const refs = $$$<HTMLLIElement>('li', _listsRef)
	for (let i = 0; i < refs.length; i++) {
		const ref = refs[i]
		if (i >= sortedList.length) {
			ref.remove()
			continue
		}

		const list = sortedList[i]
		const itemLength = list.items.length
		ref.setAttribute('data-list-id', list.id.toString())
		updateListRef<HTMLLIElement>(ref, {
			ListChildren: [list.name],
			ListSubtitle: [
				[itemLength, 'item' + (itemLength > 1? 's' : '')].join(' ')
			]
		})

		const deleteBtnRef = $$<ButtonElement>(`[data-command=${CSS.escape(Commands.deleteList)}]`)
		if (deleteBtnRef) {
			deleteBtnRef.disabled = sortedList.length <= 1
		}
	}

	for (let i = 0; i < sortedList.length - refs.length; i++) {
		const index = refs.length + i
		const list = sortedList[index]
		const itemLength = list.items.length
		_listsRef.append(createListRef({
			ListTagName: 'li',
			ListVariant: ListVariant.tonal,
			ListChildren: [list.name],
			ListSubtitle: [
				[itemLength, 'item' + (itemLength > 1? 's' : '')].join(' ')
			],
			ListLeading: [
				createIconRef({
					IconCode: IconCodes.textBulletListLtr,
					IconFilled: true,
					IconRefs: {icon(ref) {
						ref.style.setProperty('color', `rgb(${AppCSSColors.accent})`)
					}}
				})
			],
			ListTrailing: [
				createIconButtonRef({
					IconButtonIcon: {IconCode: IconCodes.edit},
					IconButtonRefs: {button(ref) {
						ref.setAttribute('aria-label', 'Edit')
						ref.setAttribute('data-tooltip', 'Edit')
						ref.setAttribute('data-command', Commands.editList)
					}}
				}),
				createIconButtonRef({
					IconButtonIcon: {IconCode: IconCodes.delete},
					ButtonDisabled: sortedList.length <= 1,
					IconButtonRefs: {button(ref) {
						ref.setAttribute('aria-label', 'Delete')
						ref.setAttribute('data-tooltip', 'Delete')
						ref.setAttribute('data-command', Commands.deleteList)
					}}
				}),
			],
			ListRefs: {
				list(ref) {
					ref.style.setProperty('padding-right', pxToRem(4) + 'rem')
					ref.setAttribute('data-list-id', list.id.toString())
					ref.classList.add(CSSClasses.listItem)
				},
				trailing(ref) {
					ref.style.setProperty('display', 'flex')
					ref.style.setProperty('align-items', 'center')
					ref.style.setProperty('gap', pxToRem(1) + 'rem')
				},
			}
		}))
	}

	for (const ref of [
		_selectionListRef,
		_teamsNamesRef,
		_teamsMembersRef,
		_wordsListRef,
	]) {
		const refs = $$$<ComboBoxOptionElement>('option', ref)
		for (let i = 0; i < refs.length; i++) {
			const ref = refs[i]
			if (i >= sortedList.length) {
				ref.remove()
				continue
			}

			const list = sortedList[i]
			ref.value = list.id.toString()
			ref.textContent = [list.name, `(${list.items.length})`].join(' ')
		}

		for (let i = 0; i < sortedList.length - refs.length; i++) {
			const index = refs.length + i
			const list = sortedList[index]
			const opt = createComboBoxOptionRef({
				ComboBoxOptionChildren: [list.name + ` (${list.items.length})`]
			})
			opt.value = list.id.toString()
			ref.append(opt)
		}
	}

	updateSelectedList()
}

function _initSubscriber(): void {
	ListsStore.subscribe(_subsListView)
}

function _initEvents(): void {
	_listBtnRef.addEventListener('click', () => {
		_settingsMenuRef.hidePopover()
		_listDialogRef.showModal()
	})

	_listsRef.addEventListener('click', () => {
		const ref = document.activeElement as HTMLButtonElement
		if (!isTargetValidElement(_listsRef, ref)) {return}

		const command = ref.dataset.command as Commands
		const getListId = () => {
			const li = ref.closest('[data-list-id]') as HTMLLIElement
			if (!li) {return}

			const listId = li.dataset.listId
			if (!listId) {return}

			return Number.parseInt(listId)
		}

		switch (command) {
		case Commands.editList: {
			const id = getListId()
			if (typeof id !== 'number') {return}

			const lists = ListsStore.value.list
			const index = lists.findIndex(v => v.id === id)
			const list = lists[index]
			if (!list) {return}

			_listIndexToEdit = index
			_listEditMode = true
			updateDialogRef(_newDialogRef, {DialogHeader: ['Edit list']})
			_listNameInputRef.value = list.name
			_listItemsInputRef.value = list.items.join('; ')
			_listDialogRef.close()
			_newDialogRef.showModal()
			break
		}
		case Commands.deleteList: {
			const id = getListId()
			if (typeof id !== 'number') {return}

			const lists = ListsStore.value.list
			const index = lists.findIndex(v => v.id === id)
			if (index < 0) {return}

			const list = lists[index]
			const itemLength = list.items.length
			_listIndexToRemove = index
			updateListRef(_deleteItemRef, {
				ListChildren: [list.name],
				ListSubtitle: [[itemLength, 'item' + (itemLength > 1? 's' : '')].join(' ')]
			})
			_listDialogRef.close()
			_deleteDialogRef.showModal()
			break
		}}
	})

	_newListBtnRef.addEventListener('click', () => {
		updateDialogRef(_newDialogRef, {DialogHeader: ['New list']})
		_listNameInputRef.value = ''
		_listItemsInputRef.value = ''
		_listDialogRef.close()
		_newDialogRef.showModal()
		_listEditMode = false
	})

	_newDialogRef.addEventListener('close', () => {
		_listDialogRef.showModal()
	})

	_deleteDialogRef.addEventListener('close', () => {
		_listDialogRef.showModal()
	})

	_deleteBtnRef.addEventListener('click', () => {
		_deleteList(_listIndexToRemove)
	})

	_listNameInputRef.addEventListener('input', () => {
		_listNameInputRef.setCustomValidity('')
		_listNameInputRef.reportValidity()
	})

	_listItemsInputRef.addEventListener('input', () => {
		_listItemsInputRef.setCustomValidity('')
		_listItemsInputRef.reportValidity()
	})

	_listSaveRef.addEventListener('click', (ev) => {
		const report = (el: HTMLInputElement | HTMLTextAreaElement, msg: string) => {
			el.setCustomValidity(msg)
			el.reportValidity()
		}

		let name = _listNameInputRef.value.trim()
		let members: string[] = (_listItemsInputRef
			.value
			.split(/[\t\n;]/g)
			.map(v => v.trim())
			.filter(v => v.length > 0)
			.sort((a, b) => a.localeCompare(b))
		)

		if (name.length <= 0) {
			report(_listNameInputRef, 'List name must not empty')
			return ev.preventDefault()
		}

		if (members.length <= 1) {
			report(_listItemsInputRef, 'Must have at least 2 items')
			_listItemsInputRef.reportValidity()
			return ev.preventDefault()
		}

		if (_listEditMode) {
			_editList(_listIndexToEdit, name, members)
		}
		else {
			_newList(name, members)
		}
	})
}

export default () => {
	_initEvents()
	_initSubscriber()
}