import appBar from './_appbar'
import navigation from './_navigation'
import body from './_body'
import { removeSplashScreen } from '@/utils/splash'

function main(): void {
	appBar()
	navigation()
	body()
	removeSplashScreen()
}

main()