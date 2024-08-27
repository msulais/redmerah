import { For, type VoidComponent } from "solid-js";

import { _command, _expand, _icon, _page, _text, _type } from "@/data/string";
import { addClassListModule } from "@/utils/element";
import { Commands, Pages } from "./_enums";

import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation";
import CSS from './_styles.module.scss'
import { PAGES } from "./_data";

const _: VoidComponent<{
    page: Pages
    command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
    return (<SideNavigation
        style={{"padding-top": '0'}}
        classList={addClassListModule(CSS.side_navigation)}
        expand={true}>
        <For each={PAGES}>{page => 
            <SideNavigationItem 
                desktopCompact 
                onClick={() => props[_command](Commands.change_page, page[_type])}
                selected={props[_page] == page[_type]}>
                {page[_text]}
            </SideNavigationItem>
        }</For>
    </SideNavigation>)
}

export default _