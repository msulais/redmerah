import { type VoidComponent } from "solid-js"

import { Page, Playground, PlaygroundOptions } from "../_Body"
import Emoji from "@/components/Emoji"

const _: VoidComponent = () => {
    return (<Page
        title="Emoji"
        description="An emoji is a small, expressive graphic symbol used to represent emotions, objects, or ideas. Emojis are often used in digital communication to convey feelings or add context to messages. They are similar to icons in that they are small, graphic representations, but they are specifically designed to express emotions or ideas.">
        <Playground>
            <Emoji emoji="😊"/>
            <Emoji emoji="🤣"/>
            <Emoji emoji="🙌"/>
            <Emoji emoji="💕"/>
            <Emoji emoji="👌"/>
            <Emoji emoji="🍞"/>
            <Emoji emoji="🚚"/>
        </Playground>
        <PlaygroundOptions>
        </PlaygroundOptions>
    </Page>)
}

export default _