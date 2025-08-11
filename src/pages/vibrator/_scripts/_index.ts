import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import { removeSplashScreen } from "@/utils/splash"
import vibrator from "./_core/_vibrator"

function main(): void {
	appbar()
	settings()
	vibrator()
	removeSplashScreen()
}

main()