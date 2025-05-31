import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import colors from "./_core/_colors"
import database from "./_core/_database"

function _main(): void {
	appbar()
	settings()
	colors()
	database()
}

_main()