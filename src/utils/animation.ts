import { RootAttributes } from "@/enums/attributes"
import { PlatformAnimationMode } from "@/enums/platforms"

/**
 * @deprecated
 */
export function isAnimationAllowed(): boolean {
	const animation = document.documentElement.getAttribute(RootAttributes.Animation)
	return (
		animation === PlatformAnimationMode.On
		|| (
			animation === PlatformAnimationMode.Auto
			&& window.matchMedia('(prefers-reduced-motion: no-preference)').matches
		)
	)
}