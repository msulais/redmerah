import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import navigation from "./_core/_navigation"
import clock from './_features/_clock'
import timer from "./_features/_timer"
import stopwatch from './_features/_stopwatch'
import database from "./_core/_database"

function main(): void {
	appbar()
	settings()
	navigation()
	clock()
	timer()
	stopwatch()
	database()
}

main()