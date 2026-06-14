import { ObservableStore } from "@/utils/signal"
import { DEFAULT_TEAMS_COUNT, DEFAULT_TEAMS_MEMBERS_ID, DEFAULT_TEAMS_NAMES_ID, DEFAULT_TEAMS_OUTPUT } from "../_shared/_constant"
import { ElementIds } from "../_shared/_ids"
import { $, $$, $$$ } from "../_core/_dom-utils"
import { CComboBox } from "@/components/ComboBox"
import { safeNumber } from "@/utils/number"
import { Math_clamp } from "@/utils/math"
import { ListsStore } from "../_core/_lists"
import { shuffleArray } from "@/utils/array"
import { saveStorageItem } from "../_core/_database"

export type TeamsStoreType = Readonly<{
	namesId: number
	membersId: number
	count: number
	output: string[][]
}>

export const TeamsStore = new ObservableStore<TeamsStoreType>({
	count: DEFAULT_TEAMS_COUNT,
	membersId: DEFAULT_TEAMS_MEMBERS_ID,
	namesId: DEFAULT_TEAMS_NAMES_ID,
	output: DEFAULT_TEAMS_OUTPUT
})
const _ref_names = $(ElementIds.pgTm_names) as CComboBox.CElement
const _ref_members = $(ElementIds.pgTm_members) as CComboBox.CElement
const _ref_count = $(ElementIds.pgTm_count) as HTMLInputElement
const _ref_output = $(ElementIds.pgTm_output) as HTMLUListElement
let _time_storage: NodeJS.Timeout | number | undefined

export function updateOutput(): void {
	const lists = ListsStore.value.list
	const store = TeamsStore.value
	const names = lists.find(v => v.id === store.namesId)
	const members = lists.find(v => v.id === store.membersId)
	if (!names || !members) {return}

	let nameItems = shuffleArray([...names.items])
	const memberItems = [...members.items]
	const count = Math.min(store.count, memberItems.length)
	while (nameItems.length < count) {
		nameItems.push(['Team', nameItems.length + 1].join(' '))
	}

	if (nameItems.length > count) {
		nameItems = nameItems.slice(0, count)
	}

	nameItems.sort((a, b) => a.localeCompare(b))

	const output: string[][] = nameItems.map(v => [v])
	let j = 0
	let size = memberItems.length
	for (let i = 0; i < memberItems.length; i++) {
		if (j >= output.length) {
			j = 0
		}

		const i = Math.floor(Math.random() * size)
		size--;
		[memberItems[i], memberItems[size]] = [memberItems[size], memberItems[i]];
		output[j].push(memberItems[size])
		++j
	}

	for (let i = 0; i < output.length; i++) {
		output[i] = [
			output[i][0],
			...output[i].slice(1).sort((a, b) => a.localeCompare(b))
		]
	}

	TeamsStore.update(v => v.output = output)
}

function _subsStorage(v: TeamsStoreType): void {
	clearTimeout(_time_storage)
	_time_storage = setTimeout(() => {
		saveStorageItem('teams:count', v.count)
		saveStorageItem('teams:members-id', v.membersId)
		saveStorageItem('teams:names-id', v.namesId)
		saveStorageItem('teams:output', v.output)
	}, 500)
}

function _subsOutputView(v: TeamsStoreType, o: TeamsStoreType): void {
	const output = v.output
	if (output === o.output) {return}

	const refs = $$$<HTMLLIElement>(`#${CSS.escape(ElementIds.pgTm_output)}>li`)
	const update_ref_li = (ref: HTMLLIElement, items: string[]) => {
		const ul = $$<HTMLUListElement>('ul', ref) ?? document.createElement('ul')
		const refs = $$$<HTMLLIElement>('li', ul)
		const teamName = items[0] ?? ''
		const members = items.slice(1)
		for (let i = 0; i < refs.length; i++) {
			const ref = refs[i]
			if (i >= members.length) {
				ref.remove()
				continue
			}

			ref.textContent = members[i] ?? ''
		}

		for (let i = 0; i < members.length - refs.length; i++) {
			const index = refs.length + i
			const ref = document.createElement('li')
			ref.textContent = members[index] ?? ''
			ul.append(ref)
		}

		ref.replaceChildren(teamName, ul)
	}

	for (let i = 0; i < refs.length; i++) {
		const ref = refs[i]
		if (i >= output.length) {
			ref.remove()
			continue
		}

		update_ref_li(ref, output[i])
	}

	for (let i = 0; i < output.length - refs.length; i++) {
		const index = refs.length + i
		const ref = document.createElement('li')
		update_ref_li(ref, output[index])
		_ref_output.append(ref)
	}
}

function _subsView(v: TeamsStoreType): void {
	const isActive = (el: Element) => el === document.activeElement
	if (!isActive(_ref_count)) {
		_ref_count.valueAsNumber = v.count
	}

	_ref_names.value = v.namesId.toString()
	_ref_members.value = v.membersId.toString()
}

function _initSubscriber(): void {
	TeamsStore.subscribe(_subsStorage)
	TeamsStore.subscribe(_subsOutputView)
	TeamsStore.subscribe(_subsView)
}

function _initEvents(): void {
	_ref_names.addEventListener('change', () => {
		const id = Number.parseInt(_ref_names.value)
		if (!ListsStore.value.list.some(v => v.id === id)) {return}

		TeamsStore.update(v => v.namesId = id)
	})

	_ref_members.addEventListener('change', () => {
		const id = Number.parseInt(_ref_members.value)
		const list = ListsStore.value.list
		if (!list.some(v => v.id === id)) {return}

		const items = list.find(v => v.id === id)!.items
		TeamsStore.update(v => {
			v.membersId = id
			v.count = Math_clamp(v.count, 1, items.length-1)
		})
	})

	_ref_count.addEventListener('focus', () => {
		const list = ListsStore.value.list.find(v => v.id === TeamsStore.value.membersId)
		if (!list) {return}

		_ref_count.max = list.items.length.toString()
	})

	_ref_count.addEventListener('input', () => {
		const value = Math_clamp(safeNumber(_ref_count.valueAsNumber), 1, Number.MAX_VALUE)
		TeamsStore.update(v => v.count = value)
	})

	_ref_count.addEventListener('blur', () => {
		_ref_count.valueAsNumber = TeamsStore.value.count
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}