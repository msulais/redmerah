import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import database from "./_core/_database"
import converter from "./_core/_converter"
import { removeSplashScreen } from "@/utils/splash"

function main() {
	appbar()
	settings()
	database()
	converter()
	removeSplashScreen()
}

main()