import matter from "gray-matter"
import { marked } from "marked"
import type { HTMLmd, Heading } from "@/types/articles"
import { _content, _data, _match, _matchAll, _push, _replace } from "@/constants/string"

export async function markdownToHTML<T = object>(markdown: string): Promise<HTMLmd<T>> {
	const markdownData = matter(markdown)
	const content = fixArticleSections(await marked(markdownData[_content]))

	return {
		content,
		headings: getHeadings(content),
		data: markdownData[_data],
	}
}

export function fixArticleSections(article: string): string {
	article = (article
		[_replace](/<table/gs, "<div style='overflow-x: auto;'><table")
		[_replace](/<\/[^>]*?table.*?>/gs, "</table></div>") // Avoid <table> overflow-x
		[_replace](/<h(?=1|2|3|4|5|6)/g, "</section><section><h")
		[_replace](/<section><\/section>/g, "")
	)

	if (article[_match](/<section>/)) article += "</section>"
	return article
}

export function getHeadings(article: string): Heading[] {
	const headings: Heading[] = []
	const regex = /<(h[123456])[^>]*?id=["'](.+?)["'].*?>(.*?)<\/[^>]*?h[123456].*?>/gs

	for (const heading of [...article[_matchAll](regex)]) headings[_push]({
		element: heading[1],
		id: heading[2],
		content: heading[3],
	})

	return headings
}