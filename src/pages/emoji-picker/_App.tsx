import type { VoidComponent } from "solid-js";

import App from "@/components/App";
import AppBar from './_AppBar'

const _: VoidComponent = () => {
	return (<App appBar={<AppBar/>}>

	</App>)
}

export default _