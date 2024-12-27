import { children, createEffect, Show, splitProps, type JSX, type ParentComponent } from "solid-js"

import { classlist } from "@/utils/attributes"
import { element_children, element_focus_by_arrowkey, element_set_tabindex, element_tagname } from "@/utils/element"
import { document_active } from "@/utils/document"
import { event_current_target } from "@/utils/event"

import './index.scss'

type AppBarProps = JSX.HTMLAttributes<HTMLDivElement> & {
	leading?: JSX.Element
	trailing?: JSX.Element
	headline?: JSX.Element
}

const AppBar: ParentComponent<AppBarProps> = ($props) => {
	const [props, other] = splitProps($props, [
		'children', 'leading', 'trailing', 'headline',
		'class'
	])
	const leading = children(() => props.leading)
	const headline = children(() => props.headline)
	const trailing = children(() => props.trailing)
	let div_trailing_ref: HTMLDivElement | undefined

	createEffect(() => {
		trailing()
		if (!div_trailing_ref) return

		let is_no_tabindex_0 = true
		const children = element_children<HTMLButtonElement>(div_trailing_ref)
		for (const child of children) {
			const tag_name = child.tagName
			if (tag_name != 'A' && tag_name != 'BUTTON') continue
			if (tag_name == 'BUTTON' && child.disabled) continue
			if (is_no_tabindex_0) {
				element_set_tabindex(child, 0)
				is_no_tabindex_0 = false
				continue
			}

			element_set_tabindex(child, -1)
		}
	})

	return (<div
		class={classlist('c-appbar', props.class ?? '')}
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
			<div
				class="c-appbar-trailing"
				ref={div_trailing_ref}
				onKeyDown={ev => {
					const active = document_active()
					if (!active) return

					const tag_name = element_tagname(active)
					if (tag_name == 'INPUT' || tag_name == 'TEXTAREA') return

					element_focus_by_arrowkey(
						event_current_target(ev),
						ev.code,
						{ left: 'prev', right: 'next' },
						(el) => element_tagname(el) != 'INPUT' && element_tagname(el) != 'TEXTAREA'
					)
				}}>
				{trailing()}
			</div>
		</Show>
	</div>)
}

export default AppBar