import { ObservableStore } from "@/utils/signal"
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
import { DEFAULT_PAGE, CSS_HIDE_NAVIGATION } from "../_shared/_constant"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

export type NavigationStoreType = Readonly<{
	page: Pages
}>

export const NavigationStore = new ObservableStore<NavigationStoreType>({
	page: DEFAULT_PAGE
})

const _ref_minimizeBtn = $(ElementIds.nav_minimizeBtn) as CButton.CIcon.CElement
const _ref_sideBar = $(ElementIds.nav_sideBar) as CSideBar.CElement
const _ref_drawerBtn = $(ElementIds.nav_drawer)

function _subscribePageRefView(v: NavigationStoreType, o: NavigationStoreType): void {
	const page = v.page
	if (page === o.page) return

	const ref_selectedPanel = $$<HTMLDivElement>(`.${CSSClasses.bodyPage}[role=tabpanel]:not([hidden])`)
	const refs_selectedTab = $$$<CButton.CElement>(`:is(.${CSideBar.Classes.Button},.${CDrawer.Classes.Button})[aria-selected=true]`)
	const refs_targetTab = $$$<CButton.CElement>(`:is(.${CSideBar.Classes.Button},.${CDrawer.Classes.Button})[data-page="${page}"]`)

	const panelId = refs_targetTab[0]?.getAttribute('aria-controls')
	if (!panelId) return

	const ref_targetPanel = $(panelId)
	if (!ref_targetPanel) return

	ref_targetPanel.hidden = false
	if (ref_selectedPanel) {
		ref_selectedPanel.hidden = true
	}

	for (const tab of refs_targetTab) {
		const classList = tab.classList
		tab.setAttribute('aria-selected', 'true')
		if (classList.contains(CSideBar.Classes.Button)) {
			CSideBar.CButton.update(tab, {
				Button: {variant: CButton.Variant.Tonal},
				SideBarButton: {selected: true}
			})
		}
		else if (classList.contains(CDrawer.Classes.Button)) {
			CDrawer.CButton.update(tab, {
				Button: {variant: CButton.Variant.Tonal},
				DrawerButton: {selected: true}
			})
		}
	}

	for (const tab of refs_selectedTab) {
		const classList = tab.classList
		tab.setAttribute('aria-selected', 'false')
		if (classList.contains(CSideBar.Classes.Button)) {
			CSideBar.CButton.update(tab, {
				Button: {variant: CButton.Variant.Transparent},
				SideBarButton: {selected: false}
			})
		}
		else if (classList.contains(CDrawer.Classes.Button)) {
			CDrawer.CButton.update(tab, {
				Button: {variant: CButton.Variant.Transparent},
				DrawerButton: {selected: false}
			})
		}
	}

	if (!isAnimationAllowed()) {return}

	const ref_options = $$<HTMLElement>('.' + CSSClasses.bodyOptions, ref_targetPanel)
	const ref_result = $$<HTMLElement>('.' + CSSClasses.bodyResult, ref_targetPanel)
	const animationOptions = {
		duration: 500,
		easing: AnimationEasing.Spring
	}
	const isHideNavigation = window.matchMedia(`(max-width:${CSS_HIDE_NAVIGATION}rem)`).matches
	ref_options?.animate({
		opacity: [0, 1],
		scale: [isHideNavigation? 0.9 : 1, 1],
		translate: [isHideNavigation? '0 0' : `${pxToRem(-32)}rem 0`, '0 0'],
	}, animationOptions)
	ref_result?.animate({
		scale: [.9, 1],
		opacity: [0, 1]
	}, animationOptions)
}

function _subsStorage(v: NavigationStoreType, o: NavigationStoreType): void {
	const page = v.page
	if (page === o.page) {return}

	saveStorageItem('page', page)
}

function _initSubscriber(): void {
	NavigationStore.subscribe(_subscribePageRefView)
	NavigationStore.subscribe(_subsStorage)
}

function _initEvents(): void {
	_ref_drawerBtn?.addEventListener('click', (ev) => {
		const ref_target = (ev.target as HTMLElement).closest<CButton.CElement>(`.${CDrawer.Classes.Button}[data-page]`)
		if (!ref_target) return

		const page = ref_target.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		_ref_drawerBtn.hidePopover()
		NavigationStore.update(v => v.page = page as Pages)
	})

	_ref_sideBar?.addEventListener('click', (ev) => {
		const ref_target = (ev.target as HTMLElement).closest<CButton.CElement>(`.${CSideBar.Classes.Button}[data-page]`)
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

export default () => {
	_initEvents()
	_initSubscriber()
}