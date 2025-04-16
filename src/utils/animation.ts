import { RootAttributes } from "@/enums/attributes"
import { PlatformAnimationMode } from "@/enums/platforms"

export function isAnimationAllowed(): boolean {
	const animation = document.documentElement.getAttribute(RootAttributes.animation)
	return (
		animation === PlatformAnimationMode.on
		|| (
			animation === PlatformAnimationMode.auto
			&& window.matchMedia('(prefers-reduced-motion: no-preference)').matches
		)
	)
}