import { onMount, type VoidComponent } from "solid-js"
import { removeSplashScreen } from "@/scripts/splash"

import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	onMount(() => {
		removeSplashScreen()
	})

	return (<App
		c:appBar={<AppBar/>}>
		<Body/>
	</App>)
}

export default _