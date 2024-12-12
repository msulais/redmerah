import { onMount, type VoidComponent } from "solid-js"

import { remove_splash_screen } from "@/scripts/splash"

import AppBar from './_AppBar'
import App from "@/components/App"

const _: VoidComponent = () => {

	onMount(() => {
		remove_splash_screen()
	})

	return (<App
		appbar={<AppBar />}
	/>)
}

export default _