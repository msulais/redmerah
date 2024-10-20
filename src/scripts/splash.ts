import { _splash, _animate, _spring, _finished, _then, _remove } from "@/constants/string"
import { AnimationEffectTiming } from "@/enums/animation"
import { ElementIds } from "@/enums/ids"
import { getElementById } from "@/utils/element"
import { setTimeDelayed } from "@/utils/timeout"

export function removeSplashScreen(): void {
	setTimeDelayed(() => {
		const splash_ref = getElementById(ElementIds[_splash])
		splash_ref?.[_animate](
			{opacity: 0},
			{
				duration: 1000,
				easing: AnimationEffectTiming[_spring]
			}
		)[_finished][_then](() => splash_ref[_remove]())
	}, 1500)
}