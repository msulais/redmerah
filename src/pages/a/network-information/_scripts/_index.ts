import appbar from "./_core/_appbar"
import network from "./_core/_network"
import settings from "./_core/_settings"
import { removeSplashScreen } from "@/utils/splash"

function main(): void {
	appbar()
	settings()
	network()
	removeSplashScreen()
}

main()