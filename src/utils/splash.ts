import { GlobalElementIds } from "@/enums/ids"

export function removeSplashScreen(timeout: number = 0): void {
	const splashRef = document.getElementById(GlobalElementIds.splash)
	if (!splashRef) {return}

	const imgRef = splashRef.querySelector('svg')
	setTimeout(() => {
		imgRef?.remove()
		splashRef.remove()
	}, timeout)
}