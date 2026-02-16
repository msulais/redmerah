import { ObservableStore } from "@/utils/store"
import { Pages } from "../_shared/_enums"
import { ElementIds } from "../_shared/_ids"
import { $, $$, $$$ } from "./_dom-utils"
import { isValidEnumValue } from "@/utils/object"
import { CDrawer } from "@/components/Drawer"
import { CSideBar } from "@/components/SideBar"
import { CSSClasses } from "../../_styles/_css"
import { CButton } from "@/components/Button"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEasing } from "@/enums/animation"
import { saveStorageItem } from "./_database"
import { DEFAULT_PAGE } from "../_shared/_constant"

export type NavigationStoreType = Readonly<{
	page: Pages
}>

export const NavigationStore = new ObservableStore<NavigationStoreType>({
	page: DEFAULT_PAGE
})

const _ref_minimizeBtn = $(ElementIds.nav_minimizeBtn) as CButton.CIcon.CElement
const _ref_sideBar = $(ElementIds.nav_sideBar) as CSideBar.CElement
const _ref_drawerBtn = $(ElementIds.nav_drawer)

function _subscribePageChanges(v: NavigationStoreType, o: NavigationStoreType): void {
	const page = v.page
	if (page === o.page) return

	saveStorageItem('page', page)
}

function _subscribePageRefView(v: NavigationStoreType, o: NavigationStoreType): void {
	const page = v.page
	if (page === o.page) return

	const ref_selectedPanel = $$<HTMLDivElement>(`.${CSSClasses.bodyPage}[role=tabpanel]:not([hidden])`)
	const refs_selectedTab = $$$<CButton.CElement>(`:is(.${CSideBar.Classes.button},.${CDrawer.Classes.button})[aria-selected=true]`)
	const refs_targetTab = $$$<CButton.CElement>(`:is(.${CSideBar.Classes.button},.${CDrawer.Classes.button})[data-page="${page}"]`)

	const panelId = refs_targetTab[0]?.getAttribute('aria-controls')
	if (!panelId) return

	const ref_targetPanel = $(panelId)
	if (!ref_targetPanel) return

	ref_targetPanel.hidden = false
	if (ref_selectedPanel) {
		ref_selectedPanel.hidden = true
	}

	for (const ref of refs_targetTab) {
		const classList = ref.classList
		ref.setAttribute('aria-selected', 'true')
		if (classList.contains(CSideBar.Classes.button)) {
			CSideBar.CButton.update(ref, {
				Button: {variant: CButton.Variant.tonal},
				SideBarButton: {selected: true}
			})
		}
		else if (classList.contains(CDrawer.Classes.button)) {
			CDrawer.CButton.update(ref, {
				Button: {variant: CButton.Variant.tonal},
				DrawerButton: {selected: true}
			})
		}
	}

	for (const tab of refs_selectedTab) {
		const classList = tab.classList
		tab.setAttribute('aria-selected', 'false')
		if (classList.contains(CSideBar.Classes.button)) {
			CSideBar.CButton.update(tab, {
				Button: {variant: CButton.Variant.transparent},
				SideBarButton: {selected: false}
			})
		}
		else if (classList.contains(CDrawer.Classes.button)) {
			CDrawer.CButton.update(tab, {
				Button: {variant: CButton.Variant.transparent},
				DrawerButton: {selected: false}
			})
		}
	}

	if (!isAnimationAllowed()) return

	ref_targetPanel.animate({
		scale: [.9, 1],
		opacity: [0, 1]
	}, {
		duration: 500,
		easing: AnimationEasing.spring
	})
}

function _initSubscriber(): void {
	NavigationStore.subscribe(_subscribePageChanges)
	NavigationStore.subscribe(_subscribePageRefView)
}

function _initEvents(): void {
	_ref_drawerBtn?.addEventListener('click', (ev) => {
		const ref_target = (ev.target as HTMLElement).closest<CButton.CElement>(`.${CDrawer.Classes.button}[data-page]`)
		if (!ref_target) return

		const page = ref_target.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		_ref_drawerBtn.hidePopover()
		NavigationStore.update(v => v.page = page as Pages)
	})

	_ref_sideBar?.addEventListener('click', (ev) => {
		const ref_target = (ev.target as HTMLElement).closest<CButton.CElement>(`.${CSideBar.Classes.button}[data-page]`)
		if (!ref_target) return

		const page = ref_target.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		NavigationStore.update(v => v.page = page as Pages)
	})

	_ref_minimizeBtn?.addEventListener('click', () => {
		if (!_ref_sideBar) {return}

		const isMinimized = _ref_sideBar.hasAttribute(CSideBar.Attributes.minimized)
		_ref_minimizeBtn.setAttribute('data-tooltip',
			isMinimized? 'Minimize side bar' : 'Maximize side bar'
		)

		CSideBar.update(_ref_sideBar, {
			SideBar: {minimized: !isMinimized}
		})
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}