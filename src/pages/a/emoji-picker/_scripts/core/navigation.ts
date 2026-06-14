import { ObservableStore } from "@/utils/signal"
import { Pages } from "../shared/enums"
import { ElementIds } from "../shared/ids"
import { $ } from "./dom-utils"
import { isValidEnumValue } from "@/utils/object"
import { CDrawer } from "@/components/Drawer"
import { CSideBar } from "@/components/SideBar"
import { updateEmojiList } from "./body"
import { saveStorageItem } from "./database"
import { DEFAULT_PAGE } from "../shared/constant"
import type { CButton } from "@/components/Button"

export type NavigationStoreType = Readonly<{
	page: Pages
}>

export const NavigationStore = new ObservableStore<NavigationStoreType>({
	page: DEFAULT_PAGE
})

const _ref_minimizeBtn = $(ElementIds.nav_minimizeBtn) as CButton.CIcon.CElement
const _ref_sideBar = $(ElementIds.navigationSideBar) as HTMLDivElement
const _ref_drawerBtn = $(ElementIds.navigationDrawer)

function _initEvents(): void {
	_ref_drawerBtn?.addEventListener('click', (ev) => {
		const ref_target = (ev.target as HTMLElement).closest<CSideBar.CButton.CElement>(`.${CDrawer.Classes.Button}[data-page]`)
		if (!ref_target) return

		const page = ref_target.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		_ref_drawerBtn.hidePopover()
		NavigationStore.update(v => v.page = page as Pages)
	})

	_ref_sideBar?.addEventListener('click', (ev) => {
		const ref_target = (ev.target as HTMLElement).closest<CSideBar.CButton.CElement>(`.${CSideBar.Classes.Button}[data-page]`)
		if (!ref_target) return

		const page = ref_target.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		NavigationStore.update(v => v.page = page as Pages)
	})

	_ref_minimizeBtn?.addEventListener('click', () => {
		if (!_ref_sideBar) {return}

		const isMinimized = _ref_sideBar.hasAttribute(CSideBar.Attributes.Minimized)
		_ref_minimizeBtn.setAttribute('data-tooltip',
			isMinimized? 'Minimize side bar' : 'Maximize side bar'
		)

		CSideBar.update(_ref_sideBar, {
			SideBar: {minimized: !isMinimized}
		})
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