import { AnimationEffectTiming } from "@/enums/animation"
import { BodyAttributes } from "@/enums/attributes"
import { GlobalElementIds } from "@/enums/ids"
import { isAnimationAllowed } from "@/utils/animation"
import { safeNumber } from "@/utils/number"

let COMPONENT_COUNT: number = 0
let COMPONENT_COUNT_MAX: number | null = null

export function removeSplashScreen(timeout: number = 0): void {
	setTimeout(() => {
		const splashRef = document.getElementById(GlobalElementIds.splash)
		if (!splashRef) return;

		const scrollY = window.scrollY // original scroll offset Y
		const animationOption = {duration: 500, easing: AnimationEffectTiming.spring}
		const body = document.body
		splashRef.remove()
		body.removeAttribute(BodyAttributes.componentCount)

		if (isAnimationAllowed()) {
			window.scrollTo({top: 0, behavior: 'instant'})
			body.style.setProperty('will-change', 'transform, opacity')
			body.style.setProperty('overflow', 'hidden')
			body.animate({
				transform: ['translateY(10vmin)', 'translateY(0)'],
				opacity: [0, 1],
			}, animationOption).finished.then(() => {
				body.style.removeProperty('will-change')
				body.style.removeProperty('overflow')
				window.scrollTo({top: scrollY, behavior: 'instant'})
			})
		}

	}, timeout)
}

export function tryRemoveSplashScreen(timeout: number = 0): void {
	const body = document.body
	++COMPONENT_COUNT
	if (COMPONENT_COUNT_MAX === null) COMPONENT_COUNT_MAX = safeNumber(
		Number.parseFloat(body.getAttribute(BodyAttributes.componentCount) ?? '0')
	)

	if (COMPONENT_COUNT >= COMPONENT_COUNT_MAX) {
		removeSplashScreen(timeout)
		body.removeAttribute(BodyAttributes.componentCount)
	}
}