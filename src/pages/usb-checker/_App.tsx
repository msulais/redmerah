import { onMount, type VoidComponent } from "solid-js"
import { remove_splash_screen } from "@/scripts/splash"

import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	onMount(() => {
		remove_splash_screen(1000)
	})

	return (<App
		c_appbar={<AppBar/>}>
		<Body/>
	</App>)
}

export default _