import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import media from "./_core/_media"
import { removeSplashScreen } from "@/utils/splash"

function main() {
	appbar()
	settings()
	media()
	removeSplashScreen()
}

main()