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

		const animationOption = {duration: 250, easing: AnimationEffectTiming.springInverse}
		splashRef.animate({
			scale: [1, .9],
			borderRadius: ['0', '8px'],
			opacity: [1, 0]
		}, {...animationOption, delay: 250}).finished.then(() => splashRef.remove())
		imgRef?.animate({
			scale: 0,
			opacity: 0
		}, animationOption).finished.then(() => imgRef.remove())
	}, timeout)
}