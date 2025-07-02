import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import minify from "./_core/_minify"
import database from "./_core/_database"

function main() {
	appbar()
	settings()
	minify()
	database()
}

main()