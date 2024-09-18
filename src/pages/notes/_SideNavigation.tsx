import SideNavigation, { SideNavigationItem } from "@/components/SideNavigation"
import type { VoidComponent } from "solid-js"

const _: VoidComponent = () => {
    return (<SideNavigation>
        <SideNavigationItem iconOnly iconCode={0xE123}>Note 1</SideNavigationItem>
    </SideNavigation>)
}

export default _