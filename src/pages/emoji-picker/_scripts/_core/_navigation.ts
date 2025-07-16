import { ObservableStore } from "@/utils/store"
import { Pages } from "../_shared/_enums"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { isValidEnumValue } from "@/utils/object"
import { DrawerClasses } from "@/components/Drawer"
import { SideBarClasses } from "@/components/SideBar"
import { updateEmojiList } from "./_body"
import { saveStorageItem } from "./_database"
import { DEFAULT_PAGE } from "../_shared/_constant"

export type NavigationStoreType = Readonly<{
	page: Pages
}>

export const NavigationStore = new ObservableStore<NavigationStoreType>({
	page: DEFAULT_PAGE
})

const _sideBarRef = $(ElementIds.navigationSideBar)
const _drawerRef = $(ElementIds.navigationDrawer)

function _initEvents(): void {
	_drawerRef?.addEventListener('click', (ev) => {
		const targetRef = (ev.target as HTMLElement).closest<HTMLButtonElement>(`.${DrawerClasses.button}[data-page]`)
		if (!targetRef) return

		const page = targetRef.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		_drawerRef.hidePopover()
		NavigationStore.update(v => v.page = page as Pages)
	})

	_sideBarRef?.addEventListener('click', (ev) => {
		const targetRef = (ev.target as HTMLElement).closest<HTMLButtonElement>(`.${SideBarClasses.button}[data-page]`)
		if (!targetRef) return

		const page = targetRef.dataset.page
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