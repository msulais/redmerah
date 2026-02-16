import { GlobalElementIds } from "@/enums/ids"

// TODO: use 'load' event instead
export function removeSplashScreen(timeout: number = 0): void {
	const splashRef = document.getElementById(GlobalElementIds.splash)
	if (!splashRef) {return}

	const imgRef = splashRef.querySelector('svg')
	setTimeout(() => {
		imgRef?.remove()
		splashRef.remove()
	}, timeout)
}