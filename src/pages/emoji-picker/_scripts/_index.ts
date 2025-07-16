import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import navigation from "./_core/_navigation"
import body from "./_core/_body"
import search from "./_core/_search"
import database from "./_core/_database"
import { removeSplashScreen } from "@/utils/splash"

function _main(): void {
	appbar()
	settings()
	navigation()
	body()
	search()
	database()
	removeSplashScreen()
}

_main()