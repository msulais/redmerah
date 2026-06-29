import { ObservableStore } from "@/utils/signal"
import { DEFAULT_LISTS } from "../_shared/_constant"
import { $, $$, $$$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { CMenu } from "@/components/Menu"
import { CDialog } from "@/components/Dialog"
import { isTargetValidElement } from "@/utils/element"
import { Commands } from "../_shared/_commands"
import { CTextAreaField } from "@/components/TextAreaField"
import { CButton } from "@/components/Button"
import { CList } from "@/components/List"
import { IconCodes } from "@/enums/icons"
import { CIcon } from "@/components/Icon"
import { AppCSSColors } from "@/enums/app-data"
import { CComboBox } from "@/components/ComboBox"
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

const _ref_selectionList = $(ElementIds.pgSel_list) as CComboBox.CElement
const _ref_teamsNames = $(ElementIds.pgTm_names) as CComboBox.CElement
const _ref_teamsMembers = $(ElementIds.pgTm_members) as CComboBox.CElement
const _ref_wordsList = $(ElementIds.pgWrd_list) as CComboBox.CElement
const _ref_listBtn = $(ElementIds.apSett_listBtn) as CMenu.CItem.CElement
const _ref_settingsMenu = $(ElementIds.apSett_menu) as CMenu.CElement
const _ref_listDialog = $(ElementIds.apSett_listDialog) as CDialog.CElement
const _ref_listSave = $(ElementIds.apSett_listSave) as CButton.CElement
const _ref_lists = $(ElementIds.apSett_list) as HTMLUListElement
const _ref_newDialog = $(ElementIds.apSett_listNewDialog) as CDialog.CElement
const _ref_newListBtn = $(ElementIds.apSett_listNew) as CButton.CElement
const _ref_listNameInput = $(ElementIds.apSett_listNewName) as HTMLInputElement
const _ref_listItemsInput = $(ElementIds.apSett_listNewItems) as CTextAreaField.CElement
const _ref_deleteDialog = $(ElementIds.apSett_listDeleteDialog) as CDialog.CElement
const _ref_deleteItem = $(ElementIds.apSett_listDeleteItem) as CList.CElement<HTMLDivElement>
const _ref_deleteBtn = $(ElementIds.apSett_listDelete) as CButton.CElement
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
				items.length, 1, list[0]!.items.length
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

	saveListItem(lists[_listIndexToEdit]!)
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
	const refs = $$$<HTMLLIElement>('li', _ref_lists)
	for (let i = 0; i < refs.length; i++) {
		const ref = refs[i]!
		if (i >= sortedList.length) {
			ref.remove()
			continue
		}

		const list = sortedList[i]!
		const itemLength = list.items.length
		ref.setAttribute('data-list-id', list.id.toString())
		CList.update<HTMLLIElement>(ref, {
			List: {
				children: [list.name],
				subtitle: [[itemLength, 'item' + (itemLength > 1? 's' : '')].join(' ')]
			}
		})

		const ref_deleteBtn = $$<CButton.CElement>(`[data-command=${CSS.escape(Commands.DeleteList)}]`)
		if (ref_deleteBtn) {
			ref_deleteBtn.disabled = sortedList.length <= 1
		}
	}

	for (let i = 0; i < sortedList.length - refs.length; i++) {
		const index = refs.length + i
		const list = sortedList[index]!
		const itemLength = list.items.length
		_ref_lists.append(CList.create({List: {
			tagname: 'li',
			variant: CList.Variant.Tonal,
			children: [list.name],
			subtitle: [[itemLength, 'item' + (itemLength > 1? 's' : '')].join(' ')],
			leading: [CIcon.create({Icon: {
				code: IconCodes.TextBulletListLtrFilled,
				refs: {icon(ref) {
					ref.style.setProperty('color', `rgb(${AppCSSColors.Accent})`)
				}}
			}})],
			trailing: [
				CButton.CIcon.create({IconButton: {
					Icon: {code: IconCodes.Edit},
					refs: {button(ref) {
						ref.setAttribute('aria-label', 'Edit')
						ref.setAttribute('data-tooltip', 'Edit')
						ref.setAttribute('data-command', Commands.EditList)
					}}
				}}),
				CButton.CIcon.create({
					Button: {disabled: sortedList.length <= 1},
					IconButton: {
						Icon: {code: IconCodes.Delete},
						refs: {button(ref) {
							ref.setAttribute('aria-label', 'Delete')
							ref.setAttribute('data-tooltip', 'Delete')
							ref.setAttribute('data-command', Commands.DeleteList)
						}}
					}
				}),
			],
			refs: {
				list(ref) {
					ref.style.setProperty('padding-right', pxToRem(4) + 'rem')
					ref.setAttribute('data-list-id', list.id.toString())
					ref.classList.add(CSSClasses.listItem!)
				},
				trailing(ref) {
					ref.style.setProperty('display', 'flex')
					ref.style.setProperty('align-items', 'center')
					ref.style.setProperty('gap', pxToRem(1) + 'rem')
				}
			}
		}}))
	}

	for (const ref of [
		_ref_selectionList,
		_ref_teamsNames,
		_ref_teamsMembers,
		_ref_wordsList,
	]) {
		const refs = $$$<CComboBox.COption.CElement>('option', ref)
		for (let i = 0; i < refs.length; i++) {
			const ref = refs[i]!
			if (i >= sortedList.length) {
				ref.remove()
				continue
			}

			const list = sortedList[i]!
			ref.value = list.id.toString()
			ref.textContent = [list.name, `(${list.items.length})`].join(' ')
		}

		for (let i = 0; i < sortedList.length - refs.length; i++) {
			const index = refs.length + i
			const list = sortedList[index]!
			const opt = CComboBox.COption.create({Option: {
				children: [list.name + ` (${list.items.length})`]
			}})
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
	_ref_listBtn.addEventListener('click', () => {
		_ref_settingsMenu.hidePopover()
		_ref_listDialog.showModal()
	})

	_ref_lists.addEventListener('click', () => {
		const ref = document.activeElement as CButton.CElement
		if (!isTargetValidElement(_ref_lists, ref)) {return}

		const command = ref.dataset.command as Commands
		const getListId = () => {
			const li = ref.closest('[data-list-id]') as HTMLLIElement
			if (!li) {return}

			const listId = li.dataset.listId
			if (!listId) {return}

			return Number.parseInt(listId)
		}

		switch (command) {
		case Commands.EditList: {
			const id = getListId()
			if (typeof id !== 'number') {return}

			const lists = ListsStore.value.list
			const index = lists.findIndex(v => v.id === id)
			const list = lists[index]
			if (!list) {return}

			_listIndexToEdit = index
			_listEditMode = true
			CDialog.update(_ref_newDialog, {Dialog: {header: ['Edit list']}})
			_ref_listNameInput.value = list.name
			_ref_listItemsInput.value = list.items.join('; ')
			_ref_listDialog.close()
			_ref_newDialog.showModal()
			break
		}
		case Commands.DeleteList: {
			const id = getListId()
			if (typeof id !== 'number') {return}

			const lists = ListsStore.value.list
			const index = lists.findIndex(v => v.id === id)
			if (index < 0) {return}

			const list = lists[index]!
			const itemLength = list.items.length
			_listIndexToRemove = index
			CList.update(_ref_deleteItem, {List: {
				children: [list.name],
				subtitle: [[itemLength, 'item' + (itemLength > 1? 's' : '')].join(' ')]
			}})
			_ref_listDialog.close()
			_ref_deleteDialog.showModal()
			break
		}}
	})

	_ref_newListBtn.addEventListener('click', () => {
		CDialog.update(_ref_newDialog, {Dialog: {header: ['New list']}})
		_ref_listNameInput.value = ''
		_ref_listItemsInput.value = ''
		_ref_listDialog.close()
		_ref_newDialog.showModal()
		_listEditMode = false
	})

	_ref_newDialog.addEventListener('close', () => {
		_ref_listDialog.showModal()
	})

	_ref_deleteDialog.addEventListener('close', () => {
		_ref_listDialog.showModal()
	})

	_ref_deleteBtn.addEventListener('click', () => {
		_deleteList(_listIndexToRemove)
	})

	_ref_listNameInput.addEventListener('input', () => {
		_ref_listNameInput.setCustomValidity('')
		_ref_listNameInput.reportValidity()
	})

	_ref_listItemsInput.addEventListener('input', () => {
		_ref_listItemsInput.setCustomValidity('')
		_ref_listItemsInput.reportValidity()
	})

	_ref_listSave.addEventListener('click', (ev) => {
		const report = (el: HTMLInputElement | HTMLTextAreaElement, msg: string) => {
			el.setCustomValidity(msg)
			el.reportValidity()
		}

		let name = _ref_listNameInput.value.trim()
		let members: string[] = (_ref_listItemsInput
			.value
			.split(/[\t\n;]/g)
			.map(v => v.trim())
			.filter(v => v.length > 0)
			.sort((a, b) => a.localeCompare(b))
		)

		if (name.length <= 0) {
			report(_ref_listNameInput, 'List name must not empty')
			return ev.preventDefault()
		}

		if (members.length <= 1) {
			report(_ref_listItemsInput, 'Must have at least 2 items')
			_ref_listItemsInput.reportValidity()
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