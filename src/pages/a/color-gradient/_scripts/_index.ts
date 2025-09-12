import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import body from "./_core/_body"
import gradients from "./_core/_gradients"
import preview from "./_core/_preview"
import savedGradients from "./_core/_saved-gradients"
import database from "./_core/_database"
import { removeSplashScreen } from "@/utils/splash"

function main(): void {
	appbar()
	settings()
	body()
	gradients()
	preview()
	savedGradients()
	database()
	removeSplashScreen()
}

main()