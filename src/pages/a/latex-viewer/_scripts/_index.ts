import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import latex from "./_core/_latex"
import database from "./_core/_database"
import { removeSplashScreen } from "@/utils/splash"

function main() {
	appbar()
	settings()
	latex()
	database()
	removeSplashScreen()
}

main()