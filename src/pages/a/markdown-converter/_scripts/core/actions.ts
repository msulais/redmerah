import * as Ids from '../shared/ids.enum.js'
import * as Markdown from './markdown.js'
import * as Constant from '../shared/constant.enum.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { $ } from './dom-utils.js'
import { downloadFile, pickFile, readFileAsText } from '@/utils/file'

const _ref_openFile         = $(Ids.PopoverAppBarMoreOpenFile) as HTMLButtonElement
const _ref_print            = $(Ids.PopoverAppBarMorePrint) as HTMLButtonElement
const _ref_resetMarkdown    = $(Ids.PopoverAppBarMoreResetMarkdown) as HTMLButtonElement
const _ref_resetCSS         = $(Ids.PopoverAppBarMoreResetCSS) as HTMLButtonElement
const _ref_copyMarkdown     = $(Ids.PopoverAppBarMoreCopyMarkdown) as HTMLButtonElement
const _ref_copyHTML         = $(Ids.PopoverAppBarMoreCopyHTML) as HTMLButtonElement
const _ref_copyCSS          = $(Ids.PopoverAppBarMoreCopyCSS) as HTMLButtonElement
const _ref_downloadMarkdown = $(Ids.PopoverAppBarMoreDownloadMarkdown) as HTMLButtonElement
const _ref_downloadHTML     = $(Ids.PopoverAppBarMoreDownloadHTML) as HTMLButtonElement
const _ref_downloadCSS      = $(Ids.PopoverAppBarMoreDownloadCSS) as HTMLButtonElement
const _ref_outputPreview    = $(Ids.OutputPreview) as HTMLIFrameElement

function _initEvents(): void {
	delegateEvent(_ref_openFile, 'click', () => {
		pickFile('text/*', true).then(async (files) => {
			if (files == null || files.length == 0) {
				return
			}

			let text: string = ''
			try {
				for (let i = 0; i < files.length; i++) {
					if (i > 0) text += '\n\n'

					const file = files[i]!
					text += await readFileAsText(file)
				}
			} catch {
				alert("Unable reading selected file")
				return
			}

			Markdown.sg_markdown.set(text)
		})
	})

	delegateEvent(_ref_print, 'click', () => {
		_ref_outputPreview.contentWindow?.print()
	})

	delegateEvent(_ref_resetMarkdown, 'click', () => {
		Markdown.sg_markdown.set(Constant.DEFAULT_MARKDOWN_TEXT)
	})

	delegateEvent(_ref_resetCSS, 'click', () => {
		Markdown.sg_css.set(Constant.DEFAULT_CSS_TEXT)
	})

	delegateEvent(_ref_copyMarkdown, 'click', () => {
		navigator.clipboard.writeText(Markdown.sg_markdown())
	})

	delegateEvent(_ref_copyHTML, 'click', () => {
		navigator.clipboard.writeText(Markdown.sg_html())
	})

	delegateEvent(_ref_copyCSS, 'click', () => {
		navigator.clipboard.writeText(Markdown.sg_css())
	})

	delegateEvent(_ref_downloadMarkdown, 'click', () => {
		downloadFile(new Blob([Markdown.sg_markdown()]), 'markdown.md')
	})

	delegateEvent(_ref_downloadHTML, 'click', () => {
		downloadFile(new Blob([Markdown.sg_html()]), 'page.html')
	})

	delegateEvent(_ref_downloadCSS, 'click', () => {
		downloadFile(new Blob([Markdown.sg_css()]), 'style.css')
	})

}

export default () => {
	_initEvents()
}