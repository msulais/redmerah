import matter from "gray-matter"
import { marked } from "marked"
import type { HTMLmd, Heading } from "@/types/articles"
import { string_match, string_matchall, string_replace } from "./string"
import { array_push } from "./array"

export async function markdown_to_html<T = object>(markdown: string): Promise<HTMLmd<T>> {
	const markdown_data = matter(markdown)
	const content = fix_article_sections(await marked(markdown_data.content))

	return {
		content,
		headings: get_headings(content),
		data: markdown_data.data,
	}
}

export function fix_article_sections(article: string): string {
	article = string_replace(article, /<table/gs, "<div style='overflow-x: auto;'><table")
	article = string_replace(article, /<\/[^>]*?table.*?>/gs, "</table></div>")
	article = string_replace(article, /<h(?=1|2|3|4|5|6)/g, "</section><section><h")
	article = string_replace(article, /<section><\/section>/g, "")

	if (string_match(article, /<section>/)) article += "</section>"
	return article
}

export function get_headings(article: string): Heading[] {
	const headings: Heading[] = []
	const regex = /<(h[123456])[^>]*?id=["'](.+?)["'].*?>(.*?)<\/[^>]*?h[123456].*?>/gs

	for (const heading of [...string_matchall(article, regex)]) array_push(headings, {
		element: heading[1],
		id: heading[2],
		content: heading[3],
	})

	return headings
}