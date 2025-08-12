import { ObservableStore } from "@/utils/store"
import { Pages } from "../_shared/_enums"
import { ElementIds } from "../_shared/_ids"
import { $, $$, $$$ } from "./_dom-utils"
import { isValidEnumValue } from "@/utils/object"
import { DrawerClasses, updateDrawerButtonRef } from "@/components/Drawer"
import { SideBarClasses, updateSideBarButtonRef } from "@/components/SideBar"
import { CSSClasses } from "../../_styles/_css"
import { ButtonVariant } from "@/components/Button"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEasing } from "@/enums/animation"
import { DEFAULT_PAGE, HIDE_NAVIGATION } from "../_shared/_constant"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

export type NavigationStoreType = Readonly<{
	page: Pages
}>

export const NavigationStore = new ObservableStore<NavigationStoreType>({
	page: DEFAULT_PAGE
})

const _sideBarRef = $(ElementIds.nav_sideBar)
const _drawerRef = $(ElementIds.nav_drawer)

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

	if (!isAnimationAllowed()) {return}

	const optionsRef = $$<HTMLElement>('.' + CSSClasses.bodyOptions, targetPanelRef)
	const resultRef = $$<HTMLElement>('.' + CSSClasses.bodyResult, targetPanelRef)
	const animationOptions = {
		duration: 500,
		easing: AnimationEasing.spring
	}
	const isHideNavigation = window.matchMedia(`(max-width:${HIDE_NAVIGATION}rem)`).matches
	optionsRef?.animate({
		opacity: [0, 1],
		scale: [isHideNavigation? 0.9 : 1, 1],
		translate: [isHideNavigation? '0 0' : `${pxToRem(-32)}rem 0`, '0 0'],
	}, animationOptions)
	resultRef?.animate({
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

export default () => {
	_initEvents()
	_initSubscriber()
}