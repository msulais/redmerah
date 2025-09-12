import appbar from "./_core/_appbar"
import compass from "./_core/_compass"
import settings from "./_core/_settings"
import { removeSplashScreen } from "@/utils/splash"

function main(): void {
	appbar()
	settings()
	compass()
	removeSplashScreen()
}

main()