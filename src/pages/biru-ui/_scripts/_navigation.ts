import { SideNavigationClasses, updateSideNavigationButton } from "@/native-components/SideNavigation"
import { ELEMENT_ID_PREFIX, ElementIds } from "./_enums"
import { ButtonVariant } from "@/native-components/Button"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"

const $ = (id: string) => document.getElementById(id)
const navigation = $(ELEMENT_ID_PREFIX + ElementIds.navigation)

function initNavigationEvents(): void {
	navigation?.addEventListener('click', () => {
		const tab = document.activeElement
		if (
			!tab
			|| !tab.classList.contains(SideNavigationClasses.button)
			|| tab.getAttribute('aria-selected') === 'true'
		) return

		const prevTab = navigation.querySelector(`.${SideNavigationClasses.button}[aria-selected=true]`)
		if (prevTab) {
			prevTab.setAttribute('aria-selected', 'false')
			updateSideNavigationButton(prevTab as HTMLButtonElement, {
				variant: false,
				selected: false
			})
			const prevAriaControls = prevTab.getAttribute('aria-controls')
			if (prevAriaControls) $(prevAriaControls)?.toggleAttribute('hidden', true)
		}

		tab.setAttribute('aria-selected', 'true')
		updateSideNavigationButton(tab as HTMLButtonElement, {
			variant: ButtonVariant.tonal,
			selected: true
		})
		const ariaControls = tab.getAttribute('aria-controls')
		if (ariaControls) {
			const tabPanel = $(ariaControls)
			tabPanel?.toggleAttribute('hidden', false)

			if (isAnimationAllowed()) {
				tabPanel?.animate({
					opacity: [0, 1],
					transform: ['translateY(64px)', 'translateY(0)']
				}, {
					duration: 300,
					easing: AnimationEffectTiming.spring
				})
			}
		}
	})
}

function _(): void {
	initNavigationEvents()
}

export default _