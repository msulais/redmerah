import { ObservableStore } from "@/utils/signal"
import { Pages } from "../shared/enums"
import { ElementIds } from "../shared/ids"
import { $, $$, $$$ } from "./dom-utils"
import { isValidEnumValue } from "@/utils/object"
import { CDrawer } from "@/components/Drawer"
import { CSideBar } from "@/components/SideBar"
import { CSSClasses } from "../../_styles/classes"
import { CButton } from "@/components/Button"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEasing } from "@/enums/animation"
import { saveStorageItem } from "./database"
import { AppCSSColors, AppCSSOpacity } from "@/enums/app-data"
import { DEFAULT_PAGE } from "../shared/constant"
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

function _subsPageChanges(v: NavigationStoreType, o: NavigationStoreType): void {
	const page = v.page
	if (page === o.page) return

	saveStorageItem('page', page)
}

function _subsPageView(v: NavigationStoreType, o: NavigationStoreType): void {
	const page = v.page
	if (page === o.page) return

	const ref_selectedPanel = $$<HTMLDivElement>(`:is(.${CSSClasses.bd_page},.${CSSClasses.bdPage_date})[role=tabpanel]:not([hidden])`)
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

	if (!isAnimationAllowed()) return

	const borderColor = `rgba(${AppCSSColors.OnSurface},${AppCSSOpacity.O3})`
	ref_targetPanel.animate({
		transform: ['scale(.9)', 'scale(1)'],
		borderRadius: ['var(--g-border-radius8)', 'var(--g-border-radius8)'],
		borderRightColor: page === Pages.Date
			? [borderColor, borderColor]
			: [],
		borderBottomColor: page === Pages.Date
			? [borderColor, borderColor]
			: [],
		opacity: [0, 1]
	}, {
		duration: 500,
		easing: AnimationEasing.Spring
	})
}

function _initSubscriber(): void {
	NavigationStore.subscribe(_subsPageChanges)
	NavigationStore.subscribe(_subsPageView)
}

function _initEvents(): void {
	_ref_sideBar?.addEventListener('click', (ev) => {
		const ref_target = (ev.target as HTMLElement).closest<CButton.CElement>(`.${CSideBar.Classes.Button}[data-page]`)
		if (!ref_target) return

		const page = ref_target.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		NavigationStore.update(v => v.page = page as Pages)
	})

	_ref_drawerBtn?.addEventListener('click', (ev) => {
		const ref_target = (ev.target as HTMLElement).closest<CButton.CElement>(`.${CDrawer.Classes.Button}[data-page]`)
		if (!ref_target) return

		const page = ref_target.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		_ref_drawerBtn.hidePopover()
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