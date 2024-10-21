import { _splash, _animate, _spring, _finished, _then, _remove, _componentCount, _componentCountMax } from "@/constants/string"
import { getDocumentBody } from "@/constants/window"
import { AnimationEffectTiming } from "@/enums/animation"
import { BodyAttributes } from "@/enums/attributes"
import { ElementIds } from "@/enums/ids"
import { getAttribute, setAttribute } from "@/utils/attributes"
import { getElementById } from "@/utils/element"
import { numberParse, safeNumber } from "@/utils/math"
import { setTimeDelayed } from "@/utils/timeout"

export function removeSplashScreen(timeout: number = 0): void {
	setTimeDelayed(() => {
		const splash_ref = getElementById(ElementIds[_splash])
		splash_ref?.[_animate](
			{opacity: 0},
			{
				duration: 300,
				easing: AnimationEffectTiming[_spring]
			}
		)[_finished][_then](() => splash_ref[_remove]())
	}, timeout)
}

export function removeSplashScreenOnLoadEveryComponent(timeout: number = 0): void {
	const componentCount = safeNumber(
		numberParse(getAttribute(
			getDocumentBody(),
			BodyAttributes[_componentCount]
		) ?? '0'), 0
	) + 1
	const componentCountMax = safeNumber(
		numberParse(getAttribute(
			getDocumentBody(),
			BodyAttributes[_componentCountMax]
		) ?? '0'), 0
	)
	setAttribute(getDocumentBody(), BodyAttributes[_componentCount], `${componentCount}`)
	if (componentCount >= componentCountMax) removeSplashScreen(timeout)
}