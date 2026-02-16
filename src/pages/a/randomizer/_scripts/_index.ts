import settings from './_core/_settings'
import navigation from "./_core/_navigation"
import appbar from './_core/_appbar'
import lists from './_core/_lists'
import generator from './_core/_generator'
import colors from './_features/_colors'
import numbers from './_features/_numbers'
import selection from './_features/_selection'
import string from './_features/_string'
import teams from './_features/_teams'
import words from './_features/_words'
import database from './_core/_database'
import mediaQuery from './_core/_media-query'

function _main(): void {
	appbar()
	settings()
	navigation()
	lists()
	generator()
	colors()
	numbers()
	selection()
	string()
	teams()
	words()
	database()
	mediaQuery()
}

_main()