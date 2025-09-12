import appbar from "./_core/_appbar"
import geolocation from "./_core/_geolocation"
import settings from "./_core/_settings"
import { removeSplashScreen } from "@/utils/splash"

function main(): void {
	appbar()
	settings()
	geolocation()
	removeSplashScreen()
}

main()