import { children, createMemo, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { joinClassList } from "@/utils/attributes"

import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

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

	// hack to solve https://github.com/solidjs/solid/issues/2130
	const getInteractiveElement = createMemo(() => typeof interactiveElement() === 'boolean'
		? undefined
		: interactiveElement() as string | HTMLElement[]
	)
	const leading = children(() => props['c:leading'])
	const headline = children(() => props['c:headline'])
	const trailing = children(() => props['c:trailing'])
	const C = () => (<>
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
	</>)

	return (<Show
		when={interactiveElement() === false}
		fallback={<FocusableGroup
			c:arrowOptions={{
				left: 'prev',
				right: 'next'
			}}
			c:elements={getInteractiveElement()}
			class={joinClassList('c-appbar', props.class ?? '')}
			{...other}>
			<C/>
		</FocusableGroup>}>
		<div
			class={joinClassList('c-appbar', props.class ?? '')}
			{...other}>
			<C/>
		</div>
	</Show>)
}

export default AppBar