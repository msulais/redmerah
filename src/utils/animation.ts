import { RootAttributes } from "@/enums/attributes"
import { AnimationData } from "@/enums/animation"

export function animationIsOn(): boolean {
	const animation = document.documentElement.getAttribute(RootAttributes.animation)
	return (
		animation === AnimationData.on
		|| (
			animation === AnimationData.system
			&& window.matchMedia('(prefers-reduced-motion: no-preference)').matches
		)
	)
}