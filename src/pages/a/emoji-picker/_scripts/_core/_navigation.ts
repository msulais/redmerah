import { ObservableStore } from "@/utils/store"
import { Pages } from "../_shared/_enums"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { isValidEnumValue } from "@/utils/object"
import { CDrawer } from "@/components/Drawer"
import { CSideBar } from "@/components/SideBar"
import { updateEmojiList } from "./_body"
import { saveStorageItem } from "./_database"
import { DEFAULT_PAGE } from "../_shared/_constant"

export type NavigationStoreType = Readonly<{
	page: Pages
}>

export const NavigationStore = new ObservableStore<NavigationStoreType>({
	page: DEFAULT_PAGE
})

const _ref_sideBar = $(ElementIds.navigationSideBar)
const _ref_drawerBtn = $(ElementIds.navigationDrawer)

function _initEvents(): void {
	_ref_drawerBtn?.addEventListener('click', (ev) => {
		const ref_target = (ev.target as HTMLElement).closest<CSideBar.CButton.CElement>(`.${CDrawer.Classes.button}[data-page]`)
		if (!ref_target) return

		const page = ref_target.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		_ref_drawerBtn.hidePopover()
		NavigationStore.update(v => v.page = page as Pages)
	})

	_ref_sideBar?.addEventListener('click', (ev) => {
		const ref_target = (ev.target as HTMLElement).closest<CSideBar.CButton.CElement>(`.${CSideBar.Classes.button}[data-page]`)
		if (!ref_target) return

		const page = ref_target.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		NavigationStore.update(v => v.page = page as Pages)
	})
}

function _subscribePageChanges(v: NavigationStoreType, o: NavigationStoreType): void {
	const page = v.page
	if (page === o.page) return

	saveStorageItem('page', page)
}

function _subscribePageRefView(v: NavigationStoreType, o: NavigationStoreType): void {
	const page = v.page
	if (page === o.page) return

	updateEmojiList(page)
}

function _initSubscriber(): void {
	NavigationStore.subscribe(_subscribePageChanges)
	NavigationStore.subscribe(_subscribePageRefView)
}

export default () => {
	_initEvents()
	_initSubscriber()
}