import { AnimationEffectTiming } from "@/enums/animation"
import { BodyAttributes } from "@/enums/attributes"
import { ElementIds } from "@/enums/ids"
import { attrGet, attrRemove } from "@/utils/attributes"
import { documentBody } from "@/utils/document"
import { elementRemove, elementById, elementStyleSet, elementStyleRemove, elementAnimate } from "@/utils/element"
import { numberParse, numberSafe } from "@/utils/number"
import { promiseDone } from "@/utils/object"
import { timeTimerSet } from "@/utils/time"
import { windowScrollTo } from "@/utils/window"

let COMPONENT_COUNT: number = 0
let COMPONENT_COUNT_MAX: number | null = null

export function removeSplashScreen(timeout: number = 0): void {
	timeTimerSet(() => {
		const splashRef = elementById(ElementIds.splash)
		if (!splashRef) return;

		const scrollY = window.scrollY // original scroll offset Y
		const animationOption = {duration: 500, easing: AnimationEffectTiming.spring}
		const body = documentBody()

		windowScrollTo({top: 0, behavior: 'instant'})
		elementRemove(splashRef)
		elementStyleSet(body, 'will-change', 'transform')
		elementStyleSet(body, 'overflow', 'hidden')
		promiseDone(
			elementAnimate(body, {
				transform: ['translateY(10vmin)', 'translateY(0)'],
			}, animationOption).finished,
			() => {
				elementStyleRemove(body, 'will-change')
				elementStyleRemove(body, 'overflow')
				windowScrollTo({top: scrollY, behavior: 'smooth'})
			}
		)
		attrRemove(documentBody(), BodyAttributes.componentCount)
	}, timeout)
}

export function tryRemoveSplashScreen(timeout: number = 0): void {
	++COMPONENT_COUNT
	if (COMPONENT_COUNT_MAX == null) COMPONENT_COUNT_MAX = numberSafe(
		numberParse(attrGet(
			documentBody(),
			BodyAttributes.componentCount
		) ?? '0'), 0
	)

	if (COMPONENT_COUNT >= COMPONENT_COUNT_MAX) {
		removeSplashScreen(timeout)
		attrRemove(documentBody(), BodyAttributes.componentCount)
	}
}