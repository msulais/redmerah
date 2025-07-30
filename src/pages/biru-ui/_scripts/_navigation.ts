import { SideBarClasses, updateSideBarButtonRef } from "@/components/SideBar"
import { ElementIds } from "./_enums"
import { ButtonVariant } from "@/components/Button"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"
import { isTargetValidElement } from "@/utils/element"
import { closeDrawerRef, DrawerClasses, updateDrawerButtonRef } from "@/components/Drawer"
import CSS from '../_index.module.scss'
import { pxToRem } from "@/utils/css"

const $ = (id: string) => document.getElementById(id)

function initNavigationEvents(): void {
	const navigation = $(ElementIds.navigationSideBar)
	const drawer = $(ElementIds.navigationDrawer)

	function onClick(parent: HTMLElement): void {
		const tab = document.activeElement as HTMLButtonElement
		if (!isTargetValidElement(
			parent, tab,
			(el) => {
				const classList = el.classList
				return classList.contains(DrawerClasses.button) || classList.contains(SideBarClasses.button)
			}
		)) return

		if (tab.getAttribute('aria-selected') === 'true') {
			if (parent.classList.contains(DrawerClasses.drawer)) closeDrawerRef(parent as HTMLDivElement)
			return
		}

		const panelId = tab.getAttribute('aria-controls')
		if (!panelId) return

		const targetPanel = $(panelId)
		if (!targetPanel) return

		const selectedPanel = document.querySelector<HTMLDivElement>(`.${CSS.bodyPage}[role=tabpanel]:not([hidden])`)
		const selectedTabs = document.querySelectorAll<HTMLButtonElement>(`:is(.${SideBarClasses.button},.${DrawerClasses.button})[aria-selected=true]`)
		const targetTabs = document.querySelectorAll<HTMLButtonElement>(`:is(.${SideBarClasses.button},.${DrawerClasses.button})[aria-controls="${panelId}"]`)

		targetPanel.hidden = false
		if (selectedPanel) {
			selectedPanel.hidden = true
		}
		if (parent.classList.contains(DrawerClasses.drawer)) {
			closeDrawerRef(parent as HTMLDivElement)
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
			transform: [`translateY(${pxToRem(64)}rem)`, 'translateY(0)'],
			opacity: [0, 1]
		}, {
			duration: 500,
			easing: AnimationEffectTiming.spring
		})
	}

	drawer?.addEventListener('click', () => onClick(drawer))
	navigation?.addEventListener('click', () => onClick(navigation))
}

export default () => {
	initNavigationEvents()
}