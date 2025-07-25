import { AnimationEffectTiming } from "@/enums/animation"
import { GlobalElementIds } from "@/enums/ids"
import { isAnimationAllowed } from "@/utils/animation"

export function removeSplashScreen(timeout: number = 0): void {
	const splashRef = document.getElementById(GlobalElementIds.splash)
	if (!splashRef) {return}

	const imgRef = splashRef.querySelector('svg')
	setTimeout(() => {
		if (!isAnimationAllowed()) {
			imgRef?.remove()
			splashRef.remove()
			return
		}

		const options = {
			duration: 250,
			easing: AnimationEffectTiming.springInverse
		}
		splashRef.animate(
			{opacity: 0},
			{...options, delay: options.duration}
		).finished.then(() => splashRef.remove())
		imgRef?.animate({
			scale: .5,
			opacity: 0
		}, options).finished.then(() => imgRef.remove())
	}, timeout)
}