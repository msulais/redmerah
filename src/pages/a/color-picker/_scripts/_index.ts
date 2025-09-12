import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import picker from "./_core/_picker"
import database from "./_core/_database"
import { removeSplashScreen } from "@/utils/splash"

function main(): void {
	appbar()
	settings()
	picker()
	database()
	removeSplashScreen()
}

main()