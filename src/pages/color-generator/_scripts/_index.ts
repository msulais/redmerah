import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import colors from "./_core/_colors"
import database from "./_core/_database"
import { removeSplashScreen } from "@/utils/splash"

function _main(): void {
	appbar()
	settings()
	colors()
	database()
	removeSplashScreen()
}

_main()