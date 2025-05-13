import { SideBarClasses, updateSideBarButtonRef } from "@/native-components/SideBar"
import { ElementIds } from "./_enums"
import { ButtonVariant } from "@/native-components/Button"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"
import { elementValidTarget } from "@/utils/element"
import { closeDrawerRef, DrawerClasses, updateDrawerButtonRef } from "@/native-components/Drawer"
import { CSSClasses } from "../_styles/_css"

const $ = (id: string) => document.getElementById(id)

function _initNavigationEvents(): void {
	const navigationRef = $(ElementIds.navigationSideBar)
	const drawerRef = $(ElementIds.navigationDrawer)

	function onClick(parentRef: HTMLElement): void {
		const tab = document.activeElement as HTMLButtonElement
		if (!elementValidTarget(
			parentRef, tab,
			(el) => {
				const classList = el.classList
				return classList.contains(DrawerClasses.button) || classList.contains(SideBarClasses.button)
			}
		)) return

		if (tab.getAttribute('aria-selected') === 'true') {
			if (parentRef.classList.contains(DrawerClasses.drawer)) closeDrawerRef(parentRef as HTMLDivElement)
			return
		}

		const panelId = tab.getAttribute('aria-controls')
		if (!panelId) return

		const targetPanel = $(panelId)
		if (!targetPanel) return

		const selectedPanel = document.querySelector<HTMLDivElement>(`:is(.${CSSClasses.bodyPage},.${CSSClasses.bodyPageDate})[role=tabpanel]:not([hidden])`)
		const selectedTabs = document.querySelectorAll<HTMLButtonElement>(`:is(.${SideBarClasses.button},.${DrawerClasses.button})[aria-selected=true]`)
		const targetTabs = document.querySelectorAll<HTMLButtonElement>(`:is(.${SideBarClasses.button},.${DrawerClasses.button})[aria-controls="${panelId}"]`)

		targetPanel.hidden = false
		if (selectedPanel) {
			selectedPanel.hidden = true
		}
		if (parentRef.classList.contains(DrawerClasses.drawer)) {
			closeDrawerRef(parentRef as HTMLDivElement)
		}

		for (const tab of targetTabs) {
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

		for (const tab of selectedTabs) {
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

		targetPanel.animate({
			transform: ['scale(.9)', 'scale(1)'],
			opacity: [0, 1]
		}, {
			duration: 500,
			easing: AnimationEffectTiming.spring
		})
	}

	drawerRef?.addEventListener('click', () => onClick(drawerRef))
	navigationRef?.addEventListener('click', () => onClick(navigationRef))
}

export default function _(): void {
	_initNavigationEvents()
}