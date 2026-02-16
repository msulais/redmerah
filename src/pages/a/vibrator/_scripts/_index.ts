import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import vibrator from "./_core/_vibrator"
import database from "./_core/_database"

function main(): void {
	appbar()
	settings()
	vibrator()
	database()
}

main()