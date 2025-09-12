import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import escaper from "./_core/_escaper"
import database from "./_core/_database"
import { removeSplashScreen } from "@/utils/splash"

function main() {
	appbar()
	settings()
	escaper()
	database()
	removeSplashScreen()
}

main()