import { children, type JSX, type ParentComponent, splitProps, type ValidComponent } from "solid-js"
import { Dynamic, type DynamicProps } from "solid-js/web"

import { toggleAttribute } from '@/utils/attributes'
import { _leading, _children, _trailing, _subtitle, _compact, _class } from "@/constants/string"

import './index.scss'

type ListProps = JSX.HTMLAttributes<HTMLDivElement> & {
	leading?: JSX.Element
	subtitle?: JSX.Element
	trailing?: JSX.Element
}
const List: ParentComponent<ListProps> = ($props) => {
	const [props, other] = splitProps($props, [_leading, _children, _trailing, _subtitle, _class])
	const trailingComponent = children(() => props[_trailing])

	return (<div
		class={'list' + (props[_class] != null? ` ${props[_class]}` : '')}
		data-trailing={toggleAttribute(trailingComponent())}
		{...other}>
		<div class='list-leading'>{props[_leading]}</div>
		<div class='list-content'>
			<div class='list-title'>{props[_children]}</div>
			<div class='list-subtitle'>{props[_subtitle]}</div>
		</div>
		<div class='list-trailing'>{trailingComponent()}</div>
	</div>)
}

type RawListProps<T extends ValidComponent = keyof JSX.HTMLElementTags> = DynamicProps<T> & {
	leading?: JSX.Element
	subtitle?: JSX.Element
	trailing?: JSX.Element
}
const RawList: ParentComponent<RawListProps> = ($props) => {
	const [props, other] = splitProps($props, [_leading, _children, _trailing, _subtitle, _class])
	const trailingComponent = children(() => props[_trailing])

	return (<Dynamic
		class={'list' + (props[_class] != null? ` ${props[_class]}` : '')}
		data-trailing={toggleAttribute(trailingComponent())}
		{...other}>
		<div class='list-leading'>{props[_leading]}</div>
		<div class='list-content'>
			<div class='list-title'>{props[_children]}</div>
			<div class='list-subtitle'>{props[_subtitle]}</div>
		</div>
		<div class='list-trailing'>{trailingComponent()}</div>
	</Dynamic>)
}

export {
	List,
	RawList
}
export type {
	ListProps,
	RawListProps
}
export default List