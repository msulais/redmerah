import { ObservableStore } from "@/utils/store"
import { Pages } from "../_shared/_enums"
import { ElementIds } from "../_shared/_ids"
import { $, $$, $$$ } from "./_dom-utils"
import { isValidEnumValue } from "@/utils/object"
import { DrawerClasses, updateDrawerButtonRef } from "@/components/Drawer"
import { SideBarAttributes, SideBarClasses, updateSideBarButtonRef, updateSideBarRef } from "@/components/SideBar2"
import { CSSClasses } from "../../_styles/_css"
import { ButtonVariant, type IconButtonElement } from "@/components/Button"
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

const _minimizeBtnRef = $(ElementIds.nav_minimizeBtn) as IconButtonElement
const _sideBarRef = $(ElementIds.nav_sideBar)
const _drawerRef = $(ElementIds.nav_drawer)

function _subscribePageChanges(v: NavigationStoreType, o: NavigationStoreType): void {
	const page = v.page
	if (page === o.page) return

	saveStorageItem('page', page)
}

function _subscribePageRefView(v: NavigationStoreType, o: NavigationStoreType): void {
	const page = v.page
	if (page === o.page) return

	const selectedPanelRef = $$<HTMLDivElement>(`.${CSSClasses.bodyPage}[role=tabpanel]:not([hidden])`)
	const selectedTabRefs = $$$<HTMLButtonElement>(`:is(.${SideBarClasses.button},.${DrawerClasses.button})[aria-selected=true]`)
	const targetTabRefs = $$$<HTMLButtonElement>(`:is(.${SideBarClasses.button},.${DrawerClasses.button})[data-page="${page}"]`)

	const panelId = targetTabRefs[0]?.getAttribute('aria-controls')
	if (!panelId) return

	const targetPanelRef = $(panelId)
	if (!targetPanelRef) return

	targetPanelRef.hidden = false
	if (selectedPanelRef) {
		selectedPanelRef.hidden = true
	}

	for (const tab of targetTabRefs) {
		const classList = tab.classList
		tab.setAttribute('aria-selected', 'true')
		if (classList.contains(SideBarClasses.button)) {
			updateSideBarButtonRef(tab, {
				ButtonVariant: ButtonVariant.tonal,
				SideBarButtonSelected: true
			})
		}
		else if (classList.contains(DrawerClasses.button)) {
			updateDrawerButtonRef(tab, {
				ButtonVariant: ButtonVariant.tonal,
				DrawerButtonSelected: true
			})
		}
	}

	for (const tab of selectedTabRefs) {
		const classList = tab.classList
		tab.setAttribute('aria-selected', 'false')
		if (classList.contains(SideBarClasses.button)) {
			updateSideBarButtonRef(tab, {
				ButtonVariant: ButtonVariant.transparent,
				SideBarButtonSelected: false
			})
		}
		else if (classList.contains(DrawerClasses.button)) {
			updateDrawerButtonRef(tab, {
				ButtonVariant: ButtonVariant.transparent,
				DrawerButtonSelected: false
			})
		}
	}

	if (!isAnimationAllowed()) return

	targetPanelRef.animate({
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

	_minimizeBtnRef?.addEventListener('click', () => {
		if (!_sideBarRef) {return}

		const isMinimized = _sideBarRef.hasAttribute(SideBarAttributes.minimized)
		_minimizeBtnRef.setAttribute('data-tooltip',
			isMinimized? 'Minimize side bar' : 'Maximize side bar'
		)

		updateSideBarRef(_sideBarRef, {
			SideBarMinimized: !isMinimized
		})
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}