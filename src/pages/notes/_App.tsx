import { onMount, type VoidComponent } from "solid-js"

import { _splash, _animate, _spring, _finished, _then, _remove } from "@/constants/string"
import { AnimationEffectTiming } from "@/enums/animation"
import { ElementIds } from "@/enums/ids"
import { getElementById } from "@/utils/element"
import { setMicrotask } from "@/utils/timeout"

import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'
import SideNavigation from './_SideNavigation'

const _: VoidComponent = () => {
    function removeSplashScreen(): void {
        setMicrotask(() => {
            const splash_ref = getElementById(ElementIds[_splash]) as HTMLDivElement
            splash_ref[_animate](
                {opacity: 0},
                {
                    duration: 1000,
                    easing: AnimationEffectTiming[_spring]
                }
            )[_finished][_then](() => splash_ref[_remove]())
        })
    }

    onMount(() => {
        removeSplashScreen()
    })

    return (<App
        appBar={<AppBar/>}
        leftSideBar={<SideNavigation/>}>
        <Body/>
    </App>)
}

export default _