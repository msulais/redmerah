import appbar from "./_core/_appbar"
import settings from "./_core/_settings"
import database from "./_core/_database"
import navigation from "./_core/_navigation"
import inputNumber from "./_core/_input-number"
import angle from "./_features/_angle"
import time from "./_features/_time"
import length from "./_features/_length"

function main() {
	appbar()
	settings()
	database()
	navigation()
	inputNumber()
	angle()
	time()
	length()
}

main()