import basic from "./_features/_basic"
import scientific from "./_features/_scientific"
import converter from "./_features/_converter"
import programmer from "./_features/_programmer"
import settings from './_core/_settings'
import navigation from "./_core/_navigation"
import appbar from './_core/_appbar'
import keyInput from "./_core/_key-input"
import commands from "./_core/_commands"
import memory from "./_core/_memory"
import date from "./_features/_date"
import database from "./_core/_database"
import { removeSplashScreen } from "@/utils/splash"

function _main(): void {
	appbar()
	basic()
	settings()
	scientific()
	converter()
	programmer()
	navigation()
	keyInput()
	commands()
	memory()
	date()
	database()
	removeSplashScreen()
}

_main()