import { AnimationEffectTiming } from "@/enums/animation"
import { BodyAttributes } from "@/enums/attributes"
import { ElementIds } from "@/enums/ids"
import { attrGet, attrRemove } from "@/utils/attributes"
import { documentBody } from "@/utils/document"
import { elementAnimate, elementRemove, elementById } from "@/utils/element"
import { numberParse, numberSafe } from "@/utils/number"
import { promiseDone } from "@/utils/object"
import { timeTimerSet } from "@/utils/time"

let COMPONENT_COUNT: number = 0
let COMPONENT_COUNT_MAX: number | null = null

export function removeSplashScreen(timeout: number = 0): void {
	timeTimerSet(() => {
		const splashRef = elementById(ElementIds.splash)
		if (!splashRef) return;

		promiseDone(elementAnimate(
			splashRef,
			{opacity: 0},
			{duration: 200, easing: AnimationEffectTiming.spring}
		).finished, () => {
			elementRemove(splashRef)
			attrRemove(documentBody(), BodyAttributes.componentCount)
		})
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