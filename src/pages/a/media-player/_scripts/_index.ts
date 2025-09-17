import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import media from "./_core/_media"
import { removeSplashScreen } from "@/utils/splash"
import mediaQuery from "./_core/_media-query"

function main() {
	appbar()
	settings()
	media()
	mediaQuery()
	removeSplashScreen()
}

main()