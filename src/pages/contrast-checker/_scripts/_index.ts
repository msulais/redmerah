import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import { removeSplashScreen } from "@/utils/splash"

function main(): void {
	appbar()
	settings()
	removeSplashScreen()
}

main()