import { removeSplashScreen } from "@/utils/splash"
import appbar from "./_core/_appbar"
import battery from "./_core/_battery"
import settings from "./_core/_settings"

function main(): void {
	appbar()
	battery()
	settings()
	removeSplashScreen()
}

main()