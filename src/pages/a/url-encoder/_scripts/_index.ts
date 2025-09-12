import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import decoder from "./_core/_decoder"
import database from "./_core/_database"
import { removeSplashScreen } from "@/utils/splash"

function main() {
	appbar()
	settings()
	decoder()
	database()
	removeSplashScreen()
}

main()