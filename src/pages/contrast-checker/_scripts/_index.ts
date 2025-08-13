import appbar from "./_core/_appbar"
import checker from "./_core/_checker"
import settings from "./_core/_settings"
import { removeSplashScreen } from "@/utils/splash"

function main(): void {
	appbar()
	settings()
	checker()
	removeSplashScreen()
}

main()