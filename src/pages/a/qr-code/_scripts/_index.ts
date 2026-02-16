import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import database from "./_core/_database"
import navigation from "./_core/_navigation"
import generate from "./_features/_generate"
import scan from "./_features/_scan"

function main() {
	appbar()
	settings()
	database()
	navigation()
	generate()
	scan()
}

main()