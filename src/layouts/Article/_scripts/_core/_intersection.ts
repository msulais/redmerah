import { AnimationEasing } from "@/enums/animation"
import { CSSClasses } from "../../_styles/_css"
import { pxToRem } from "@/utils/css"
import { isAnimationAllowed } from "@/utils/animation"

const _refs = ([] as Element[]).concat(
	document.querySelectorAll(`.${CSS.escape(CSSClasses.header)}>*`).values().toArray(),
	document.querySelectorAll(`.${CSS.escape(CSSClasses.body)}>:not(section)`).values().toArray(),
	document.querySelectorAll(`.${CSS.escape(CSSClasses.body)} section>:not(section)`).values().toArray(),
)

function _initObserver(): void {
	const targets = new Set<HTMLElement>()
	const intersection = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				const ref_target = entry.target as HTMLElement
				if (targets.has(ref_target)) {
					continue
				}

				ref_target.style.setProperty('opacity', '1')
				if (isAnimationAllowed()){
					ref_target.animate({
						opacity: [0, 1],
						translate: [`0 ${pxToRem(64)}rem`, '0 0']
					}, {
						duration: 1000,
						easing: AnimationEasing.Spring
					})
				}
				targets.add(ref_target)
			}
		}
	}, {
		root: null,
		threshold: 0
	})

	for (const ref of _refs) {
		intersection.observe(ref)
	}
}

export default () => {
	_initObserver()
}