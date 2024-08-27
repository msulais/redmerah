import { createSignal, type VoidComponent } from "solid-js"

import { Commands, Pages } from "./_enums"
import { _button } from "@/data/string"

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