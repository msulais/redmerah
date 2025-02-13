import { children, createMemo, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { attrClassList } from "@/utils/attributes"

import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'
import { typeIsBoolean } from "@/utils/typecheck"

type AppBarProps = JSX.HTMLAttributes<HTMLDivElement> & {
	'c:interactiveElements'?: string | HTMLElement[] | boolean
	'c:leading'?: JSX.Element
	'c:trailing'?: JSX.Element
	'c:headline'?: JSX.Element
}

const AppBar: ParentComponent<AppBarProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'children', 'c:leading', 'c:trailing', 'c:headline',
		'class', 'c:interactiveElements'
	])
	const interactiveElement = createMemo(() => props["c:interactiveElements"])
	const leading = children(() => props['c:leading'])
	const headline = children(() => props['c:headline'])
	const trailing = children(() => props['c:trailing'])
	const C = () => (<div
		class={attrClassList('c-appbar', props.class ?? '')}
		{...other}>
		<Show when={leading()}>
			<div class="c-appbar-leading">{leading()}</div>
		</Show>
		<div class="c-appbar-headline">
			<Show when={headline()}>
				<h2>{headline()}</h2>
			</Show>
			{props.children}
		</div>
		<Show when={trailing()}>
			<div class="c-appbar-trailing">
				{trailing()}
			</div>
		</Show>
	</div>)

	return (<Show
		when={interactiveElement() === false}
		fallback={<FocusableGroup
			c:arrowOptions={{
				left: 'prev',
				right: 'next'
			}}
			c:elements={typeIsBoolean(interactiveElement())
				? undefined
				: interactiveElement() as string | HTMLElement[]
			}>
			<C/>
		</FocusableGroup>}>
		<C/>
	</Show>)
}

export default AppBar