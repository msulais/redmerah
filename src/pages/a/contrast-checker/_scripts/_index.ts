import appbar from "./_core/_appbar"
import checker from "./_core/_checker"
import database from "./_core/_database"
import settings from "./_core/_settings"

function main(): void {
	appbar()
	settings()
	checker()
	database()
}

main()