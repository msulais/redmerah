import { createSignal, onMount, type VoidComponent } from "solid-js"

import { Commands, Pages } from "./_enums"
import { _animate, _button, _finished, _remove, _splash, _spring, _then } from "@/constants/string"
import { AnimationEffectTiming } from "@/enums/animation"
import { ElementIds } from "@/enums/ids"
import { getElementById } from "@/utils/element"
import { setMicrotask } from "@/utils/timeout"

import App from "@/components/App"
import AppBar from './_AppBar'
import SideNavigation from './_SideNavigation'
import Body from './_Body'
import CSS from './_styles.module.scss'

const _: VoidComponent = () => {
    const [page, setPage] = createSignal<Pages>(Pages[_button])
    function command(type: Commands, ...args: unknown[]): unknown {
        if (type == Commands.change_page) {
            setPage(args[0] as Pages)
        }
        return
    }

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
        class={CSS.app}
        appBar={<AppBar
            page={page()}
            command={command}
        />}
        leftSideBar={<SideNavigation
            page={page()}
            command={command}
        />}>
        <Body page={page()}/>
    </App>)
}

export default _