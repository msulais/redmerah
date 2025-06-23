import { ObservableStore } from "@/utils/store"
import { Pages } from "../_shared/_enums"
import { ElementIds } from "../_shared/_ids"
import { $, $$, $$$ } from "./_dom-utils"
import { isValidEnumValue } from "@/utils/object"
import { DrawerClasses, updateDrawerButtonRef } from "@/native-components/Drawer"
import { SideBarClasses, updateSideBarButtonRef } from "@/native-components/SideBar"
import { CSSClasses } from "../../_styles/_css"
import { ButtonVariant } from "@/native-components/Button"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"
import { saveStorageItem } from "./_database"
import { AppCSSColors, AppCSSOpacity } from "@/enums/app-data"

export type NavigationStoreType = Readonly<{
	page: Pages
}>

export const NavigationStore = new ObservableStore<NavigationStoreType>({
	page: Pages.basic
})

const _sideBarRef = $(ElementIds.navigationSideBar)
const _drawerRef = $(ElementIds.navigationDrawer)

function _initDrawerEvents(): void {
	_drawerRef?.addEventListener('click', (ev) => {
		const targetRef = (ev.target as HTMLElement).closest<HTMLButtonElement>(`.${DrawerClasses.button}[data-page]`)
		if (!targetRef) return

		const page = targetRef.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		_drawerRef.hidePopover()
		NavigationStore.update(v => ({...v, page: page as Pages}))
	})
}

function _initSideBarEvents(): void {
	_sideBarRef?.addEventListener('click', (ev) => {
		const targetRef = (ev.target as HTMLElement).closest<HTMLButtonElement>(`.${SideBarClasses.button}[data-page]`)
		if (!targetRef) return

		const page = targetRef.dataset.page
		if (!isValidEnumValue(page, Pages)) return

		NavigationStore.update(v => ({...v, page: page as Pages}))
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

	const selectedPanelRef = $$<HTMLDivElement>(`:is(.${CSSClasses.bodyPage},.${CSSClasses.bodyPageDate})[role=tabpanel]:not([hidden])`)
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

	const borderColor = `rgba(${AppCSSColors.onSurface},${AppCSSOpacity.o3})`
	targetPanelRef.animate({
		transform: ['scale(.9)', 'scale(1)'],
		borderRadius: ['8px', '8px'],
		borderRightColor: page === Pages.date
			? [borderColor, borderColor]
			: [],
		borderBottomColor: page === Pages.date
			? [borderColor, borderColor]
			: [],
		opacity: [0, 1]
	}, {
		duration: 500,
		easing: AnimationEffectTiming.spring
	})
}

function _initSubscriber(): void {
	NavigationStore.subscribe(_subscribePageChanges)
	NavigationStore.subscribe(_subscribePageRefView)
}

export default () => {
	_initDrawerEvents()
	_initSideBarEvents()
	_initSubscriber()
}