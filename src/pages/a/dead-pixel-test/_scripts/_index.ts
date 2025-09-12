import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import test from "./_core/_test"
import { removeSplashScreen } from "@/utils/splash"

function main(): void {
	appbar()
	test()
	settings()
	removeSplashScreen()
}

main()